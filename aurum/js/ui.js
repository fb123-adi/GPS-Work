/* AURUM chrome — header/footer, cart & wishlist, search, drawers,
   reveals, toasts. Imported by every page. */
import { ALL, byId, money } from "./data.js";
import { plate } from "./garments.js";

document.documentElement.classList.add("js");

/* ---------- Icons (one hairline family) ---------- */
export const icon = {
  search: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/></svg>`,
  heart: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 20.5C7 16.5 3 13 3 8.9 3 6.2 5.1 4 7.8 4c1.7 0 3.3.9 4.2 2.3C12.9 4.9 14.5 4 16.2 4 18.9 4 21 6.2 21 8.9c0 4.1-4 7.6-9 11.6Z"/></svg>`,
  bag: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 8h14l-1 12.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20.5L5 8Z"/><path d="M8.5 10V6.5a3.5 3.5 0 0 1 7 0V10"/></svg>`,
  user: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c1.4-3.4 4.2-5 7.5-5s6.1 1.6 7.5 5"/></svg>`,
  arrow: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>`,
  down: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 4v16m-6-6 6 6 6-6"/></svg>`,
  check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m4.5 12.5 5 5L19.5 7"/></svg>`,
  close: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19"/></svg>`,
  menu: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 6.5h18M3 12h18M3 17.5h18"/></svg>`,
  shield: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3 4.5 6v5.5c0 4.6 3.2 7.9 7.5 9.5 4.3-1.6 7.5-4.9 7.5-9.5V6L12 3Z"/></svg>`,
  globe: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.4 3.9 5.2 3.9 8.5S14.6 18.1 12 20.5C9.4 18.1 8.1 15.3 8.1 12S9.4 5.9 12 3.5Z"/></svg>`,
  box: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/></svg>`,
  spark: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3c.6 4.8 4.2 8.4 9 9-4.8.6-8.4 4.2-9 9-.6-4.8-4.2-8.4-9-9 4.8-.6 8.4-4.2 9-9Z"/></svg>`,
};

const MARK = `<svg class="mark" width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 2 30 30H24.4L16 12.4 7.6 30H2L16 2Z" stroke="currentColor" stroke-width="1.4"/><path d="M10.5 23h11" stroke="currentColor" stroke-width="1.4"/></svg>`;

