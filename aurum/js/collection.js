/* AURUM collection gallery — filter, sort, exhibit. */
import { CATALOG } from "./data.js";
import { exhibitCard } from "./garments.js";
import { mountChrome, armReveals, watchReveals, wishStore } from "./ui.js";

const params = new URLSearchParams(location.search);
const cat = ["men", "women", "unisex", "kids"].includes(params.get("c")) ? params.get("c") : "men";
const capsuleParam = params.get("capsule");

mountChrome({ current: cat });

const COPY = {
  men: ["Floor I", "Tailored for force. Forty-four numbered pieces, from merino compression to the travel blazer."],
  women: ["Floor II", "Sculpted, not squeezed. Forty numbered pieces cut on the bias and finished by hand."],
  unisex: ["Floor III", "One cut, every body. Forty pieces the whole house shares, travel systems included."],
  kids: ["Floor IV", "The next generation dresses like it. Forty pieces at half the scale, the same standard."],
};
const items = CATALOG[cat];
document.title = `${items[0].catLabel} Collection — AURUM`;
document.getElementById("floor-no").textContent = COPY[cat][0];
document.getElementById("col-title").textContent = items[0].catLabel;
document.getElementById("col-lead").textContent = COPY[cat][1];

/* Filters: groups present on this floor (+ capsule deep-links) */
const groups = [...new Set(items.map(p => p.group))];
let activeGroup = "all";
let activeCapsule = capsuleParam;

const chips = document.getElementById("chips");
function chipRow() {
  chips.innerHTML = [
    `<button class="chip" type="button" data-g="all" aria-pressed="${activeGroup === "all" && !activeCapsule}">All pieces</button>`,
    ...groups.map(g => `<button class="chip" type="button" data-g="${g}" aria-pressed="${activeGroup === g}">${g}</button>`),
    activeCapsule ? `<button class="chip" type="button" data-g="__capsule" aria-pressed="true">${activeCapsule} ✕</button>` : "",
  ].join("");
  chips.querySelectorAll(".chip").forEach(b => b.addEventListener("click", () => {
    if (b.dataset.g === "__capsule") { activeCapsule = null; }
    else { activeGroup = b.dataset.g; activeCapsule = null; }
    chipRow(); paint();
  }));
}

const sortSel = document.getElementById("sort");
sortSel.addEventListener("change", paint);

function paint() {
  let list = items;
  if (activeCapsule) list = list.filter(p => p.capsule === activeCapsule);
  else if (activeGroup !== "all") list = list.filter(p => p.group === activeGroup);
  const s = sortSel.value;
  list = [...list].sort((a, b) =>
    s === "price-asc" ? a.price - b.price :
    s === "price-desc" ? b.price - a.price :
    s === "name" ? a.name.localeCompare(b.name) : a.n - b.n);

  const grid = document.getElementById("grid");
  grid.innerHTML = list.length
    ? list.map(p => exhibitCard(p)).join("")
    : `<p class="empty-note" style="grid-column:1/-1">No pieces match this view. The archive holds them for another season.</p>`;
  document.getElementById("count").textContent = `${list.length} piece${list.length === 1 ? "" : "s"}`;

  const w = wishStore.get();
  grid.querySelectorAll("[data-wish]").forEach(b =>
    b.setAttribute("aria-pressed", String(w.includes(b.dataset.wish))));
  if (firstPaint) { watchReveals(grid); firstPaint = false; }
  else armReveals(grid);
}

let firstPaint = true;
chipRow();
paint();
