/* AURUM home — floors, rails, capsule, quotes, studio teaser. */
import { CATALOG, ALL, money } from "./data.js";
import { plate, exhibitCard } from "./garments.js";
import { mountChrome, heroEntrance, toast, watchReveals } from "./ui.js";

mountChrome({ current: "home" });
heroEntrance();

/* Featured capsule plate: a Signature Gold piece */
const capsulePiece = ALL.find(p => p.capsule === "Signature Gold" && p.silhouette === "bomber")
  || ALL.find(p => p.capsule === "Signature Gold") || CATALOG.men[14];
document.getElementById("capsule-plate").innerHTML =
  `<a class="plate" href="product.html?id=${capsulePiece.id}" aria-label="${capsulePiece.name}, ${money(capsulePiece.price)}">${plate(capsulePiece, { emboss: true })}<span class="plate-shine" aria-hidden="true"></span></a>`;

/* Collection floors */
const FLOOR_COPY = {
  men: ["I", "Tailored for force. Merino compression, storm shells, and the blazers that follow you from the gym to the gala."],
  women: ["II", "Sculpted, not squeezed. Leggings cut on the bias, silk-touch bras, and outerwear that answers weather with grace."],
  unisex: ["III", "One cut, every body. The oversized silhouettes and travel systems the whole house shares."],
  kids: ["IV", "The next generation dresses like it. Every kids' piece passes the same Biella standard at half the scale."],
};
document.getElementById("floors").innerHTML = Object.entries(CATALOG).map(([key, items]) => {
  const picks = [items[0], items[8], items[13]].filter(Boolean);
  const [numeral, copy] = FLOOR_COPY[key];
  return `
  <article class="floor">
    <div class="floor-copy">
      <span class="floor-index" aria-hidden="true">${numeral}</span>
      <h3>${items[0].catLabel}</h3>
      <p>${copy}</p>
      <a class="link-arrow" href="collection.html?c=${key}">Enter floor ${numeral}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></a>
    </div>
    <div class="floor-plates">
      ${picks.map(p => `<a class="plate reveal" href="product.html?id=${p.id}" aria-label="${p.name}, ${money(p.price)}">${plate(p)}<span class="plate-shine" aria-hidden="true"></span></a>`).join("")}
    </div>
  </article>`;
}).join("");

/* Best sellers rail */
const best = ALL.filter(p => p.bestseller).slice(0, 10);
document.getElementById("best-rail").innerHTML = best.map(p => exhibitCard(p)).join("");

/* Limited edition plates */
const ltd = ALL.filter(p => p.capsule === "Limited Edition").slice(0, 2);
document.getElementById("ltd-plates").innerHTML =
  ltd.map(p => `<a class="plate" href="product.html?id=${p.id}" aria-label="${p.name}, ${money(p.price)}">${plate(p)}</a>`).join("");

