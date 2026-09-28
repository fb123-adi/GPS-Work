/**
 * Replaces placeholder product images with real photography.
 *
 * Put files in a folder named by the convention in scripts/imagery/catalogue.ts:
 *   <product-slug>-<colour>-<view>.(webp|jpg|jpeg|png)
 *   e.g. heavyweight-hoodie-obsidian-front.jpg, heavyweight-hoodie-obsidian-back.jpg
 * Views: front, back, detail, lifestyle. Front images come first in the gallery.
 *
 * The script converts each file to WebP (max 2000px, quality 86), writes it to
 * public/media/products/, and rebuilds product_images for every product that
 * has at least one file, with alt text from the catalogue spec. Products
 * without files keep their current images. Unknown file names are reported
 * and skipped, never guessed.
 *
 *   npx tsx --env-file-if-exists=.env.local scripts/import-images.ts ./photos
 */
import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";
import sharp from "sharp";
import { CATALOGUE, altFor, fileName, type View } from "./imagery/catalogue";

const VIEW_ORDER: View[] = ["front", "back", "detail", "lifestyle"];

async function main() {
  const dir = process.argv[2];
  if (!dir) throw new Error("Usage: import-images <folder>");
  const out = path.join(process.cwd(), "public", "media", "products");
  await mkdir(out, { recursive: true });
  const files = (await readdir(dir)).filter((f) => /\.(webp|jpe?g|png)$/i.test(f));

  type Hit = { slug: string; colourIndex: number; colour: string; view: View; src: string };
  const hits: Hit[] = [];
  for (const f of files) {
    const base = f.replace(/\.(webp|jpe?g|png)$/i, "").toLowerCase();
    let matched = false;
    for (const p of CATALOGUE) {
      p.colours.forEach((c, i) => {
        for (const v of VIEW_ORDER) {
          if (base === fileName(p.slug, c.name, v).replace(".webp", "")) {
            hits.push({ slug: p.slug, colourIndex: i, colour: c.name, view: v, src: path.join(dir, f) });
            matched = true;
          }
        }
      });
    }
    if (!matched) console.warn(`skipped (name does not match any product, colour, and view): ${f}`);
  }
  if (!hits.length) throw new Error("No matching files found.");

  const sql = postgres(process.env.DATABASE_URL!, { max: 1, onnotice: () => {} });
  try {
    for (const p of CATALOGUE) {
      const mine = hits.filter((h) => h.slug === p.slug);
      if (!mine.length) continue;
      const [prod] = await sql<{ id: string }[]>`select id from products where slug = ${p.slug}`;
      if (!prod) {
        console.warn(`no product in the database for ${p.slug}; skipped`);
        continue;
      }
      // Gallery order: hero colour first, then by view.
      mine.sort((a, b) => a.colourIndex - b.colourIndex || VIEW_ORDER.indexOf(a.view) - VIEW_ORDER.indexOf(b.view));
      const rows: { url: string; alt: string; colour: string | null; width: number; height: number }[] = [];
      for (const h of mine) {
        const name = fileName(h.slug, h.colour, h.view);
        const info = await sharp(h.src).rotate().resize({ width: 2000, height: 2500, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 86 }).toFile(path.join(out, name));
        rows.push({ url: `/media/products/${name}`, alt: altFor(p, h.colourIndex, h.view), colour: h.view === "detail" ? null : h.colour, width: info.width, height: info.height });
      }
      await sql.begin(async (tx) => {
        await tx`delete from product_images where product_id = ${prod.id}`;
        for (const [i, r] of rows.entries()) {
          await tx`insert into product_images (product_id, url, alt, colour, width, height, sort_order)
            values (${prod.id}, ${r.url}, ${r.alt}, ${r.colour}, ${r.width}, ${r.height}, ${i})`;
        }
      });
      const missing = p.colours.filter((c) => !mine.some((h) => h.colour === c.name && h.view === "front")).map((c) => c.name);
      console.log(`${p.slug}: ${rows.length} images${missing.length ? ` (no front photo yet for: ${missing.join(", ")})` : ""}`);
    }
  } finally {
    await sql.end();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
