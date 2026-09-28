import Link from "next/link";
import { facets as loadFacets, listProducts, type Filters as F } from "@/lib/catalog";
import { getPriceFormatter } from "@/lib/currency";
import { activeFilterCount } from "@/lib/shop-params";
import { wishedIds } from "@/lib/wishlist";
import { ProductCard } from "@/components/product/ProductCard";
import { Filters, Results, ShopProvider, SortSelect } from "./ShopControls";
import { RevealGroup } from "@/components/motion/RevealGroup";

function pageHref(base: string, sp: Record<string, string | string[] | undefined>, page: number) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (typeof v === "string" && k !== "page") p.set(k, v);
  if (page > 1) p.set("page", String(page));
  return `${base}${p.size ? `?${p}` : ""}`;
}

/** Shared grid + filters for /shop, /collections/[slug], and /search. */
export async function Catalog({ filters, basePath, clearHref, searchParams, hideCollection, emptyHint }: {
  filters: F; basePath: string; clearHref?: string; searchParams: Record<string, string | string[] | undefined>; hideCollection?: boolean; emptyHint?: React.ReactNode;
}) {
  const [result, facets, fmt, wished] = await Promise.all([listProducts({ ...filters, perPage: 12 }), loadFacets(), getPriceFormatter(), wishedIds()]);
  const active = activeFilterCount(filters);
  return (
    <ShopProvider>
      <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-12">
        <Filters facets={facets} activeCount={active} hideCollection={hideCollection} />
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <p className="text-sm text-ink-soft" aria-live="polite">{result.total} {result.total === 1 ? "product" : "products"}</p>
            <SortSelect />
          </div>
          {fmt.approximate && (
            <p className="notice mb-6 text-ink-soft">Prices shown in {fmt.currency} are approximate conversions. You will be charged in INR at checkout.</p>
          )}
          <Results>
            {result.items.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-lg font-medium">Nothing matches those filters.</p>
                <div className="mt-2 text-ink-soft">{emptyHint ?? "Try removing a size or colour, or clear all filters."}</div>
                <Link href={clearHref ?? basePath} className="btn btn-secondary mt-6"><span className="btn-label">Clear filters</span></Link>
              </div>
            ) : (
              <RevealGroup className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6">
                {result.items.map((p, i) => (
                  <li key={p.id}><ProductCard p={p} fmt={fmt} priority={i < 3 && result.page === 1} wished={wished.has(p.id)} /></li>
                ))}
              </RevealGroup>
            )}
          </Results>
          {result.pages > 1 && (
            <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-1">
              {result.page > 1 && <Link className="chip" href={pageHref(basePath, searchParams, result.page - 1)} rel="prev">Previous</Link>}
              {Array.from({ length: result.pages }, (_, i) => i + 1).map((n) => (
                <Link key={n} href={pageHref(basePath, searchParams, n)} className="chip" aria-current={n === result.page ? "page" : undefined}
                  data-selected={n === result.page}>{n}</Link>
              ))}
              {result.page < result.pages && <Link className="chip" href={pageHref(basePath, searchParams, result.page + 1)} rel="next">Next</Link>}
            </nav>
          )}
        </div>
      </div>
    </ShopProvider>
  );
}

export function CatalogSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-12" aria-busy="true" aria-label="Loading products">
      <div className="hidden space-y-4 lg:block">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-24" />)}</div>
      <div>
        <div className="mb-6 flex justify-between border-b border-line pb-4"><div className="skeleton h-5 w-24" /><div className="skeleton h-9 w-40" /></div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i}><div className="skeleton aspect-[4/5]" /><div className="skeleton mt-3 h-4 w-3/4" /><div className="skeleton mt-2 h-3 w-1/3" /></div>
          ))}
        </div>
      </div>
    </div>
  );
}
