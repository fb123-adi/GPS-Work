import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";
import { canViewOrder } from "@/lib/orders/access";
import { getOrder } from "@/lib/orders/queries";
import { PAID_STATES } from "@/lib/orders/state";
import { BRAND } from "@/lib/config/store";
import { formatMoney } from "@/lib/money";
import { esc } from "@/lib/email/templates";

/**
 * Printable invoice (HTML, print to PDF from the browser). Not a GST tax
 * invoice until the owner configures GSTIN and HSN codes and a CA signs off
 * the format.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const [o, user] = await Promise.all([getOrder(id), getCurrentUser()]);
  const staff = user ? can(user.roles, "orders.view") : false;
  if (!o || !(staff || (await canViewOrder(o, user)))) return new Response("Not found", { status: 404 });
  if (!(PAID_STATES.includes(o.status) || o.status === "refunded")) return new Response("Invoice available after payment", { status: 409 });
  const m = (x: string | number) => esc(formatMoney(Number(x), o.currency));
  const a = o.shipping_address;
  const b = o.billing_address;
  const rows = o.items.map((i) => `<tr><td>${esc(i.product_name)}<br><small>${esc(i.sku)} · ${esc(i.colour)} / ${esc(i.size)}</small></td>
    <td class="r">${i.quantity}</td><td class="r">${m(i.unit_price_minor)}</td><td class="r">${m(i.discount_minor)}</td>
    <td class="r">${esc(i.tax_rate)}%</td><td class="r">${m(i.tax_minor)}</td><td class="r">${m(i.line_total_minor)}</td></tr>`).join("");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Invoice ${esc(o.order_number)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1"><style>
body{font:14px/1.5 system-ui,sans-serif;color:#151515;background:#fff;margin:0;padding:32px;max-width:900px}
h1{font-size:20px;letter-spacing:.3em;margin:0}table{width:100%;border-collapse:collapse;margin:24px 0}
th,td{border-bottom:1px solid #d9d3c7;padding:8px 6px;text-align:left;vertical-align:top}.r{text-align:right}
small{color:#55524b}.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:24px}.note{border:1px solid #8a8477;padding:10px;font-size:12px;margin-top:24px}
@media print{.noprint{display:none}body{padding:0}}</style></head><body>
<p class="noprint"><button onclick="print()">Print or save as PDF</button></p>
<h1>KYVERON</h1><p>${esc(BRAND.legalName)}<br>${esc(BRAND.address)}<br>GSTIN ${esc(BRAND.gstin)}</p>
<p><strong>Invoice for order ${esc(o.order_number)}</strong><br>Date: ${esc((o.paid_at ?? o.created_at).toLocaleDateString("en-IN"))}</p>
<div class="grid"><div><strong>Bill to</strong><br>${esc(b.fullName)}<br>${esc(b.line1)}${b.line2 ? "<br>" + esc(b.line2) : ""}<br>${esc(b.city)}, ${esc(b.state)} ${esc(b.postalCode)}</div>
<div><strong>Ship to</strong><br>${esc(a.fullName)}<br>${esc(a.line1)}${a.line2 ? "<br>" + esc(a.line2) : ""}<br>${esc(a.city)}, ${esc(a.state)} ${esc(a.postalCode)}<br>Place of supply: ${esc(a.state)}</div></div>
<table><thead><tr><th>Item</th><th class="r">Qty</th><th class="r">Unit price</th><th class="r">Discount</th><th class="r">GST rate</th><th class="r">GST incl.</th><th class="r">Amount</th></tr></thead><tbody>${rows}</tbody></table>
<table><tr><td>Subtotal</td><td class="r">${m(o.subtotal_minor)}</td></tr><tr><td>Discount</td><td class="r">−${m(o.discount_minor)}</td></tr>
<tr><td>Delivery</td><td class="r">${m(o.shipping_minor)}</td></tr><tr><td>GST included in prices</td><td class="r">${m(o.tax_minor)}</td></tr>
<tr><td><strong>Total paid (${esc(o.currency)})</strong></td><td class="r"><strong>${m(o.total_minor)}</strong></td></tr></table>
<p class="note">DRAFT FORMAT. This document is an order receipt. It is not a GST tax invoice until the business GSTIN, HSN codes, and CGST/SGST/IGST split are configured and the format is approved by a chartered accountant.</p>
</body></html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'" },
  });
}
