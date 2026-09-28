import { sql } from "@/lib/db";
import { requireStaffPage } from "@/lib/auth/guards";
import { PageHeader, Panel } from "@/components/admin/ui";
import { CouponForm } from "@/components/admin/Buttons";

export default async function NewDiscount() {
  await requireStaffPage("discounts.manage");
  const [products, collections] = await Promise.all([
    sql<{ id: string; name: string }[]>`select id, name from products where deleted_at is null order by name`,
    sql<{ id: string; title: string }[]>`select id, title from collections where deleted_at is null order by sort_order`,
  ]);
  return <div className="max-w-4xl"><PageHeader title="New discount" sub="Validated on the server at checkout; every change is logged." /><Panel><CouponForm products={products} collections={collections} /></Panel></div>;
}
