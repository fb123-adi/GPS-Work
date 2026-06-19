import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { CollectionView } from "@/components/shop/CollectionView";
import { getProductsByCategory } from "@/lib/products";

export const metadata: Metadata = {
  title: "Women",
  description: "Luxury activewear for women — sculpted leggings, support, and lifestyle sets.",
};

export default function WomenPage() {
  return (
    <>
      <PageHeader
        eyebrow="Women"
        title="Sculpted to move"
        intro="Sculpting activewear, architectural support, and lifestyle sets that move from session to street without compromise."
        crumbs={[{ label: "Home", href: "/" }, { label: "Women" }]}
      />
      <CollectionView products={getProductsByCategory("Women")} />
    </>
  );
}