/* ---------- Stores ---------- */
const store = (key, fallback) => ({
  get() { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set(v) { localStorage.setItem(key, JSON.stringify(v)); },
});
export const cartStore = store("aurum.cart", []);
export const wishStore = store("aurum.wishlist", []);
export const seenStore = store("aurum.seen", []);

export function addToCart(id, opts = {}) {
  const cart = cartStore.get();
  const line = cart.find(l => l.id === id && l.size === (opts.size || "M") && l.cw === (opts.cw ?? 0));
  if (line) line.qty += 1;
  else cart.push({ id, qty: 1, size: opts.size || "M", cw: opts.cw ?? 0 });
  cartStore.set(cart);
  syncBadges(); renderCart();
  toast(`${byId(id)?.name ?? "Piece"} placed in your cart`);
}
export function toggleWish(id, btn) {
  let w = wishStore.get();
  const has = w.includes(id);
  w = has ? w.filter(x => x !== id) : [...w, id];
  wishStore.set(w);
  if (btn) btn.setAttribute("aria-pressed", String(!has));
  syncBadges();
  toast(has ? "Removed from your wishlist" : "Kept in your wishlist");
}
export function markSeen(id) {
  const seen = seenStore.get().filter(x => x !== id);
  seen.unshift(id);
  seenStore.set(seen.slice(0, 8));
}

/* ---------- Chrome ---------- */
const NAV = [
  ["index.html", "Home"],
  ["collection.html?c=men", "Men"],
  ["collection.html?c=women", "Women"],
  ["collection.html?c=unisex", "Unisex"],
  ["collection.html?c=kids", "Kids"],
  ["studio.html", "Studio"],
  ["membership.html", "Membership"],
  ["about.html", "About"],
];

export function mountChrome({ current = "" } = {}) {
  const header = document.getElementById("site-header");
  if (header) {
    header.className = "site-header";
    header.innerHTML = `
    <div class="wrap header-bar">
      <button class="icon-btn nav-toggle" type="button" aria-expanded="false" aria-controls="main-nav" aria-label="Open menu">${icon.menu}</button>
      <a class="brand" href="index.html">${MARK}<span>AURUM</span></a>
      <nav class="main-nav" id="main-nav" aria-label="Main">
        ${NAV.map(([href, label]) => `<a href="${href}" ${current === label.toLowerCase() ? 'aria-current="page"' : ""}>${label}</a>`).join("")}
      </nav>
      <div class="header-actions">
        <button class="icon-btn" type="button" data-open-search aria-label="Search the house">${icon.search}</button>
        <button class="icon-btn" type="button" data-open-wishlist aria-label="Wishlist">${icon.heart}<span class="count" data-wish-count></span></button>
        <button class="icon-btn" type="button" data-open-cart aria-label="Cart">${icon.bag}<span class="count" data-cart-count></span></button>
        <a class="icon-btn" href="membership.html" aria-label="Member profile">${icon.user}</a>
      </div>
    </div>`;
    const onScroll = () => header.classList.toggle("scrolled", scrollY > 24);
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
    const toggle = header.querySelector(".nav-toggle");
    const nav = header.querySelector(".main-nav");
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }

  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.className = "site-footer";
    footer.innerHTML = `
    <div class="wrap">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="brand" href="index.html">${MARK}<span>AURUM</span></a>
          <p>Luxury sportswear engineered for excellence. Ateliers in Biella, Kyoto and Zürich; worn in one hundred and forty countries.</p>
          <div class="footer-social">
            <a class="icon-btn" href="about.html#journal" aria-label="AURUM Journal">${icon.spark}</a>
            <a class="icon-btn" href="about.html#contact" aria-label="Contact the maison">${icon.globe}</a>
          </div>
        </div>
        <div>
          <h4>The House</h4>
          <ul>
            <li><a href="about.html">About AURUM</a></li>
            <li><a href="about.html#journal">Journal</a></li>
            <li><a href="about.html#heritage">Heritage</a></li>
            <li><a href="about.html#contact">Careers</a></li>
            <li><a href="membership.html">Membership</a></li>
          </ul>
        </div>
        <div>
          <h4>Collections</h4>
          <ul>
            <li><a href="collection.html?c=men">Men</a></li>
            <li><a href="collection.html?c=women">Women</a></li>
            <li><a href="collection.html?c=unisex">Unisex</a></li>
            <li><a href="collection.html?c=kids">Kids</a></li>
            <li><a href="studio.html">Customization Studio</a></li>
          </ul>
        </div>
        <div>
          <h4>Client Care</h4>
          <ul>
            <li><a href="about.html#contact">Customer support</a></li>
            <li><a href="about.html#care">Shipping &amp; returns</a></li>
            <li><a href="about.html#care">Care guide</a></li>
            <li><a href="about.html#care">Store locator</a></li>
            <li><a href="about.html#care">Privacy &amp; terms</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&#169; ${new Date().getFullYear()} AURUM Maison. Luxury. Performance. Legacy.</span>
        <span>Crafted in-house · No ordinary threads</span>
      </div>
    </div>`;
  }

  mountDrawers();
  mountToast();
  syncBadges();
  bindGlobalActions();
  revealObserver();
}

