import type { Filters } from "@/lib/catalog";

type SP = Record<string, string | string[] | undefined>;

const list = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v : v ? v.split(",") : []).map((s) => s.trim()).filter((s) => /^[\w -]{1,40}$/.test(s)).slice(0, 12);

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? undefined;

/** Parses and whitelists shop query parameters. Prices in the URL are rupees. */
export function parseShopParams(sp: SP): Filters {
  const sort = one(sp.sort);
  const min = Number(one(sp.min));
  const max = Number(one(sp.max));
  const page = Number(one(sp.page));
  return {
    q: one(sp.q)?.slice(0, 80) || undefined,
    category: list(sp.category),
    gender: list(sp.gender).filter((g) => ["men", "women", "unisex", "kids"].includes(g)),
    size: list(sp.size),
    colour: list(sp.colour),
    collection: one(sp.collection)?.match(/^[a-z0-9-]{1,60}$/)?.[0],
    minPrice: Number.isFinite(min) && min > 0 ? Math.round(min * 100) : undefined,
    maxPrice: Number.isFinite(max) && max > 0 ? Math.round(max * 100) : undefined,
    inStock: one(sp.stock) === "1",
    sort: (["featured", "newest", "price_asc", "price_desc"] as const).find((s) => s === sort) ?? "featured",
    page: Number.isInteger(page) && page > 0 && page < 1000 ? page : 1,
  };
}

export function activeFilterCount(f: Filters) {
  return (f.category?.length ?? 0) + (f.gender?.length ?? 0) + (f.size?.length ?? 0) + (f.colour?.length ?? 0) +
    (f.minPrice ? 1 : 0) + (f.maxPrice ? 1 : 0) + (f.inStock ? 1 : 0) + (f.collection ? 1 : 0);
}
