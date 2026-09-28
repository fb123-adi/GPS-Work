import "server-only";
import { sql } from "@/lib/db";

export type ProductCard = {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  gender: string;
  priceMinor: number;
  maxPriceMinor: number;
  compareAtMinor: number | null;
  image: { url: string; alt: string } | null;
  hoverImage: { url: string; alt: string } | null;
  colours: { name: string; hex: string | null }[];
  inStock: boolean;
  isPerformance: boolean;
  isNew: boolean;
};

export type Filters = {
  q?: string;
  category?: string[];
  gender?: string[];
  size?: string[];
  colour?: string[];
  collection?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  performance?: boolean;
  sort?: "featured" | "newest" | "price_asc" | "price_desc";
  page?: number;
  perPage?: number;
};

const PUBLISHED = sql`p.status = 'published' and p.deleted_at is null and (p.publish_at is null or p.publish_at <= now())`;

function where(f: Filters) {
  const parts = [PUBLISHED];
  if (f.q) {
    parts.push(sql`(p.search @@ websearch_to_tsquery('simple', ${f.q}) or p.name ilike ${"%" + f.q.replace(/[%_\\]/g, "\\$&") + "%"})`);
  }
  if (f.category?.length) parts.push(sql`p.category_id in (select id from categories where slug = any(${f.category}))`);
  if (f.gender?.length) parts.push(sql`p.gender::text = any(${f.gender})`);
  if (f.collection) {
    parts.push(sql`p.id in (select cp.product_id from collection_products cp join collections c on c.id = cp.collection_id where c.slug = ${f.collection})`);
  }
  if (f.performance) parts.push(sql`p.is_performance`);
  const vparts = [sql`v.product_id = p.id and v.deleted_at is null`];
  if (f.size?.length) vparts.push(sql`v.size = any(${f.size})`);
  if (f.colour?.length) vparts.push(sql`v.colour = any(${f.colour})`);
  if (f.minPrice !== undefined) vparts.push(sql`v.price_minor >= ${f.minPrice}`);
  if (f.maxPrice !== undefined) vparts.push(sql`v.price_minor <= ${f.maxPrice}`);
  if (f.inStock) vparts.push(sql`v.is_available and v.stock_on_hand - v.reserved > 0`);
  if (vparts.length > 1) {
    const cond = vparts.reduce((a, b) => sql`${a} and ${b}`);
    parts.push(sql`exists (select 1 from product_variants v where ${cond})`);
  }
  return parts.reduce((a, b) => sql`${a} and ${b}`);
}

function orderBy(sort: Filters["sort"], hasQuery: boolean) {
  switch (sort) {
    case "newest": return sql`p.created_at desc`;
    case "price_asc": return sql`p.min_price_minor asc, p.created_at desc`;
    case "price_desc": return sql`p.max_price_minor desc, p.created_at desc`;
    default: return hasQuery ? sql`p.is_featured desc, p.created_at desc` : sql`p.is_featured desc, p.created_at desc`;
  }
}

type CardRow = {
  id: string; slug: string; name: string; subtitle: string | null; gender: string; min_price_minor: string; max_price_minor: string;
  compare_at_minor: string | null; images: { url: string; alt: string }[] | null; colours: { name: string; hex: string | null }[] | null;
  in_stock: boolean; is_performance: boolean; created_at: Date;
};

const CARD_SELECT = sql`
  p.id, p.slug, p.name, p.subtitle, p.gender, p.min_price_minor, p.max_price_minor, p.is_performance, p.created_at,
  (select min(v.compare_at_minor) from product_variants v where v.product_id = p.id and v.deleted_at is null and v.compare_at_minor is not null) as compare_at_minor,
  (select json_agg(json_build_object('url', i.url, 'alt', i.alt) order by i.sort_order)
     from (select * from product_images i where i.product_id = p.id order by i.sort_order limit 2) i) as images,
  (select json_agg(json_build_object('name', c.colour, 'hex', c.colour_hex) order by c.first_sort)
     from (select v.colour, max(v.colour_hex) colour_hex, min(v.sort_order) first_sort from product_variants v
           where v.product_id = p.id and v.deleted_at is null group by v.colour) c) as colours,
  exists (select 1 from product_variants v where v.product_id = p.id and v.deleted_at is null and v.is_available
          and v.stock_on_hand - v.reserved > 0) as in_stock`;

