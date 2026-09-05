/* AURUM product atelier — plates, 360° view, options, provenance. */
import { byId, CATALOG, money } from "./data.js";
import { plate, exhibitCard } from "./garments.js";
import { mountChrome, addToCart, toggleWish, wishStore, markSeen, seenStore, armReveals, toast } from "./ui.js";

const params = new URLSearchParams(location.search);
const product = byId(params.get("id")) || CATALOG.men[0];
mountChrome({ current: product.cat });
markSeen(product.id);

document.title = `${product.name} — AURUM`;
let cw = 0, size = "M", viewer = null, activeTab = "front";

/* ---------- Copy ---------- */
const el = id => document.getElementById(id);
el("p-prov").innerHTML = `<span class="n">N&#186; ${String(product.n).padStart(3, "0")}</span> · ${product.catLabel} · ${product.capsule}`;
el("p-name").textContent = product.name;
el("p-line").textContent = `${product.fabric}, sourced in ${product.origin}. Exhibited as plate ${String(product.n).padStart(3, "0")} of the ${product.catLabel.toLowerCase()} floor.`;
el("p-price").textContent = money(product.price);
el("p-rating").innerHTML = `<span class="n">★ ${product.rating}</span> · ${product.reviews} client words`;

/* ---------- Media stage ---------- */
const stage = el("stage");
const has3D = ["tee","oversizedTee","cropTee","tank","polo","compression","hoodie","cropHoodie","sweatshirt","jersey","jacket","bomber","windbreaker","puffer","coat","blazer","vest","joggers","cargo","shorts","leggings","bra","dress","skirt","set","swim"].includes(product.silhouette);
const TABS = [["front", "Plate"], ["back", "Reverse"], ["detail", "Fabric zoom"]];
if (has3D) TABS.push(["atelier", "360° Atelier"]);

function paintStage() {
  if (activeTab === "atelier") {
    stage.innerHTML = `<div id="viewer3d" style="position:absolute;inset:0"></div>
      <span class="stage-note">Drag to rotate · scroll to zoom</span>`;
    import("./garment3d.js").then(m => {
      viewer = m.createViewer(document.getElementById("viewer3d"), {
        type: product.silhouette,
        color: product.colorways[cw].hex,
        accent: product.colorways[cw].stroke,
        fabric: "merino",
      });
      if (!viewer) fallbackStage();
    }).catch(fallbackStage);
  } else {
    viewer?.dispose(); viewer = null;
    stage.innerHTML = plate(product, { colorway: cw, view: activeTab, emboss: true }) +
      `<span class="stage-note">${activeTab === "detail" ? "Engraving, 2.3× magnification" : "House plate, " + product.colorways[cw].name}</span>`;
  }
}
function fallbackStage() { activeTab = "front"; paintTabs(); paintStage(); }

const tabsBox = el("media-tabs");
function paintTabs() {
  tabsBox.innerHTML = TABS.map(([id, label]) =>
    `<button type="button" role="tab" aria-selected="${id === activeTab}" data-tab="${id}">${label}</button>`).join("");
  tabsBox.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
    activeTab = b.dataset.tab; paintTabs(); paintStage();
  }));
}
paintTabs(); paintStage();

/* ---------- Colorways ---------- */
const cwRow = el("cw-row");
function paintCw() {
  el("cw-name").textContent = product.colorways[cw].name;
  cwRow.innerHTML = product.colorways.map((c, i) => `
    <button class="swatch-dot" type="button" aria-pressed="${i === cw}" aria-label="Colorway: ${c.name}">
      <i style="background:${c.hex};border:1px solid rgba(234,227,210,0.25)"></i>
    </button>`).join("");
  cwRow.querySelectorAll("button").forEach((b, i) => b.addEventListener("click", () => {
    cw = i; paintCw();
    if (viewer) viewer.set({ color: product.colorways[cw].hex, accent: product.colorways[cw].stroke });
    else paintStage();
  }));
}
paintCw();

