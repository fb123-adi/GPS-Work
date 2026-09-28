import Link from "next/link";
import { sql } from "@/lib/db";
import { requireStaffPage } from "@/lib/auth/guards";
import { PageHeader, Panel } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductEditor";

export const metadata = { title: "New product" };

export default async function NewProduct() {
  await requireStaffPage("products.edit");
  const [categories, collections] = await Promise.all([
    sql<{ id: string; name: string }[]>`select id, name from categories order by sort_order`,
    sql<{ id: string; title: string }[]>`select id, title from collections where deleted_at is null order by sort_order`,
  ]);
  return (
    <div className="max-w-4xl">
      <PageHeader title="New product" sub="Saved as a draft. Add variants and images, then publish." actions={<Link href="/admin/products" className="btn btn-secondary btn-sm">Cancel</Link>} />
      <Panel>
        <ProductForm categories={categories} collections={collections} p={{ name: "", slug: "", subtitle: "", description: "", categoryId: "", gender: "unisex", material: "", care: "", fit: "", fitNotes: "", seoTitle: "", seoDescription: "", publishAt: "", isFeatured: false, isPerformance: false, collections: [] }} />
      </Panel>
    </div>
  );
}