function toCard(r: CardRow): ProductCard {
  const imgs = r.images ?? [];
  return {
    id: r.id, slug: r.slug, name: r.name, subtitle: r.subtitle, gender: r.gender,
    priceMinor: Number(r.min_price_minor ?? 0), maxPriceMinor: Number(r.max_price_minor ?? 0),
    compareAtMinor: r.compare_at_minor ? Number(r.compare_at_minor) : null,
    image: imgs[0] ?? null, hoverImage: imgs[1] ?? null, colours: r.colours ?? [],
    inStock: r.in_stock, isPerformance: r.is_performance,
    isNew: Date.now() - r.created_at.getTime() < 21 * 86400000,
  };
}

export async function listProducts(f: Filters): Promise<{ items: ProductCard[]; total: number; page: number; pages: number }> {
  const perPage = Math.min(48, f.perPage ?? 12);
  const page = Math.max(1, f.page ?? 1);
  const w = where(f);
  const [{ n }] = await sql<{ n: number }[]>`select count(*)::int n from products p where ${w}`;
  const rows = await sql<CardRow[]>`
    select ${CARD_SELECT} from products p where ${w}
    order by ${orderBy(f.sort, !!f.q)} limit ${perPage} offset ${(page - 1) * perPage}`;
  return { items: rows.map(toCard), total: n, page, pages: Math.max(1, Math.ceil(n / perPage)) };
}

export async function productsByIds(ids: string[]): Promise<ProductCard[]> {
  if (!ids.length) return [];
  const rows = await sql<CardRow[]>`select ${CARD_SELECT} from products p where ${PUBLISHED} and p.id = any(${ids}::uuid[])`;
  const map = new Map(rows.map((r) => [r.id, toCard(r)]));
  return ids.map((id) => map.get(id)).filter(Boolean) as ProductCard[];
}

export async function featuredProducts(limit = 8) {
  const rows = await sql<CardRow[]>`select ${CARD_SELECT} from products p where ${PUBLISHED} and p.is_featured
    order by p.created_at desc limit ${limit}`;
  return rows.map(toCard);
}

export async function relatedProducts(productId: string, limit = 4) {
  const rows = await sql<CardRow[]>`
    select ${CARD_SELECT} from products p
    where ${PUBLISHED} and p.id <> ${productId} and (
      p.category_id = (select category_id from products where id = ${productId})
      or p.id in (select product_id from collection_products where collection_id in
                  (select collection_id from collection_products where product_id = ${productId})))
    order by (p.category_id = (select category_id from products where id = ${productId})) desc, p.is_featured desc
    limit ${limit}`;
  return rows.map(toCard);
}

export type FacetData = {
  categories: { slug: string; name: string }[];
  sizes: string[];
  colours: { name: string; hex: string | null }[];
  collections: { slug: string; title: string }[];
  priceMax: number;
};

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38"];

export async function facets(): Promise<FacetData> {
  const [categories, sizes, colours, collections, [{ mx }]] = await Promise.all([
    sql<{ slug: string; name: string }[]>`select slug, name from categories c
      where exists (select 1 from products p where p.category_id = c.id and ${PUBLISHED}) order by sort_order`,
    sql<{ size: string }[]>`select distinct v.size from product_variants v join products p on p.id = v.product_id
      where v.deleted_at is null and ${PUBLISHED}`,
    sql<{ name: string; hex: string | null }[]>`select v.colour as name, max(v.colour_hex) as hex from product_variants v
      join products p on p.id = v.product_id where v.deleted_at is null and ${PUBLISHED} group by v.colour order by v.colour`,
    sql<{ slug: string; title: string }[]>`select slug, title from collections where status = 'published' and deleted_at is null order by sort_order`,
    sql<{ mx: string | null }[]>`select max(max_price_minor) mx from products p where ${PUBLISHED}`,
  ]);
  return {
    categories, colours, collections,
    sizes: sizes.map((s) => s.size).sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b)),
    priceMax: Number(mx ?? 0),
  };
}

export type ProductDetail = {
  id: string; slug: string; name: string; subtitle: string | null; description: string; gender: string;
  material: string | null; care: string | null; fit: string | null; fitNotes: string | null; category: string | null;
  seoTitle: string | null; seoDescription: string | null; isPerformance: boolean;
  images: { id: string; url: string; alt: string; colour: string | null; width: number | null; height: number | null }[];
  variants: { id: string; sku: string; size: string; colour: string; colourHex: string | null; priceMinor: number; compareAtMinor: number | null; available: number; lowStock: boolean }[];
  rating: { average: number; count: number };
};