/* Materials */
const MATERIALS = [
  ["Biella Merino", "Spun at 17.5 microns in the Italian Alps. Regulates heat through a 40-degree swing; softens with every year of wear.", "merino", "Biella"],
  ["Aurum-Weave Recycled Knit", "Seventy-one recovered bottles per garment, knitted into a four-way stretch that outlasts its virgin equivalent.", "recycled", "Kyoto"],
  ["StormShell 3L", "A Swiss three-layer laminate: 28,000 mm waterproof, yet it breathes like poplin. Silent at full sprint.", "shell", "Zürich"],
];
const SWATCH = {
  merino: `<svg viewBox="0 0 80 80" role="img" aria-label="Merino weave swatch"><rect width="80" height="80" fill="#F2ECDD"/><g stroke="#A8842C" stroke-width="1" fill="none" opacity="0.9"><path d="M0 12 Q20 4 40 12 T80 12 M0 28 Q20 20 40 28 T80 28 M0 44 Q20 36 40 44 T80 44 M0 60 Q20 52 40 60 T80 60 M0 76 Q20 68 40 76 T80 76"/></g></svg>`,
  recycled: `<svg viewBox="0 0 80 80" role="img" aria-label="Recycled knit swatch"><rect width="80" height="80" fill="#F2ECDD"/><g stroke="#1F5B41" stroke-width="1" fill="none" opacity="0.9"><path d="M10 0 L10 80 M26 0 L26 80 M42 0 L42 80 M58 0 L58 80 M74 0 L74 80"/><path d="M0 20 L80 20 M0 40 L80 40 M0 60 L80 60" stroke="#6E6A5C" opacity="0.4"/></g></svg>`,
  shell: `<svg viewBox="0 0 80 80" role="img" aria-label="StormShell laminate swatch"><rect width="80" height="80" fill="#F2ECDD"/><g stroke="#2C4470" stroke-width="1" fill="none" opacity="0.9"><path d="M-10 20 L60 -10 M-10 45 L90 5 M-10 70 L90 30 M0 90 L90 55"/><circle cx="58" cy="56" r="12" stroke="#6E6A5C" opacity="0.45"/></g></svg>`,
};
document.getElementById("materials").innerHTML = MATERIALS.map(([name, copy, sw, origin], i) => `
  <div class="material-row reveal" ${i ? `data-stagger="${i}"` : ""}>
    <span class="swatch">${SWATCH[sw]}</span>
    <h4>${name}</h4>
    <p>${copy}</p>
    <span class="prov"><span class="n">${origin}</span></span>
  </div>`).join("");

/* Studio teaser: hoodie cycling through colorways */
const teaser = document.getElementById("teaser-plate");
const hoodie = CATALOG.men[0];
let cwIdx = 0;
function paintTeaser() {
  teaser.innerHTML = plate(hoodie, { colorway: cwIdx % hoodie.colorways.length, alt: `Studio preview: hoodie in ${hoodie.colorways[cwIdx % hoodie.colorways.length].name}` });
}
paintTeaser();
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  setInterval(() => { cwIdx += 1; paintTeaser(); }, 2600);
}

/* Quotes */
const QUOTES = [
  ["The first brand that survived both my tailor's eye and my coach's stopwatch.", "Elena V.", "Principal dancer, Vienna"],
  ["I bought the bomber for the gold seam. I kept it because nothing else fits like this.", "Marcus A.", "Founder, Singapore"],
  ["My kit number is 041 of 100. It hangs next to my race medals.", "Ingrid S.", "Alpine athlete, Oslo"],
];
const qBox = document.getElementById("quote-box");
const qDots = document.getElementById("quote-dots");
let qi = 0, qTimer;
function paintQuote(i, animate = true) {
  qi = i;
  const [text, who, role] = QUOTES[i];
  const swap = () => {
    qBox.innerHTML = `<blockquote>&#8220;${text}&#8221;</blockquote><cite><b>${who}</b> · ${role}</cite>`;
    qBox.classList.remove("out");
  };
  if (animate && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    qBox.classList.add("out"); setTimeout(swap, 320);
  } else swap();
  qDots.querySelectorAll("button").forEach((b, k) => b.setAttribute("aria-current", String(k === i)));
}
qDots.innerHTML = QUOTES.map((q, i) =>
  `<button type="button" role="tab" aria-label="Testimonial ${i + 1} from ${q[1]}"></button>`).join("");
qDots.querySelectorAll("button").forEach((b, i) =>
  b.addEventListener("click", () => { clearInterval(qTimer); paintQuote(i); }));
paintQuote(0, false);
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  qTimer = setInterval(() => paintQuote((qi + 1) % QUOTES.length), 7000);
}

/* Newsletter */
document.getElementById("nl-form").addEventListener("submit", e => {
  e.preventDefault();
  toast("Welcome to The Dispatch. Your first letter arrives with the season.");
  e.target.reset();
});

/* Watch the plates injected above */
watchReveals();

/* Hero scene: progressive enhancement */
import("./hero3d.js").then(m => m.mountHero(document.getElementById("hero-canvas"))).catch(() => {});