/* ---------- Drawers ---------- */
function mountDrawers() {
  const host = document.createElement("div");
  host.innerHTML = `
  <dialog class="drawer" id="cart-drawer" aria-label="Shopping cart">
    <div class="drawer-head"><h3>Your Cart</h3><button class="icon-btn" type="button" data-close aria-label="Close cart">${icon.close}</button></div>
    <div class="drawer-body" id="cart-body"></div>
  </dialog>
  <dialog class="drawer" id="wish-drawer" aria-label="Wishlist">
    <div class="drawer-head"><h3>Wishlist</h3><button class="icon-btn" type="button" data-close aria-label="Close wishlist">${icon.close}</button></div>
    <div class="drawer-body" id="wish-body"></div>
  </dialog>
  <dialog class="search-overlay" id="search-overlay" aria-label="Search">
    <div class="search-input-row">${icon.search}<input type="search" id="search-input" placeholder="Search the house — hoodie, emerald, bomber…" aria-label="Search products"><button class="icon-btn" type="button" data-close aria-label="Close search">${icon.close}</button></div>
    <div class="search-results" id="search-results" role="listbox" aria-label="Search results"></div>
    <p class="search-hint">160 pieces across four collections. Press <kbd>Esc</kbd> to close.</p>
  </dialog>`;
  document.body.append(...host.children);

  document.querySelectorAll("dialog [data-close]").forEach(b =>
    b.addEventListener("click", () => b.closest("dialog").close()));
  document.querySelectorAll("dialog").forEach(d =>
    d.addEventListener("click", e => { if (e.target === d) d.close(); }));

  const input = document.getElementById("search-input");
  input.addEventListener("input", () => renderSearch(input.value));
}

function thumbFor(p, cw = 0) {
  return `<span class="thumb" aria-hidden="true">${plate(p, { colorway: cw, alt: "" })}</span>`;
}

export function renderCart() {
  const body = document.getElementById("cart-body");
  if (!body) return;
  const cart = cartStore.get();
  if (!cart.length) {
    body.innerHTML = `<p class="empty-note">Your cart is empty.<br>The collection awaits.</p>
      <a class="btn btn-ghost" href="collection.html?c=men">Explore the collection</a>`;
    return;
  }
  const total = cart.reduce((t, l) => t + (byId(l.id)?.price ?? 0) * l.qty, 0);
  body.innerHTML = cart.map((l, i) => {
    const p = byId(l.id); if (!p) return "";
    return `
    <div class="cart-row">
      ${thumbFor(p, l.cw)}
      <div>
        <h5>${p.name}</h5>
        <span class="meta">Size ${l.size} · ${p.colorways[l.cw]?.name ?? ""}</span>
        <div class="qty" role="group" aria-label="Quantity for ${p.name}">
          <button type="button" data-qty="${i}:-1" aria-label="Decrease quantity">&#8722;</button>
          <span aria-live="polite">${l.qty}</span>
          <button type="button" data-qty="${i}:1" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <strong>${money(p.price * l.qty)}</strong>
    </div>`;
  }).join("") + `
    <div class="cart-total"><span class="prov">Total · duties included</span><strong>${money(total)}</strong></div>
    <button class="btn btn-gold" type="button" data-checkout>Proceed to checkout</button>
    <p class="prov" style="text-align:center">Signature packaging &amp; certificate included</p>`;

  body.querySelectorAll("[data-qty]").forEach(b => b.addEventListener("click", () => {
    const [i, d] = b.dataset.qty.split(":").map(Number);
    const c = cartStore.get();
    c[i].qty += d;
    if (c[i].qty <= 0) c.splice(i, 1);
    cartStore.set(c); syncBadges(); renderCart();
  }));
  body.querySelector("[data-checkout]")?.addEventListener("click", () => {
    toast("A concierge will complete your order — this maison is a showcase");
  });
}

function renderWishlist() {
  const body = document.getElementById("wish-body");
  if (!body) return;
  const w = wishStore.get().map(byId).filter(Boolean);
  body.innerHTML = w.length ? w.map(p => `
    <div class="cart-row">
      ${thumbFor(p)}
      <div>
        <h5><a href="product.html?id=${p.id}">${p.name}</a></h5>
        <span class="meta">${p.fabric} · ${money(p.price)}</span>
      </div>
      <button class="icon-btn" type="button" data-unwish="${p.id}" aria-label="Remove ${p.name} from wishlist">${icon.close}</button>
    </div>`).join("")
    : `<p class="empty-note">Nothing kept yet.<br>Mark the pieces that speak to you.</p>`;
  body.querySelectorAll("[data-unwish]").forEach(b => b.addEventListener("click", () => {
    toggleWish(b.dataset.unwish); renderWishlist();
  }));
}

