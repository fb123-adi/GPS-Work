import { requirePermission, AuthError } from "@/lib/auth/guards";
import { getOrder } from "@/lib/orders/queries";
import { esc } from "@/lib/email/templates";
import { BRAND } from "@/lib/config/store";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("orders.view");
  } catch (e) {
    return new Response("Not found", { status: e instanceof AuthError ? 404 : 500 });
  }
  const o = await getOrder((await ctx.params).id);
  if (!o) return new Response("Not found", { status: 404 });
  const a = o.shipping_address;
  const rows = o.items.map((i) => `<tr><td>${esc(i.sku)}</td><td>${esc(i.product_name)}<br><small>${esc(i.colour)} / ${esc(i.size)}</small></td><td style="text-align:center;font-size:18px">${i.quantity}</td><td style="width:40px;border:1px solid #999"></td></tr>`).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Packing slip ${esc(o.order_number)}</title><style>
body{font:14px/1.5 system-ui,sans-serif;padding:32px;max-width:800px}table{width:100%;border-collapse:collapse;margin-top:20px}
td,th{border-bottom:1px solid #ccc;padding:8px;text-align:left}h1{letter-spacing:.3em;font-size:18px}@media print{button{display:none}}</style></head><body>
<button onclick="print()">Print</button><h1>KYVERON</h1><p><strong>Packing slip · ${esc(o.order_number)}</strong><br>${esc(o.created_at.toLocaleDateString("en-IN"))} · ${esc(o.shipping_method)} delivery</p>
<p><strong>Ship to</strong><br>${esc(a.fullName)}<br>${esc(a.line1)}${a.line2 ? "<br>" + esc(a.line2) : ""}${a.landmark ? "<br>Near " + esc(a.landmark) : ""}<br>${esc(a.city)}, ${esc(a.state)} ${esc(a.postalCode)}<br>${esc(a.phone)}</p>
<table><thead><tr><th>SKU</th><th>Item</th><th>Qty</th><th>Packed</th></tr></thead><tbody>${rows}</tbody></table>
<p style="margin-top:32px;font-size:12px">Returns within 14 days of delivery: kyveron.example/returns · ${esc(BRAND.supportEmail)}</p></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'" } });
}
