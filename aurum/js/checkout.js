/* AURUM checkout — multi-currency register with gateway-ready stubs.
   Real integrations plug in at authorize():
     INR → Razorpay Orders API (order_id + Checkout.js)
     Cards/EUR/USD → Stripe PaymentIntents (client_secret + Elements)
   Both need a small server to hold secret keys; this static build
   simulates the authorization step and records the order locally. */
import { byId, money, currentCurrency } from "./data.js";
import { plate } from "./garments.js";
import { mountChrome, cartStore, syncBadges, toast } from "./ui.js";

mountChrome({ current: "" });

const cur = currentCurrency();
const cart = cartStore.get();
const el = id => document.getElementById(id);

/* ---------- Summary ---------- */
function lines() {
  return cart.map(l => ({ ...l, p: byId(l.id) })).filter(l => l.p);
}
function subtotal() { return lines().reduce((t, l) => t + l.p.price * l.qty, 0); }

function paintSummary() {
  const ls = lines();
  if (!ls.length) {
    el("summary-lines").innerHTML = `<p class="empty-note">Your cart is empty.</p><a class="btn btn-ghost" href="collection.html?c=men" style="width:100%">Enter the galleries</a>`;
    el("summary-totals").innerHTML = "";
    el("place-btn").disabled = true;
    return;
  }
  el("summary-lines").innerHTML = ls.map(l => `
    <div class="cart-row">
      <span class="thumb" aria-hidden="true">${plate(l.p, { colorway: l.cw, alt: "" })}</span>
      <div>
        <h5>${l.p.name}</h5>
        <span class="meta">Size ${l.size} · ${l.p.colorways[l.cw]?.name ?? ""} · Qty ${l.qty}</span>
      </div>
      <strong>${money(l.p.price * l.qty)}</strong>
    </div>`).join("");
  const sub = subtotal();
  const pack = PACKAGING[packChoice].delta;
  el("summary-totals").innerHTML = `
    <div class="brk"><span>Subtotal</span><span>${money(sub)}</span></div>
    <div class="brk"><span>Express shipping</span><span>Included</span></div>
    <div class="brk"><span>Duties &amp; taxes</span><span>Included</span></div>
    <div class="brk"><span>${PACKAGING[packChoice].label}</span><span>${pack ? "+" + money(pack) : "Included"}</span></div>
    <hr class="hairline" style="margin:0.7rem 0">
    <div class="brk total-row"><span class="prov">Total · ${cur}</span><strong>${money(sub + pack)}</strong></div>`;
}

/* ---------- Packaging ---------- */
const PACKAGING = [
  { label: "Signature lacquered box", sub: "Archival tissue, brass tag, certificate", delta: 0 },
  { label: "Gift presentation", sub: "Handwritten card, wax seal, ribbon", delta: 40 },
  { label: "Travel trunk", sub: "Miniature maison trunk, keepsake grade", delta: 180 },
];
let packChoice = 0;
function paintPack() {
  el("pack-list").innerHTML = PACKAGING.map((p, i) => `
    <button class="opt-btn" type="button" data-pack="${i}" aria-pressed="${i === packChoice}">
      <span>${p.label}<br><span class="sub">${p.sub}</span></span>
      <span class="delta">${p.delta ? "+" + money(p.delta) : "Included"}</span>
    </button>`).join("");
  el("pack-list").querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
    packChoice = +b.dataset.pack; paintPack(); paintSummary();
  }));
}

