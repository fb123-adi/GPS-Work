import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { drivers, env } from "@/lib/env";

/**
 * Image and evidence storage. Supabase Storage (CDN-backed, with image
 * transformation) in production; a local directory in development.
 * Every upload is validated by size and by magic bytes, not by the
 * browser-supplied MIME type or filename.
 */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const SIGNATURES: { mime: string; ext: string; test: (b: Buffer) => boolean }[] = [
  { mime: "image/jpeg", ext: "jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: "image/png", ext: "png", test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mime: "image/webp", ext: "webp", test: (b) => b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP" },
  { mime: "image/avif", ext: "avif", test: (b) => b.subarray(4, 12).toString() === "ftypavif" },
];

export class UploadError extends Error {}

export function sniffImage(buf: Buffer) {
  return SIGNATURES.find((s) => s.test(buf)) ?? null;
}

export async function storeImage(file: File, folder: "products" | "content" | "returns"): Promise<{ url: string; path: string; mime: string }> {
  if (!(file instanceof File) || file.size === 0) throw new UploadError("Choose an image to upload.");
  if (file.size > MAX_IMAGE_BYTES) throw new UploadError("Images must be 8 MB or smaller.");
  const buf = Buffer.from(await file.arrayBuffer());
  const kind = sniffImage(buf);
  if (!kind) throw new UploadError("Upload a JPEG, PNG, WebP, or AVIF image.");

  // Server-generated name: user-supplied filenames never touch the path.
  const objectPath = `${folder}/${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${kind.ext}`;

  if (drivers().storage === "supabase") {
    const e = env();
    const res = await fetch(`${e.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${e.SUPABASE_STORAGE_BUCKET}/${objectPath}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${e.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": kind.mime,
        "x-upsert": "false",
        "cache-control": "31536000",
      },
      body: buf,
    });
    if (!res.ok) throw new UploadError("Upload failed. Please try again.");
    // Return evidence as a private path (served through a signed route), product images as public URLs.
    const url = folder === "returns"
      ? `/api/media/${objectPath}`
      : `${e.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${e.SUPABASE_STORAGE_BUCKET}/${objectPath}`;
    return { url, path: objectPath, mime: kind.mime };
  }

  const dir = path.resolve(env().UPLOAD_DIR);
  const full = path.join(dir, objectPath);
  if (!full.startsWith(dir + path.sep)) throw new UploadError("Invalid path");
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, buf);
  return { url: `/api/media/${objectPath}`, path: objectPath, mime: kind.mime };
}

export async function readLocalObject(objectPath: string): Promise<{ body: Buffer; mime: string } | null> {
  if (!/^(products|content|returns)\/\d{4}-\d{2}\/[0-9a-f-]{36}\.(jpg|png|webp|avif)$/.test(objectPath)) return null;
  const dir = path.resolve(env().UPLOAD_DIR);
  try {
    const body = await readFile(path.join(dir, objectPath));
    const kind = sniffImage(body);
    return kind ? { body, mime: kind.mime } : null;
  } catch {
    return null;
  }
}
