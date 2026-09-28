import { sql } from "@/lib/db";
import { requireStaffPage } from "@/lib/auth/guards";
import { can } from "@/lib/auth/roles";
import { formatMoney } from "@/lib/money";
import { PageHeader, Panel, Table } from "@/components/admin/ui";

export const metadata = { title: "Reports and exports" };

export default async function Exports() {
  const user = await requireStaffPage("exports.orders");
  const [top, byState] = await Promise.all([
    sql<{ product_name: string; units: number; revenue: string }[]>`
      select i.product_name, sum(i.quantity)::int units, sum(i.line_total_minor) revenue from order_items i join orders o on o.id = i.order_id
      where o.paid_at > now() - interval '90 days' and o.status not in ('cancelled','refunded') group by i.product_name order by revenue desc limit 10`,
    sql<{ state: string; orders: number; revenue: string }[]>`
      select o.shipping_address->>'state' state, count(*)::int orders, sum(o.total_minor) revenue from orders o
      where o.paid_at > now() - interval '90 days' and o.status not in ('cancelled','refunded') group by 1 order by revenue desc limit 10`,
  ]);
  const links: [string, string, boolean][] = [
    ["Orders", "/api/admin/export/orders", can(user.roles, "exports.orders")],
    ["Products", "/api/admin/export/products", can(user.roles, "exports.catalog")],
    ["Inventory", "/api/admin/export/inventory", can(user.roles, "exports.catalog")],
    ["Customers (PII, audited)", "/api/admin/export/customers", can(user.roles, "exports.customers")],
  ];
  return (
    <div className="grid gap-6">
      <PageHeader title="Reports and exports" sub="Figures come from orders in this database. Traffic and conversion need an analytics integration." />
      <Panel title="Download CSV">
        <div className="flex flex-wrap gap-2">{links.filter((l) => l[2]).map(([label, href]) => <a key={href} href={href} className="btn btn-secondary btn-sm">{label}</a>)}</div>
      </Panel>
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Top products, last 90 days">
          <Table head={["Product", "Units", "Revenue"]}>{top.map((t) => <tr key={t.product_name}><td className="px-3 py-2">{t.product_name}</td><td className="px-3">{t.units}</td><td className="px-3 tabular-nums">{formatMoney(Number(t.revenue))}</td></tr>)}</Table>
        </Panel>
        <Panel title="Revenue by state, last 90 days">
          <Table head={["State", "Orders", "Revenue"]}>{byState.map((t) => <tr key={t.state}><td className="px-3 py-2">{t.state}</td><td className="px-3">{t.orders}</td><td className="px-3 tabular-nums">{formatMoney(Number(t.revenue))}</td></tr>)}</Table>
        </Panel>
      </div>
    </div>
  );
}
