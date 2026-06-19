import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { CollectionView } from "@/components/shop/CollectionView";
import { getProductsByCategory } from "@/lib/products";

export const metadata: Metadata = {
  title: "Children",
  description: "Premium sportswear and luxury essentials for children — made to move.",
};

export default function ChildrenPage() {
  const items = getProductsByCategory("Children");
  return (
    <>
      <PageHeader
        eyebrow="Children"
        title="The next generation, outfitted"
        intro="Premium sportswear and luxury essentials, built for play, performance, and everyday adventure."
        crumbs={[{ label: "Home", href: "/" }, { label: "Children" }]}
      />
      {items.length > 0 ? (
        <CollectionView products={items} />
      ) : (
        <section className="bg-ivory py-24">
          <div className="mx-auto max-w-editorial px-5 text-center sm:px-8">
            <p className="font-display text-3xl">Arriving soon</p>
            <p className="mx-auto mt-4 max-w-md text-sm font-light text-graphite">
              The AURUM children&apos;s collection is in final atelier. Join the Circle below
              to be first to know when it drops.
            </p>
          </div>
        </section>
      )}
    </>
  );
}
