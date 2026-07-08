/* AURUM dashboard — currency preference, order tracking,
   saved studio designs, wishlist. */
import { byId, money, CURRENCIES, currentCurrency, setCurrency } from "./data.js";
import { plate } from "./garments.js";
import { mountChrome, wishStore, toast } from "./ui.js";

mountChrome({ current: "" });
const el = id => document.getElementById(id);

/* ---------- Currency preference (the dashboard option) ---------- */
const sel = el("pref-currency");
sel.innerHTML = Object.entries(CURRENCIES).map(([code, c]) =>
  `<option value="${code}" ${code === currentCurrency() ? "selected" : ""}>${c.label} — ${new Intl.NumberFormat(c.locale, { style: "currency", currency: code, maximumFractionDigits: 0 }).format(1000 * c.rate)} per $1,000</option>`).join("");
sel.addEventListener("change", () => {
  setCurrency(sel.value);
  toast(`Boutique currency set to ${sel.value}`);
  setTimeout(() => location.reload(), 700);
});

/* Certificate name */
const nameInput = el("pref-name");
nameInput.value = localStorage.getItem("aurum.certName") ?? "";
nameInput.addEventListener("change", () => {
  localStorage.setItem("aurum.certName", nameInput.value.trim());
  if (nameInput.value.trim()) toast("Noted. Your certificates will carry it.");
});

/* ---------- Orders & tracking ---------- */
const STAGES = ["Confirmed", "In the atelier", "Quality inspection", "Dispatched"];
function stageFor(order) {
  const days = (Date.now() - order.at) / 86400000;
  return days < 1 ? 0 : days < 7 ? 1 : days < 14 ? 2 : 3;
}
let orders = [];
try { orders = JSON.parse(localStorage.getItem("aurum.orders")) ?? []; } catch {}

el("orders-list").innerHTML = orders.length ? orders.map(o => {
  const stage = stageFor(o);
  const items = o.items.map(i => ({ ...i, p: byId(i.id) })).filter(i => i.p);
  return `
  <article class="order-card">
    <div class="order-head">
      <div>
        <strong>${o.id}</strong>
        <span class="prov" style="display:block">${new Date(o.at).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })} · ${o.method.toUpperCase()} · ${o.ref}</span>
      </div>
      <span class="price" style="font-family:var(--font-display);font-size:var(--step-1);color:var(--gold-ink)">${money(o.totalUSD)}</span>
    </div>
    <ol class="track" aria-label="Order progress">
      ${STAGES.map((s, i) => `<li class="${i <= stage ? "done" : ""}" ${i === stage ? 'aria-current="step"' : ""}>${s}</li>`).join("")}
    </ol>
    <div class="order-items">
      ${items.map(i => `<span class="thumb" title="${i.p.name}">${plate(i.p, { colorway: i.cw, alt: i.p.name })}</span>`).join("")}
      <span class="prov">${items.reduce((t, i) => t + i.qty, 0)} piece(s) · ${o.packaging}</span>
    </div>
  </article>`;
}).join("") : `<p class="empty-note">No acquisitions yet. The <a href="collection.html?c=men">galleries</a> are open.</p>`;

/* ---------- Saved designs ---------- */
let designs = [];
try { designs = JSON.parse(localStorage.getItem("aurum.designs")) ?? []; } catch {}
el("designs-list").innerHTML = designs.length ? designs.map(d => `
  <a class="opt-btn" href="studio.html">
    <span>${d.name}<br><span class="sub">${new Date(d.at).toLocaleDateString()} · recall &amp; reorder in the Studio</span></span>
    <span class="delta">${money(d.total)}</span>
  </a>`).join("")
  : `<p class="empty-note">Nothing designed yet. <a href="studio.html">The Studio</a> awaits your pattern.</p>`;

/* ---------- Wishlist ---------- */
const wished = wishStore.get().map(byId).filter(Boolean);
el("wish-list").innerHTML = wished.length ? wished.map(p => `
  <div class="cart-row">
    <a class="thumb" href="product.html?id=${p.id}" aria-label="${p.name}">${plate(p, { alt: "" })}</a>
    <div>
      <h5><a href="product.html?id=${p.id}">${p.name}</a></h5>
      <span class="meta">${p.fabric} · ${money(p.price)}</span>
    </div>
    <button class="btn btn-line" type="button" data-add="${p.id}" style="min-height:2.4rem;padding:0.4rem 1rem">Add</button>
  </div>`).join("")
  : `<p class="empty-note">Nothing kept yet. Mark pieces with the heart as you browse.</p>`;
