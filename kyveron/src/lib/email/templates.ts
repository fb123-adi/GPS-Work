import { BRAND } from "@/lib/config/store";
import { formatMoney } from "@/lib/money";

export function esc(s: unknown): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function layout(title: string, bodyHtml: string) {
  return `<!doctype html><html><body style="margin:0;background:#F2EEE6;font-family:Helvetica,Arial,sans-serif;color:#151515">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid #E2DDD3">
<tr><td style="padding:28px 32px;border-bottom:1px solid #E2DDD3;font-size:18px;letter-spacing:.32em;font-weight:600">KYVERON</td></tr>
<tr><td style="padding:32px"><h1 style="margin:0 0 16px;font-size:22px;font-weight:600">${esc(title)}</h1>${bodyHtml}</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #E2DDD3;font-size:12px;color:#5E5A52">
Questions? Reply to this email or write to ${esc(BRAND.supportEmail)}. ${esc(BRAND.serviceHours)}.<br>${esc(BRAND.legalName)}, ${esc(BRAND.address)}
</td></tr></table></td></tr></table></body></html>`;
}

const p = (s: string) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6">${s}</p>`;
const button = (href: string, label: string) =>
  `<p style="margin:24px 0"><a href="${esc(href)}" style="background:#151515;color:#F2EEE6;padding:12px 22px;text-decoration:none;font-size:14px;letter-spacing:.04em">${esc(label)}</a></p>`;

export type OrderEmailData = {
  orderNumber: string;
  name: string;
  currency: string;
  totalMinor: number;
  items: { name: string; size: string; colour: string; quantity: number; lineTotalMinor: number }[];
  trackUrl: string;
};

function itemsTable(o: OrderEmailData) {
  const rows = o.items
    .map((i) => `<tr><td style="padding:8px 0;font-size:14px">${esc(i.name)}<br><span style="color:#5E5A52">${esc(i.colour)} / ${esc(i.size)} × ${i.quantity}</span></td><td align="right" style="font-size:14px">${esc(formatMoney(i.lineTotalMinor, o.currency))}</td></tr>`)
    .join("");
  return `<table width="100%" style="border-top:1px solid #E2DDD3;border-bottom:1px solid #E2DDD3;margin:16px 0">${rows}
  <tr><td style="padding:10px 0;font-weight:600">Total paid</td><td align="right" style="font-weight:600">${esc(formatMoney(o.totalMinor, o.currency))}</td></tr></table>`;
}

function plain(lines: string[]) {
  return lines.join("\n");
}

export const templates = {
  verifyEmail: (url: string) => ({
    subject: "Confirm your email",
    html: layout("Confirm your email", p("Confirm this address to finish setting up your Kyveron account. The link expires in 24 hours.") + button(url, "Confirm email")),
    text: plain(["Confirm your email for Kyveron:", url, "The link expires in 24 hours."]),
  }),
  resetPassword: (url: string) => ({
    subject: "Reset your password",
    html: layout("Reset your password", p("Use this link to choose a new password. It expires in 1 hour. If you did not ask for this, ignore this email; your password stays the same.") + button(url, "Choose a new password")),
    text: plain(["Reset your Kyveron password:", url, "The link expires in 1 hour. If you did not ask for this, ignore this email."]),
  }),
  orderConfirmed: (o: OrderEmailData) => ({
    subject: `Order ${o.orderNumber} confirmed`,
    html: layout(`Thank you, ${o.name}`, p(`We have your order <strong>${esc(o.orderNumber)}</strong> and your payment is confirmed. We will email you again when it ships.`) + itemsTable(o) + button(o.trackUrl, "Track your order")),
    text: plain([`Order ${o.orderNumber} confirmed.`, `Total: ${formatMoney(o.totalMinor, o.currency)}`, `Track: ${o.trackUrl}`]),
  }),
  paymentFailed: (o: OrderEmailData, retryUrl: string) => ({
    subject: `Payment for ${o.orderNumber} did not go through`,
    html: layout("Your payment did not go through", p(`No money was taken for order <strong>${esc(o.orderNumber)}</strong>. If your bank shows a debit, it is reversed automatically, usually within 5 to 7 working days. Your items are held for a short time if you would like to try again.`) + button(retryUrl, "Try payment again")),
    text: plain([`Payment for ${o.orderNumber} did not go through.`, `Try again: ${retryUrl}`]),
  }),
  shipped: (o: OrderEmailData, courier: string, tracking: string, trackingUrl: string | null) => ({
    subject: `Order ${o.orderNumber} has shipped`,
    html: layout("Your order is on its way", p(`Order <strong>${esc(o.orderNumber)}</strong> has left our warehouse with ${esc(courier)}. Tracking number: <strong>${esc(tracking)}</strong>.`) + button(trackingUrl ?? o.trackUrl, "Track shipment")),
    text: plain([`Order ${o.orderNumber} shipped with ${courier}.`, `Tracking: ${tracking}`, trackingUrl ?? o.trackUrl]),
  }),
  statusUpdate: (o: OrderEmailData, heading: string, message: string) => ({
    subject: `${heading}: ${o.orderNumber}`,
    html: layout(heading, p(esc(message)) + button(o.trackUrl, "View order")),
    text: plain([`${heading}: ${o.orderNumber}`, message, o.trackUrl]),
  }),
  ticketReceived: (ref: string) => ({
    subject: `We received your message (${ref})`,
    html: layout("We have your message", p(`Your reference is <strong>${esc(ref)}</strong>. We reply within one working day during ${esc(BRAND.serviceHours)}.`)),
    text: plain([`We received your message. Reference ${ref}.`]),
  }),
  backInStock: (productName: string, url: string) => ({
    subject: `${productName} is back`,
    html: layout(`${productName} is back in stock`, p("The size you asked about is available again. Stock is limited to what we have on the shelf.") + button(url, "View product")),
    text: plain([`${productName} is back in stock.`, url]),
  }),
};