/* ---------- Payment methods (currency-aware) ---------- */
const METHODS = {
  card: { label: "Card", fields: `
    <div class="form-grid">
      <div class="field full"><label for="pm-card">Card number</label><input id="pm-card" inputmode="numeric" autocomplete="cc-number" placeholder="4242 4242 4242 4242" required></div>
      <div class="field"><label for="pm-exp">Expiry</label><input id="pm-exp" autocomplete="cc-exp" placeholder="MM / YY" required></div>
      <div class="field"><label for="pm-cvc">CVC</label><input id="pm-cvc" inputmode="numeric" autocomplete="cc-csc" placeholder="•••" required></div>
    </div>
    <p class="prov" style="margin-top:0.6rem">Visa · Mastercard · Amex · RuPay</p>` },
  upi: { label: "UPI", fields: `
    <div class="field"><label for="pm-vpa">UPI ID</label><input id="pm-vpa" placeholder="name@bank" required></div>
    <p class="prov" style="margin-top:0.6rem">GPay · PhonePe · Paytm · BHIM — collect request sent to your app</p>` },
  netbank: { label: "NetBanking", fields: `
    <div class="field"><label for="pm-bank">Bank</label>
      <select id="pm-bank"><option>HDFC Bank</option><option>ICICI Bank</option><option>State Bank of India</option><option>Axis Bank</option><option>Kotak Mahindra</option></select>
    </div>` },
  paypal: { label: "PayPal", fields: `
    <p style="font-size:var(--step--1);color:var(--ink-soft)">You will be redirected to PayPal to approve the payment, then returned to the maison.</p>` },
  sepa: { label: "SEPA", fields: `
    <div class="field"><label for="pm-iban">IBAN</label><input id="pm-iban" placeholder="DE89 3704 0044 0532 0130 00" required></div>` },
};
const METHODS_BY_CUR = {
  INR: ["upi", "card", "netbank"],
  EUR: ["card", "sepa", "paypal"],
  USD: ["card", "paypal"],
};
let method = METHODS_BY_CUR[cur][0];

function paintMethods() {
  const avail = METHODS_BY_CUR[cur];
  el("pay-currency").textContent = cur;
  el("pay-methods").innerHTML = avail.map(m =>
    `<button type="button" data-m="${m}" aria-pressed="${m === method}">${METHODS[m].label}</button>`).join("");
  el("pay-methods").querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
    method = b.dataset.m; paintMethods();
  }));
  el("pay-fields").innerHTML = METHODS[method].fields;
}

/* ---------- Authorize (gateway stub) ---------- */
async function authorize(total) {
  // Razorpay (INR):  POST /api/razorpay/order { amount } → open Checkout.js with order_id
  // Stripe (USD/EUR): POST /api/stripe/intent { amount, currency } → confirm with Elements
  await new Promise(r => setTimeout(r, 900)); // simulated gateway round-trip
  return { ok: true, ref: "PAY-" + Math.random().toString(36).slice(2, 10).toUpperCase() };
}

/* ---------- Orders ---------- */
const ordersStore = {
  get() { try { return JSON.parse(localStorage.getItem("aurum.orders")) ?? []; } catch { return []; } },
  set(v) { localStorage.setItem("aurum.orders", JSON.stringify(v)); },
};

el("checkout-form").addEventListener("submit", async e => {
  e.preventDefault();
  const form = e.target;
  if (!form.reportValidity()) return;
  if (!lines().length) return;
  const btn = el("place-btn");
  btn.disabled = true;
  btn.textContent = "Authorizing…";
  const total = subtotal() + PACKAGING[packChoice].delta;
  const pay = await authorize(total);
  if (!pay.ok) {
    btn.disabled = false; btn.textContent = "Place order";
    toast("The gateway declined. No charge was made; please retry.");
    return;
  }
  const id = "AU-" + new Date().getFullYear() + "-" + String(Math.floor(1000 + Math.random() * 9000));
  const orders = ordersStore.get();
  orders.unshift({
    id, at: Date.now(), currency: cur, ref: pay.ref, method,
    totalUSD: total, packaging: PACKAGING[packChoice].label,
    items: lines().map(l => ({ id: l.id, qty: l.qty, size: l.size, cw: l.cw })),
    status: "Confirmed",
  });
  ordersStore.set(orders);
  cartStore.set([]);
  syncBadges();
  el("done-id").textContent = `Order ${id} · ${pay.ref}`;
  el("checkout-live").hidden = true;
  el("checkout-done").hidden = false;
  scrollTo({ top: 0, behavior: "instant" });
});

paintPack();
paintMethods();
paintSummary();