function renderSearch(q) {
  const box = document.getElementById("search-results");
  q = q.trim().toLowerCase();
  if (!q) { box.innerHTML = ""; return; }
  const hits = ALL.filter(p =>
    p.name.toLowerCase().includes(q) || p.item.toLowerCase().includes(q) ||
    p.group.toLowerCase().includes(q) || p.capsule.toLowerCase().includes(q) ||
    p.fabric.toLowerCase().includes(q) || p.catLabel.toLowerCase().includes(q) ||
    p.colorways.some(c => c.name.toLowerCase().includes(q))
  ).slice(0, 8);
  box.innerHTML = hits.length
    ? hits.map(p => `<a href="product.html?id=${p.id}" role="option">${thumbFor(p)}<span>${p.name}<br><small class="prov">${p.catLabel} · ${p.group}</small></span><span class="price">${money(p.price)}</span></a>`).join("")
    : `<p class="search-hint">Nothing in the archive matches “${q}”.</p>`;
}

/* ---------- Global actions ---------- */
function bindGlobalActions() {
  document.addEventListener("click", e => {
    const add = e.target.closest("[data-add]");
    if (add) { addToCart(add.dataset.add); return; }
    const wish = e.target.closest("[data-wish]");
    if (wish) { toggleWish(wish.dataset.wish, wish); return; }
    if (e.target.closest("[data-open-cart]")) { renderCart(); document.getElementById("cart-drawer").showModal(); }
    if (e.target.closest("[data-open-wishlist]")) { renderWishlist(); document.getElementById("wish-drawer").showModal(); }
    if (e.target.closest("[data-open-search]")) {
      document.getElementById("search-overlay").showModal();
      document.getElementById("search-input").focus();
    }
  });
  document.addEventListener("keydown", e => {
    if (e.key === "/" && !e.target.closest("input, textarea")) {
      e.preventDefault();
      document.getElementById("search-overlay").showModal();
      document.getElementById("search-input").focus();
    }
  });
  // Reflect wishlist state on plates already in the DOM
  const w = wishStore.get();
  document.querySelectorAll("[data-wish]").forEach(b =>
    b.setAttribute("aria-pressed", String(w.includes(b.dataset.wish))));
}

export function syncBadges() {
  const cart = cartStore.get().reduce((t, l) => t + l.qty, 0);
  const wish = wishStore.get().length;
  document.querySelectorAll("[data-cart-count]").forEach(el => el.textContent = cart || "");
  document.querySelectorAll("[data-wish-count]").forEach(el => el.textContent = wish || "");
}

/* ---------- Toast ---------- */
let toastTimer;
function mountToast() {
  const t = document.createElement("div");
  t.className = "toast"; t.id = "toast"; t.setAttribute("role", "status");
  document.body.append(t);
}
export function toast(msg) {
  const t = document.getElementById("toast");
  t.innerHTML = `${icon.check}<span>${msg}</span>`;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 3400);
}

/* ---------- Reveals ---------- */
let revealIO = null;
function revealObserver() { watchReveals(document); }

/* Observe .reveal elements (call again after injecting content).
   Content is visible by default; this only adds the entrance. */
export function watchReveals(scope = document) {
  const els = [...scope.querySelectorAll(".reveal:not(.in)")].filter(el => !el.dataset.revealWatched);
  if (!els.length) return;
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    els.forEach(el => el.classList.add("in")); return;
  }
  revealIO ??= new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); revealIO.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  els.forEach(el => { el.dataset.revealWatched = "1"; revealIO.observe(el); });
  // Safety: nothing stays hidden if the observer misfires
  setTimeout(() => els.forEach(el => el.classList.add("in")), 2600);
}

/* Re-arm reveals for late-rendered content: show immediately */
export function armReveals(scope = document) {
  scope.querySelectorAll(".reveal:not(.in)").forEach(el => el.classList.add("in"));
}

/* ---------- Hero entrance ---------- */
export function heroEntrance() {
  requestAnimationFrame(() =>
    document.querySelectorAll(".hero-stage").forEach(el => el.classList.add("arrived")));
}
