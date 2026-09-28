import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { requireStaffPage } from "@/lib/auth/guards";
import { PageHeader, Panel } from "@/components/admin/ui";
import { CouponForm } from "@/components/admin/Buttons";

const local = (d: Date | null) => (d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");

export default async function EditDiscount({ params }: { params: Promise<{ id: string }> }) {
  await requireStaffPage("discounts.manage");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [c] = await sql<{ id: string; code: string; description: string | null; kind: string; value: number; max_discount_minor: string | null; min_subtotal_minor: string; starts_at: Date | null; ends_at: Date | null; usage_limit: number | null; per_customer_limit: number | null; first_order_only: boolean; exclude_sale_items: boolean; is_active: boolean; applies_to_product_ids: string[] | null; applies_to_collection_ids: string[] | null }[]>`
    select * from coupons where id = ${id} and deleted_at is null`;
  if (!c) notFound();
  const [products, collections] = await Promise.all([
    sql<{ id: string; name: string }[]>`select id, name from products where deleted_at is null order by name`,
    sql<{ id: string; title: string }[]>`select id, title from collections where deleted_at is null order by sort_order`,
  ]);
  return (
    <div className="max-w-4xl">
      <PageHeader title={`Edit ${c.code}`} />
      <Panel>
        <CouponForm products={products} collections={collections} c={{
          id: c.id, code: c.code, description: c.description, kind: c.kind, value: String(c.kind === "percent" ? c.value : c.value / 100),
          maxDiscount: c.max_discount_minor ? String(Number(c.max_discount_minor) / 100) : "", minSubtotal: String(Number(c.min_subtotal_minor) / 100),
          startsAt: local(c.starts_at), endsAt: local(c.ends_at), usageLimit: c.usage_limit ? String(c.usage_limit) : "",
          perCustomerLimit: c.per_customer_limit ? String(c.per_customer_limit) : "", firstOrderOnly: c.first_order_only, excludeSale: c.exclude_sale_items,
          isActive: c.is_active, products: c.applies_to_product_ids ?? [], collections: c.applies_to_collection_ids ?? [],
        }} />
      </Panel>
    </div>
  );
}
