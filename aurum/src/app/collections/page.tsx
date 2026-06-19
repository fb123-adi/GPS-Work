import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { CollectionView } from "@/components/shop/CollectionView";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Collections",
  description: "The full AURUM edit — best sellers, new arrivals, limited editions, and performance.",
};

export default function CollectionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="The Full Edit"
        title="Every AURUM collection"
        intro="Best sellers, new arrivals, performance, and our most coveted limited editions — filtered to your taste."
        crumbs={[{ label: "Home", href: "/" }, { label: "Collections" }]}
      />
      <CollectionView products={getProducts()} />
    </>
  );
}
