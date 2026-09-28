"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { sql } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/roles";
import { audit } from "@/lib/audit";
import { storeImage, UploadError } from "@/lib/storage";
import { enforce, LIMITS } from "@/lib/security/rate-limit";
import { notifyBackInStock } from "@/lib/inventory";

export type ProductState = { ok?: boolean; message?: string; errors?: Record<string, string> } | undefined;

const slug = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers, and dashes.").max(80);
const rupees = z.coerce.number().min(0).max(1_000_000).transform((n) => Math.round(n * 100));

const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(120),
  slug,
  subtitle: z.string().trim().max(120).optional(),
  description: z.string().trim().max(5000),
  categoryId: z.union([z.literal(""), z.string().uuid()]),
  gender: z.enum(["men", "women", "unisex", "kids"]),
  material: z.string().trim().max(300).optional(),
  care: z.string().trim().max(600).optional(),
  fit: z.string().trim().max(40).optional(),
  fitNotes: z.string().trim().max(300).optional(),
  seoTitle: z.string().trim().max(70).optional(),
  seoDescription: z.string().trim().max(160).optional(),
  publishAt: z.string().optional(),
  isFeatured: z.string().optional(),
  isPerformance: z.string().optional(),
});

export async function saveProduct(_: ProductState, form: FormData): Promise<ProductState> {
  const user = await requirePermission("products.edit");
  const parsed = productSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { errors, message: "Check the highlighted fields." };
  }
  const d = parsed.data;
  const publishAt = d.publishAt ? new Date(d.publishAt) : null;
  if (publishAt && Number.isNaN(publishAt.getTime())) return { errors: { publishAt: "Invalid date." } };
  const collections = form.getAll("collections").map(String).filter((c) => z.string().uuid().safeParse(c).success);
  const [clash] = await sql`select 1 from products where slug = ${d.slug} and id <> ${d.id ?? "00000000-0000-0000-0000-000000000000"}`;
  if (clash) return { errors: { slug: "Another product already uses this URL." } };

  const values = {
    name: d.name, slug: d.slug, subtitle: d.subtitle || null, description: d.description, category_id: d.categoryId || null,
    gender: d.gender, material: d.material || null, care: d.care || null, fit: d.fit || null, fit_notes: d.fitNotes || null,
    seo_title: d.seoTitle || null, seo_description: d.seoDescription || null, publish_at: publishAt,
    is_featured: d.isFeatured === "on", is_performance: d.isPerformance === "on",
  };
  let id = d.id;
  await sql.begin(async (tx) => {
    if (id) {
      const [before] = await tx`select * from products where id = ${id} for update`;
      if (!before) throw new Error("Product not found");
      await tx`update products set ${tx(values)} where id = ${id}`;
      await audit(user.id, "product.update", "product", id, { before, after: values }, tx);
    } else {
      const [row] = await tx<{ id: string }[]>`insert into products ${tx({ ...values, status: "draft" })} returning id`;
      id = row.id;
      await audit(user.id, "product.create", "product", id, { after: values }, tx);
    }
    await tx`delete from collection_products where product_id = ${id!}`;
    for (const c of collections) await tx`insert into collection_products (collection_id, product_id) values (${c}, ${id!}) on conflict do nothing`;
  });
  refresh();
  if (!d.id) redirect(`/admin/products/${id}?created=1`);
  return { ok: true, message: "Saved." };
}

export async function setProductStatus(productId: string, status: "draft" | "published" | "archived"): Promise<{ ok: boolean; message: string }> {
  const user = await requirePermission("products.edit");
  if (!z.string().uuid().safeParse(productId).success) return { ok: false, message: "Invalid product." };
  if (status === "published") {
    const [{ v, i }] = await sql<{ v: number; i: number }[]>`select
      (select count(*)::int from product_variants where product_id = ${productId} and deleted_at is null) v,
      (select count(*)::int from product_images where product_id = ${productId}) i`;
    if (v === 0) return { ok: false, message: "Add at least one variant before publishing." };
    if (i === 0) return { ok: false, message: "Add at least one image before publishing." };
  }
  const [before] = await sql<{ status: string }[]>`select status from products where id = ${productId}`;
  await sql`update products set status = ${status} where id = ${productId}`;
  await audit(user.id, `product.${status}`, "product", productId, { before, after: { status } });
  refresh();
  return { ok: true, message: status === "published" ? "Published." : status === "archived" ? "Archived. It is hidden from the store." : "Moved to draft." };
}