export async function getProduct(slug: string): Promise<ProductDetail | null> {
  const [p] = await sql<{
    id: string; slug: string; name: string; subtitle: string | null; description: string; gender: string; material: string | null;
    care: string | null; fit: string | null; fit_notes: string | null; category: string | null; seo_title: string | null;
    seo_description: string | null; is_performance: boolean;
  }[]>`
    select p.id, p.slug, p.name, p.subtitle, p.description, p.gender, p.material, p.care, p.fit, p.fit_notes,
      c.name as category, p.seo_title, p.seo_description, p.is_performance
    from products p left join categories c on c.id = p.category_id
    where p.slug = ${slug} and ${PUBLISHED}`;
  if (!p) return null;
  const [images, variants, [rating]] = await Promise.all([
    sql<{ id: string; url: string; alt: string; colour: string | null; width: number | null; height: number | null }[]>`
      select id, url, alt, colour, width, height from product_images where product_id = ${p.id} order by sort_order`,
    sql<{ id: string; sku: string; size: string; colour: string; colour_hex: string | null; price_minor: string; compare_at_minor: string | null; available: number; low_stock_threshold: number; is_available: boolean }[]>`
      select id, sku, size, colour, colour_hex, price_minor, compare_at_minor, is_available, low_stock_threshold,
        greatest(stock_on_hand - reserved, 0) as available
      from product_variants where product_id = ${p.id} and deleted_at is null order by sort_order, colour`,
    sql<{ avg: string | null; n: number }[]>`select avg(rating)::numeric(3,2) avg, count(*)::int n from reviews
      where product_id = ${p.id} and status = 'published'`,
  ]);
  const sizeRank = (s: string) => (SIZE_ORDER.indexOf(s) + 1) || 99;
  return {
    id: p.id, slug: p.slug, name: p.name, subtitle: p.subtitle, description: p.description, gender: p.gender,
    material: p.material, care: p.care, fit: p.fit, fitNotes: p.fit_notes, category: p.category,
    seoTitle: p.seo_title, seoDescription: p.seo_description, isPerformance: p.is_performance, images,
    variants: variants
      .map((v) => {
        const available = v.is_available ? v.available : 0;
        return {
          id: v.id, sku: v.sku, size: v.size, colour: v.colour, colourHex: v.colour_hex, priceMinor: Number(v.price_minor),
          compareAtMinor: v.compare_at_minor ? Number(v.compare_at_minor) : null, available,
          lowStock: available > 0 && available <= v.low_stock_threshold,
        };
      })
      .sort((a, b) => sizeRank(a.size) - sizeRank(b.size)),
    rating: { average: rating.avg ? Number(rating.avg) : 0, count: rating.n },
  };
}

export async function getCollection(slug: string) {
  const [c] = await sql<{ id: string; slug: string; title: string; description: string | null; banner_url: string | null; banner_alt: string | null; seo_title: string | null; seo_description: string | null }[]>`
    select id, slug, title, description, banner_url, banner_alt, seo_title, seo_description from collections
    where slug = ${slug} and status = 'published' and deleted_at is null`;
  return c ?? null;
}

export async function listCollections() {
  return sql<{ slug: string; title: string; description: string | null; banner_url: string | null; banner_alt: string | null }[]>`
    select slug, title, description, banner_url, banner_alt from collections
    where status = 'published' and deleted_at is null order by sort_order`;
}

export async function searchSuggestions(q: string) {
  if (q.trim().length < 2) return { products: [], collections: [] };
  const like = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
  const [products, collections] = await Promise.all([
    sql<{ slug: string; name: string; image: string | null }[]>`
      select p.slug, p.name, (select url from product_images i where i.product_id = p.id order by sort_order limit 1) as image
      from products p where ${PUBLISHED} and (p.name ilike ${like} or p.search @@ websearch_to_tsquery('simple', ${q}))
      order by similarity(p.name, ${q}) desc limit 6`,
    sql<{ slug: string; title: string }[]>`select slug, title from collections
      where status = 'published' and deleted_at is null and (title ilike ${like} or description ilike ${like}) limit 3`,
  ]);
  return { products, collections };
}

export async function publishedReviews(productId: string) {
  return sql<{ id: string; rating: number; title: string | null; body: string; fit_feedback: string | null; is_verified_purchase: boolean; created_at: Date; author: string; helpful: number }[]>`
    select r.id, r.rating, r.title, r.body, r.fit_feedback, r.is_verified_purchase, r.created_at,
      coalesce(split_part(pr.full_name, ' ', 1), 'Customer') as author,
      (select count(*)::int from review_votes rv where rv.review_id = r.id and rv.helpful) as helpful
    from reviews r left join profiles pr on pr.user_id = r.user_id
    where r.product_id = ${productId} and r.status = 'published'
    order by r.created_at desc limit 20`;
}
