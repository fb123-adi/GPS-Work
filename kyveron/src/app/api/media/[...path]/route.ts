import { readLocalObject } from "@/lib/storage";
import { drivers, env } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";

/**
 * Serves uploaded media. Product/content images are public. Return evidence
 * is private: staff with returns access only.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const objectPath = (await ctx.params).path.join("/");
  if (objectPath.startsWith("returns/")) {
    const user = await getCurrentUser();
    if (!user || !can(user.roles, "returns.manage")) return new Response("Not found", { status: 404 });
  }
  if (drivers().storage === "supabase") {
    const e = env();
    const res = await fetch(`${e.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/authenticated/${e.SUPABASE_STORAGE_BUCKET}/${objectPath}`, {
      headers: { Authorization: `Bearer ${e.SUPABASE_SERVICE_ROLE_KEY}` },
    });
    if (!res.ok) return new Response("Not found", { status: 404 });
    return new Response(res.body, { headers: { "Content-Type": res.headers.get("content-type") ?? "application/octet-stream", "Cache-Control": "private, max-age=300", "X-Content-Type-Options": "nosniff" } });
  }
  const obj = await readLocalObject(objectPath);
  if (!obj) return new Response("Not found", { status: 404 });
  const isPrivate = objectPath.startsWith("returns/");
  return new Response(new Uint8Array(obj.body), {
    headers: {
      "Content-Type": obj.mime,
      "Cache-Control": isPrivate ? "private, max-age=300" : "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'",
    },
  });
}
