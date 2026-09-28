import { sql } from "@/lib/db";
import { requirePermission, AuthError } from "@/lib/auth/guards";
import type { Permission } from "@/lib/auth/roles";
import { audit } from "@/lib/audit";

/** CSV exports. Each kind has its own permission; customer PII export is super_admin only and audited. */
const KINDS: Record<string, Permission> = { orders: "exports.orders", products: "exports.catalog", inventory: "exports.catalog", customers: "exports.customers" };

function csv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const cell = (v: unknown) => {
    let s = v instanceof Date ? v.toISOString() : v === null || v === undefined ? "" : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // spreadsheet formula injection guard
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n");
}

export async function GET(req: Request, ctx: { params: Promise<{ kind: string }> }) {
  const { kind } = await ctx.params;
  const perm = KINDS[kind];
  if (!perm) return new Response("Not found", { status: 404 });
  let user;
  try {
    user = await requirePermission(perm);
  } catch (e) {
    return new Response("Forbidden", { status: e instanceof AuthError ? e.status : 500 });
  }
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  let rows: Record<string, unknown>[] = [];
  if (kind === "orders") {
    rows = await sql`select o.order_number, o.created_at, o.paid_at, o.status, o.currency, o.subtotal_minor / 100.0 as subtotal,
      o.discount_minor / 100.0 as discount, o.shipping_minor / 100.0 as shipping, o.tax_minor / 100.0 as gst_included, o.total_minor / 100.0 as total,
      o.coupon_code, o.shipping_method, o.shipping_address->>'city' as city, o.shipping_address->>'state' as state, o.shipping_address->>'postalCode' as pin,
      (select string_agg(i.sku || ' x' || i.quantity, '; ') from order_items i where i.order_id = o.id) as items
      from orders o where ${status ? sql`o.status = ${status}` : sql`true`} order by o.created_at desc limit 50000`;
  } else if (kind === "products") {
    rows = await sql`select p.slug, p.name, p.status, p.gender, c.name as category, p.min_price_minor / 100.0 as min_price, p.max_price_minor / 100.0 as max_price,
      p.is_featured, p.created_at from products p left join categories c on c.id = p.category_id where p.deleted_at is null order by p.name`;
  } else if (kind === "inventory") {
    rows = await sql`select v.sku, p.name, v.colour, v.size, v.stock_on_hand, v.reserved, v.stock_on_hand - v.reserved as available,
      v.low_stock_threshold, v.price_minor / 100.0 as price, v.is_available from product_variants v join products p on p.id = v.product_id
      where v.deleted_at is null order by p.name, v.colour, v.size`;
  } else if (kind === "customers") {
    // Minimum necessary fields; marketing consent included so exports can respect it.
    rows = await sql`select u.email, p.full_name, u.created_at, p.marketing_email, p.marketing_whatsapp,
      (select count(*) from orders o where o.user_id = u.id and o.paid_at is not null) as paid_orders
      from users u left join profiles p on p.user_id = u.id where u.deleted_at is null and p.deletion_requested_at is null order by u.created_at desc`;
  }
  await audit(user.id, `export.${kind}`, "export", kind, { after: { rows: rows.length, status } });
  return new Response(csv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kyveron-${kind}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
