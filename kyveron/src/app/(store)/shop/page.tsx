import type { Metadata } from "next";
import { Suspense } from "react";
import { parseShopParams } from "@/lib/shop-params";
import { Catalog, CatalogSkeleton } from "@/components/shop/Catalog";

export const metadata: Metadata = {
  title: "Shop all",
  description: "Daily wear and training clothes by Kyveron. Filter by size, colour, fit, and price.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const filters = parseShopParams(sp);
  const heading = filters.gender?.length === 1 ? (filters.gender[0] === "men" ? "Men" : filters.gender[0] === "women" ? "Women" : "Unisex") : "Shop all";
  return (
    <div className="container-x py-10 lg:py-14">
      <header className="mb-10 max-w-2xl">
        <h1 className="display text-[clamp(2rem,4vw,3.4rem)]">{heading}</h1>
        <p className="mt-3 text-ink-soft">Every piece lists its fibre, weight, and fit. Prices include GST; standard delivery is free over ₹2,999.</p>
      </header>
      <Suspense key={JSON.stringify(sp)} fallback={<CatalogSkeleton />}>
        <Catalog filters={filters} basePath="/shop" searchParams={sp} />
      </Suspense>
    </div>
  );
}
