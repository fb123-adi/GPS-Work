import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { parseShopParams } from "@/lib/shop-params";
import { searchSuggestions } from "@/lib/catalog";
import { Catalog, CatalogSkeleton } from "@/components/shop/Catalog";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

const SUGGESTIONS = ["Supima tee", "Hoodie", "Jogger", "Legging", "Merino", "Short"];

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const filters = parseShopParams(sp);
  const q = filters.q ?? "";
  const { collections } = q ? await searchSuggestions(q) : { collections: [] };
  return (
    <div className="container-x py-10 lg:py-14">
      <form role="search" action="/search" className="mb-8 flex max-w-2xl gap-2">
        <label htmlFor="q" className="sr-only">Search</label>
        <input id="q" name="q" type="search" defaultValue={q} placeholder="Search products" className="input text-lg" maxLength={80} />
        <button className="btn btn-primary"><span className="btn-label">Search</span></button>
      </form>
      {q ? (
        <h1 className="display mb-6 text-[clamp(1.6rem,3vw,2.6rem)]">Results for “{q}”</h1>
      ) : (
        <h1 className="display mb-6 text-[clamp(1.6rem,3vw,2.6rem)]">Search</h1>
      )}
      {collections.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-2 text-sm font-semibold">Collections</h2>
          <ul className="flex flex-wrap gap-2">{collections.map((c) => <li key={c.slug}><Link className="chip" href={`/collections/${c.slug}`}>{c.title}</Link></li>)}</ul>
        </div>
      )}
      {!q ? (
        <div>
          <p className="text-ink-soft">Popular searches</p>
          <ul className="mt-3 flex flex-wrap gap-2">{SUGGESTIONS.map((s) => <li key={s}><Link className="chip" href={`/search?q=${encodeURIComponent(s)}`}>{s}</Link></li>)}</ul>
        </div>
      ) : (
        <Suspense key={JSON.stringify(sp)} fallback={<CatalogSkeleton />}>
          <Catalog filters={filters} basePath="/search" clearHref={`/search?q=${encodeURIComponent(q)}`} searchParams={sp}
            emptyHint={<>No products match “{q}”. Try {SUGGESTIONS.slice(0, 3).map((s, i) => <span key={s}>{i ? ", " : ""}<Link className="link" href={`/search?q=${encodeURIComponent(s)}`}>{s}</Link></span>)}.</>} />
        </Suspense>
      )}
    </div>
  );
}
