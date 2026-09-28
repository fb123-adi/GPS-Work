import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCollection } from "@/lib/catalog";
import { parseShopParams } from "@/lib/shop-params";
import { Catalog, CatalogSkeleton } from "@/components/shop/Catalog";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getCollection((await params).slug);
  if (!c) return { title: "Collection not found" };
  return {
    title: c.seo_title ?? c.title,
    description: c.seo_description ?? c.description ?? undefined,
    alternates: { canonical: `/collections/${c.slug}` },
    openGraph: c.banner_url ? { images: [c.banner_url] } : undefined,
  };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const c = await getCollection(slug);
  if (!c) notFound();
  const filters = { ...parseShopParams(sp), collection: c.slug };
  return (
    <>
      <section className="on-dark relative overflow-hidden bg-obsidian text-ivory">
        {c.banner_url && <Image src={c.banner_url} alt={c.banner_alt ?? ""} fill priority sizes="100vw" className="load-2 object-cover opacity-80" />}
        <div className="absolute inset-0 bg-obsidian/35" aria-hidden="true" />
        <div className="container-x relative flex min-h-[46vh] flex-col justify-end py-12 md:min-h-[52vh]">
          <h1 className="display load-3 text-[clamp(2.4rem,5vw,4.6rem)]">{c.title}</h1>
          {c.description && <p className="load-4 mt-4 max-w-xl text-lg text-ivory/90">{c.description}</p>}
        </div>
      </section>
      <div className="container-x py-10 lg:py-14">
        <Suspense key={JSON.stringify(sp)} fallback={<CatalogSkeleton />}>
          <Catalog filters={filters} basePath={`/collections/${c.slug}`} searchParams={sp} hideCollection />
        </Suspense>
      </div>
    </>
  );
}