/** Soft delete: keeps order history intact. */
export async function deleteProduct(productId: string, confirmSlug: string): Promise<{ ok: boolean; message: string }> {
  const user = await requirePermission("products.edit");
  const [p] = await sql<{ slug: string }[]>`select slug from products where id = ${productId} and deleted_at is null`;
  if (!p) return { ok: false, message: "Not found." };
  if (confirmSlug !== p.slug) return { ok: false, message: "Type the product URL slug exactly to confirm." };
  await sql`update products set deleted_at = now(), status = 'archived', slug = slug || '-deleted-' || substr(md5(random()::text), 1, 6) where id = ${productId}`;
  await audit(user.id, "product.delete", "product", productId, { before: p });
  redirect("/admin/products?deleted=1");
}

export async function duplicateProduct(productId: string) {
  const user = await requirePermission("products.edit");
  const newId = await sql.begin(async (tx) => {
    const [p] = await tx`select * from products where id = ${productId}`;
    if (!p) throw new Error("Not found");
    const suffix = Math.random().toString(36).slice(2, 6);
    const [n] = await tx<{ id: string }[]>`insert into products (slug, name, subtitle, description, category_id, gender, material, care, fit, fit_notes,
        seo_title, seo_description, status, is_performance)
      values (${`${p.slug}-copy-${suffix}`}, ${`${p.name} (copy)`}, ${p.subtitle}, ${p.description}, ${p.category_id}, ${p.gender}, ${p.material},
        ${p.care}, ${p.fit}, ${p.fit_notes}, ${p.seo_title}, ${p.seo_description}, 'draft', ${p.is_performance}) returning id`;
    await tx`insert into product_images (product_id, url, storage_path, alt, colour, width, height, sort_order)
      select ${n.id}, url, storage_path, alt, colour, width, height, sort_order from product_images where product_id = ${productId}`;
    await tx`insert into product_variants (product_id, sku, size, colour, colour_hex, price_minor, compare_at_minor, cost_minor, stock_on_hand, low_stock_threshold, sort_order)
      select ${n.id}, sku || '-C' || ${suffix.toUpperCase()}, size, colour, colour_hex, price_minor, compare_at_minor, cost_minor, 0, low_stock_threshold, sort_order
      from product_variants where product_id = ${productId} and deleted_at is null`;
    await tx`insert into collection_products (collection_id, product_id) select collection_id, ${n.id} from collection_products where product_id = ${productId}`;
    await audit(user.id, "product.duplicate", "product", n.id, { after: { from: productId } }, tx);
    return n.id;
  });
  redirect(`/admin/products/${newId}?duplicated=1`);
}

const variantSchema = z.object({
  id: z.string().uuid().optional(),
  sku: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,40}$/, "SKU: 3-40 letters, numbers, dashes."),
  size: z.string().trim().min(1).max(12),
  colour: z.string().trim().min(1).max(30),
  colourHex: z.union([z.literal(""), z.string().regex(/^#[0-9a-fA-F]{6}$/)]),
  price: rupees,
  compareAt: z.union([z.literal(""), rupees]),
  cost: z.union([z.literal(""), rupees]).optional(),
  lowStockThreshold: z.coerce.number().int().min(0).max(1000),
  isAvailable: z.boolean(),
  remove: z.boolean().optional(),
});

/**
 * Upserts variants. Stock is NOT edited here: new variants start at 0 and
 * stock moves only through inventory adjustments (with a reason and log).
 */
export async function saveVariants(productId: string, rows: unknown[]): Promise<{ ok: boolean; message: string }> {
  const user = await requirePermission("products.edit");
  const canCost = can(user.roles, "products.cost.view");
  const parsed = z.array(variantSchema).max(200).safeParse(rows);
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { ok: false, message: `Row ${Number(i.path[0]) + 1}: ${i.message}` };
  }
  for (const v of parsed.data) {
    if (v.compareAt !== "" && v.compareAt <= v.price) return { ok: false, message: `${v.sku}: compare-at price must be higher than the price.` };
  }
  const restockIds: string[] = [];
  try {
    await sql.begin(async (tx) => {
      for (const v of parsed.data) {
        const compare = v.compareAt === "" ? null : v.compareAt;
        if (v.id && v.remove) {
          await tx`update product_variants set deleted_at = now(), is_available = false, sku = sku || '-DEL-' || substr(md5(random()::text), 1, 4)
            where id = ${v.id} and product_id = ${productId}`;
          continue;
        }
        if (v.id) {
          const [prev] = await tx<{ is_available: boolean; available: number }[]>`select is_available, stock_on_hand - reserved as available from product_variants where id = ${v.id}`;
          await tx`update product_variants set sku = ${v.sku}, size = ${v.size}, colour = ${v.colour}, colour_hex = ${v.colourHex || null},
              price_minor = ${v.price}, compare_at_minor = ${compare}, low_stock_threshold = ${v.lowStockThreshold}, is_available = ${v.isAvailable}
              ${canCost && v.cost !== undefined ? tx`, cost_minor = ${v.cost === "" ? null : v.cost}` : tx``}
            where id = ${v.id} and product_id = ${productId}`;
          if (prev && !prev.is_available && v.isAvailable && prev.available > 0) restockIds.push(v.id);
        } else if (!v.remove) {
          await tx`insert into product_variants (product_id, sku, size, colour, colour_hex, price_minor, compare_at_minor, cost_minor, low_stock_threshold, is_available)
            values (${productId}, ${v.sku}, ${v.size}, ${v.colour}, ${v.colourHex || null}, ${v.price}, ${compare},
              ${canCost && v.cost !== undefined && v.cost !== "" ? v.cost : null}, ${v.lowStockThreshold}, ${v.isAvailable})`;
        }
      }
      await audit(user.id, "product.variants", "product", productId, { after: parsed.data.map(({ cost, ...r }) => (canCost ? { ...r, cost } : r)) }, tx);
    });
  } catch (e) {
    const msg = e instanceof Error && /unique/i.test(e.message) ? "Each SKU, and each size and colour pair, must be unique." : "Could not save variants.";
    return { ok: false, message: msg };
  }
  for (const id of restockIds) await notifyBackInStock(id);
  refresh();
  return { ok: true, message: "Variants saved." };
}