/* ---------- Sizes ---------- */
const SIZES = product.cat === "kids" ? ["4Y", "6Y", "8Y", "10Y", "12Y", "14Y"] : ["XS", "S", "M", "L", "XL", "XXL"];
size = SIZES[2];
const sizeRow = el("size-row");
function paintSizes() {
  sizeRow.innerHTML = SIZES.map(s =>
    `<button class="size-btn" type="button" aria-pressed="${s === size}">${s}</button>`).join("");
  sizeRow.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
    size = b.textContent; paintSizes();
  }));
}
paintSizes();

/* ---------- Actions ---------- */
el("add-btn").addEventListener("click", () => addToCart(product.id, { size, cw }));
const wishBtn = el("wish-btn");
function syncWish() {
  const kept = wishStore.get().includes(product.id);
  wishBtn.setAttribute("aria-pressed", String(kept));
  wishBtn.textContent = kept ? "Kept in wishlist ✓" : "Keep in wishlist";
}
wishBtn.addEventListener("click", () => { toggleWish(product.id); syncWish(); });
syncWish();

/* ---------- Accordion ---------- */
el("acc").innerHTML = `
  <details open>
    <summary>Material &amp; craft</summary>
    <div class="acc-body">
      <p>${product.fabric}, sourced and finished in ${product.origin}. Every seam is bar-tacked twice and inspected under magnification before the plate number is assigned.</p>
      <p>Capsule: ${product.capsule}. Rated ★ ${product.rating} across ${product.reviews} client words.</p>
    </div>
  </details>
  <details>
    <summary>Sizing &amp; fit assistant</summary>
    <div class="acc-body">
      <p>Cut true to the house block. Between sizes, the atelier recommends the smaller for compression pieces and the larger for outerwear layering.</p>
      <p>For a measured fit, the <a href="studio.html">Customization Studio</a> drafts a one-of-one pattern to your dimensions.</p>
    </div>
  </details>
  <details>
    <summary>Packaging &amp; certificate</summary>
    <div class="acc-body">
      <p>Arrives in the lacquered house box with archival tissue, a numbered brass tag, and a certificate of authenticity signed by the atelier director.</p>
    </div>
  </details>
  <details>
    <summary>Delivery &amp; warranty</summary>
    <div class="acc-body">
      <p>Complimentary worldwide express, 2–4 days, duties included. Members receive priority dispatch. Every piece carries a lifetime seam warranty: if a seam fails, the atelier repairs it without charge, forever.</p>
    </div>
  </details>`;

/* ---------- Reviews ---------- */
const NAMES = ["Alessandro R.", "Yuki T.", "Camille D.", "Viktor H.", "Amara O."];
const WORDS = [
  "The weight of the fabric is the first thing you notice. The second is that you stop noticing anything else.",
  "Wore it through a red-eye and a board meeting. It looked better than I did.",
  "The gold seam is subtle to the point of secrecy. Exactly right.",
  "Sized as promised. The plate number makes it feel like mine alone.",
  "Third piece from this floor. The consistency is almost unsettling.",
];
el("reviews").innerHTML = [0, 1, 2].map(i => `
  <div class="review">
    <span class="stars" aria-label="${5 - (i % 2)} of 5 stars">${"★".repeat(5 - (i % 2))}${"☆".repeat(i % 2)}</span>
    <p style="margin:0">${WORDS[(product.n + i) % WORDS.length]}</p>
    <span class="who">${NAMES[(product.n + i) % NAMES.length]} · Verified acquisition</span>
  </div>`).join("");

/* ---------- Pairings + trail ---------- */
const siblings = CATALOG[product.cat].filter(p => p.id !== product.id);
const recs = [
  ...siblings.filter(p => p.group === product.group),
  ...siblings.filter(p => p.group !== product.group),
].slice(0, 8);
el("rec-rail").innerHTML = recs.map(p => exhibitCard(p)).join("");

const seen = seenStore.get().filter(id => id !== product.id).map(byId).filter(Boolean);
if (seen.length) {
  el("seen-section").hidden = false;
  el("seen-rail").innerHTML = seen.map(p => exhibitCard(p)).join("");
}
armReveals();

/* Wishlist state on rails */
const w = wishStore.get();
document.querySelectorAll("[data-wish]").forEach(b =>
  b.setAttribute("aria-pressed", String(w.includes(b.dataset.wish))));
