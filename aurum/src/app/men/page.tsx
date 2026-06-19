import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { CollectionView } from "@/components/shop/CollectionView";
import { getProductsByCategory } from "@/lib/products";

export const metadata: Metadata = {
  title: "Men",
  description: "Luxury sportswear for men — compression, tailoring, and limited editions.",
};

export default function MenPage() {
  return (
    <>
      <PageHeader
        eyebrow="Men"
        title="Engineered for the ambitious"
        intro="Compression wear, premium joggers, luxury hoodies and limited drops — performance with the presence of tailoring."
        crumbs={[{ label: "Home", href: "/" }, { label: "Men" }]}
      />
      <CollectionView products={getProductsByCategory("Men")} />
    </>
  );
}