export async function uploadImages(productId: string, form: FormData): Promise<{ ok: boolean; message: string }> {
  const user = await requirePermission("products.edit");
  await enforce(LIMITS.upload(user.id));
  const files = form.getAll("images").filter((f): f is File => f instanceof File && f.size > 0).slice(0, 10);
  const colour = String(form.get("colour") ?? "").trim().slice(0, 30) || null;
  const alt = String(form.get("alt") ?? "").trim().slice(0, 200);
  if (!files.length) return { ok: false, message: "Choose images to upload." };
  if (!alt) return { ok: false, message: "Describe the images (alt text) for customers using screen readers." };
  const [{ max }] = await sql<{ max: number }[]>`select coalesce(max(sort_order), -1)::int max from product_images where product_id = ${productId}`;
  try {
    let order = max + 1;
    for (const f of files) {
      const stored = await storeImage(f, "products");
      await sql`insert into product_images (product_id, url, storage_path, alt, colour, sort_order)
        values (${productId}, ${stored.url}, ${stored.path}, ${alt}, ${colour}, ${order++})`;
    }
  } catch (e) {
    return { ok: false, message: e instanceof UploadError ? e.message : "Upload failed." };
  }
  await audit(user.id, "product.images.upload", "product", productId, { after: { count: files.length } });
  refresh();
  return { ok: true, message: `${files.length} image${files.length > 1 ? "s" : ""} uploaded.` };
}

export async function updateImage(imageId: string, patch: { alt?: string; colour?: string | null; move?: -1 | 1 }): Promise<{ ok: boolean; message: string }> {
  const user = await requirePermission("products.edit");
  const [img] = await sql<{ product_id: string; sort_order: number }[]>`select product_id, sort_order from product_images where id = ${imageId}`;
  if (!img) return { ok: false, message: "Not found." };
  if (patch.move) {
    const [swap] = await sql<{ id: string; sort_order: number }[]>`select id, sort_order from product_images where product_id = ${img.product_id}
      and sort_order ${patch.move < 0 ? sql`<` : sql`>`} ${img.sort_order} order by sort_order ${patch.move < 0 ? sql`desc` : sql`asc`} limit 1`;
    if (swap) {
      await sql.begin(async (tx) => {
        await tx`update product_images set sort_order = ${swap.sort_order} where id = ${imageId}`;
        await tx`update product_images set sort_order = ${img.sort_order} where id = ${swap.id}`;
      });
    }
  }
  if (patch.alt !== undefined) {
    const alt = patch.alt.trim().slice(0, 200);
    if (!alt) return { ok: false, message: "Alt text cannot be empty." };
    await sql`update product_images set alt = ${alt}, colour = ${patch.colour?.trim() || null} where id = ${imageId}`;
  }
  await audit(user.id, "product.image.update", "product_image", imageId, { after: patch });
  refresh();
  return { ok: true, message: "Image updated." };
}

export async function deleteImage(imageId: string): Promise<{ ok: boolean; message: string }> {
  const user = await requirePermission("products.edit");
  const [img] = await sql`delete from product_images where id = ${imageId} returning product_id, url`;
  if (img) await audit(user.id, "product.image.delete", "product_image", imageId, { before: img });
  refresh();
  return { ok: true, message: "Image removed." };
}
