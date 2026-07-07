/* AURUM Customization Studio — real-time 3D configurator,
   rule-based atelier assistant, live pricing, save/export/share. */
import { money } from "./data.js";
import { mountChrome, toast } from "./ui.js";
import { createViewer, FABRICS, PATTERNS } from "./garment3d.js";

mountChrome({ current: "studio" });

/* ---------- Options ---------- */
const TYPES = [
  ["tee", "T-Shirt", 380], ["oversizedTee", "Oversized Tee", 420], ["hoodie", "Hoodie", 640],
  ["sweatshirt", "Sweatshirt", 560], ["polo", "Polo Shirt", 460], ["jacket", "Jacket", 1450],
  ["bomber", "Bomber Jacket", 1650], ["windbreaker", "Windbreaker", 980],
  ["set", "Tracksuit", 1250], ["joggers", "Joggers", 520], ["shorts", "Shorts", 380],
  ["leggings", "Leggings", 440], ["bra", "Sports Bra", 340], ["compression", "Compression Wear", 480],
  ["jersey", "Football Jersey", 590], ["cropHoodie", "Crop Hoodie", 560],
  ["skirt", "Tennis Skirt", 420], ["dress", "Golf Dress", 780],
  ["swim", "Swimwear", 390], ["puffer", "Puffer Jacket", 1950],
];
const PRESETS = [
  ["#141310", "Noir"], ["#EAE3D2", "Ivory"], ["#14523C", "Emerald"],
  ["#5C1F2A", "Burgundy"], ["#22345F", "Sapphire"], ["#8A8E98", "Titanium"],
  ["#3A2E12", "Bronze"], ["#101820", "Midnight"], ["#4A3B63", "Amethyst"],
  ["#6E3B1F", "Cognac"], ["#1F3D3A", "Deep Teal"], ["#2B2B2B", "Graphite"],
];
const CONSTRUCTION = [
  { id: "stitch", label: "Gold stitch seams", sub: "24k-toned thread at every seam", delta: 90 },
  { id: "zip", label: "YKK Excella zip", sub: "Polished brass, engraved pull", delta: 70 },
  { id: "cuff", label: "Ribbed cuffs & hem", sub: "Double-knit, shape-retaining", delta: 45 },
  { id: "label", label: "Personalized inside label", sub: "Your name, woven not printed", delta: 35 },
  { id: "gift", label: "Gift wrap & message", sub: "Lacquered box, handwritten card", delta: 25 },
];

const state = {
  type: "hoodie",
  color: "#141310",
  accent: "#D4AF37",
  fabric: "merino",
  pattern: "none",
  monogram: "",
  lighting: "studio",
  construction: new Set(["stitch"]),
};

/* ---------- Viewer ---------- */
const host = document.getElementById("studio-canvas");
let viewer = createViewer(host, state);
if (!viewer) {
  host.innerHTML = `<p class="empty-note" style="margin:auto;align-self:center">The 3D atelier needs WebGL.<br>Your configuration still prices and saves below.</p>`;
}
const sync = patch => { Object.assign(state, patch); viewer?.set(patch); paintHud(); paintPrice(); };

/* ---------- Left column ---------- */
const typeList = document.getElementById("type-list");
function paintTypes() {
  typeList.innerHTML = TYPES.map(([id, label, base]) => `
    <button class="opt-btn" type="button" data-type="${id}" aria-pressed="${state.type === id}">
      <span>${label}</span><span class="delta">${money(base)}</span>
    </button>`).join("");
  typeList.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
    sync({ type: b.dataset.type }); paintTypes();
  }));
}
paintTypes();

const fabricList = document.getElementById("fabric-list");
function paintFabrics() {
  fabricList.innerHTML = Object.entries(FABRICS).map(([id, f]) => `
    <button class="opt-btn" type="button" data-fabric="${id}" aria-pressed="${state.fabric === id}">
      <span>${f.label}</span><span class="delta">${f.delta ? "+" + money(f.delta) : "Included"}</span>
    </button>`).join("");
  fabricList.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
    sync({ fabric: b.dataset.fabric }); paintFabrics();
  }));
}
paintFabrics();

/* ---------- Right column ---------- */
document.querySelectorAll("#light-seg button").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll("#light-seg button").forEach(x => x.setAttribute("aria-pressed", "false"));
  b.setAttribute("aria-pressed", "true");
  sync({ lighting: b.dataset.light });
}));

const presetGrid = document.getElementById("color-presets");
function paintPresets() {
  presetGrid.innerHTML = PRESETS.map(([hex, name]) => `
    <button class="swatch-dot" type="button" data-hex="${hex}" aria-pressed="${state.color.toLowerCase() === hex.toLowerCase()}" aria-label="Colour: ${name}">
      <i style="background:${hex};border:1px solid rgba(234,227,210,0.25)"></i>
    </button>`).join("");
  presetGrid.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
    document.getElementById("color-wheel").value = b.dataset.hex;
    sync({ color: b.dataset.hex }); paintPresets();
  }));
}
paintPresets();
document.getElementById("color-wheel").addEventListener("input", e => {
  sync({ color: e.target.value }); paintPresets();
});
document.getElementById("cw-reset").addEventListener("click", () => {
  document.getElementById("color-wheel").value = "#141310";
  sync({ color: "#141310" }); paintPresets();
});

const patternSeg = document.getElementById("pattern-seg");
function paintPatterns() {
  patternSeg.innerHTML = Object.entries(PATTERNS).map(([id, p]) =>
    `<button type="button" data-pattern="${id}" aria-pressed="${state.pattern === id}">${p.label}</button>`).join("");
  patternSeg.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
    sync({ pattern: b.dataset.pattern }); paintPatterns();
  }));
}
paintPatterns();

const monoInput = document.getElementById("mono-input");
monoInput.addEventListener("input", () => {
  document.getElementById("mono-count").textContent = `${monoInput.value.length} / 12`;
  sync({ monogram: monoInput.value });
});

const conList = document.getElementById("construction-list");
function paintConstruction() {
  conList.innerHTML = CONSTRUCTION.map(c => `
    <button class="opt-btn" type="button" data-con="${c.id}" aria-pressed="${state.construction.has(c.id)}">
      <span>${c.label}<br><span class="sub">${c.sub}</span></span><span class="delta">+${money(c.delta)}</span>
    </button>`).join("");
  conList.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
    const id = b.dataset.con;
    state.construction.has(id) ? state.construction.delete(id) : state.construction.add(id);
    paintConstruction(); paintPrice();
  }));
}
paintConstruction();

/* ---------- Price & HUD ---------- */
function pricing() {
  const base = TYPES.find(t => t[0] === state.type)?.[2] ?? 400;
  const fabric = FABRICS[state.fabric]?.delta ?? 0;
  const pattern = PATTERNS[state.pattern]?.delta ?? 0;
  const mono = state.monogram ? 55 : 0;
  const cons = [...state.construction].reduce((t, id) => t + (CONSTRUCTION.find(c => c.id === id)?.delta ?? 0), 0);
  return { base, fabric, finish: pattern + mono + cons, total: base + fabric + pattern + mono + cons };
}
function paintPrice() {
  const p = pricing();
  document.getElementById("pr-base").textContent = money(p.base);
  document.getElementById("pr-fabric").textContent = p.fabric ? "+" + money(p.fabric) : "Included";
  document.getElementById("pr-finish").textContent = p.finish ? "+" + money(p.finish) : "—";
  document.getElementById("pr-total").textContent = money(p.total);
}
function paintHud() {
  const t = TYPES.find(x => x[0] === state.type)?.[1] ?? "Piece";
  document.getElementById("hud-line").innerHTML =
    `<span class="n">${t}</span> · ${FABRICS[state.fabric].label} · ${PATTERNS[state.pattern].label}${state.monogram ? " · “" + state.monogram + "”" : ""}`;
}
paintPrice(); paintHud();

/* ---------- Atelier assistant (rule-based) ---------- */
const RULES = [
  [/emerald|green|forest/, { color: "#14523C" }],
  [/burgundy|wine|maroon|oxblood/, { color: "#5C1F2A" }],
  [/sapphire|navy|blue|royal blue/, { color: "#22345F" }],
  [/ivory|white|cream/, { color: "#EAE3D2" }],
  [/black|noir|dark|stealth/, { color: "#141310" }],
  [/silver|titanium|grey|gray/, { color: "#8A8E98" }],
  [/midnight/, { color: "#101820" }],
  [/gold/, { pattern: "stripe" }],
  [/racing|formula|speed/, { type: "jacket", pattern: "geometric", color: "#101820" }],
  [/football|soccer|jersey/, { type: "jersey" }],
  [/basketball/, { type: "jersey", pattern: "stripe" }],
  [/gym set|training set|gym/, { type: "set" }],
  [/hoodie/, { type: "hoodie" }],
  [/scandinavian|minimal|clean/, { pattern: "none", fabric: "merino", color: "#EAE3D2" }],
  [/tennis/, { type: "skirt", color: "#EAE3D2" }],
  [/yoga|studio/, { type: "leggings" }],
  [/camo|street/, { pattern: "camo" }],
  [/winter|thermal|cold/, { fabric: "fleece" }],
  [/rain|storm|waterproof/, { fabric: "shell", type: "windbreaker" }],
  [/silk|knit|soft|luxur/, { fabric: "knit" }],
  [/swim/, { type: "swim" }],
  [/bomber/, { type: "bomber" }],
];
const AI_EXAMPLES = [
  "Luxury black & gold football jersey",
  "Minimal Scandinavian hoodie",
  "Royal emerald gym set",
  "Formula-inspired racing jacket",
];
const aiInput = document.getElementById("ai-input");
const aiNote = document.getElementById("ai-note");
document.getElementById("ai-chips").innerHTML = AI_EXAMPLES.map(x =>
  `<button class="chip" type="button">${x}</button>`).join("");
document.querySelectorAll("#ai-chips .chip").forEach(b => b.addEventListener("click", () => {
  aiInput.value = b.textContent; runAssistant();
}));
aiInput.addEventListener("keydown", e => { if (e.key === "Enter") runAssistant(); });

function runAssistant() {
  const q = aiInput.value.toLowerCase();
  if (!q.trim()) return;
  const patch = {};
  RULES.forEach(([re, p]) => { if (re.test(q)) Object.assign(patch, p); });
  if (!Object.keys(patch).length) {
    aiNote.textContent = "The assistant reads moods like “emerald”, “racing”, “minimal”, “winter”. Try again with one.";
    return;
  }
  sync(patch);
  paintTypes(); paintFabrics(); paintPresets(); paintPatterns();
  if (patch.color) document.getElementById("color-wheel").value = patch.color;
  const parts = [];
  if (patch.type) parts.push(TYPES.find(t => t[0] === patch.type)?.[1]);
  if (patch.color) parts.push(PRESETS.find(p => p[0] === patch.color)?.[1] ?? "custom colour");
  if (patch.fabric) parts.push(FABRICS[patch.fabric].label);
  if (patch.pattern) parts.push(PATTERNS[patch.pattern].label.toLowerCase());
  aiNote.textContent = `Drafted: ${parts.filter(Boolean).join(", ")}. Adjust anything; it is your pattern now.`;
}

/* ---------- Save / export / share ---------- */
const savedStore = {
  get() { try { return JSON.parse(localStorage.getItem("aurum.designs")) ?? []; } catch { return []; } },
  set(v) { localStorage.setItem("aurum.designs", JSON.stringify(v)); },
};
function designCode() {
  const p = { ...state, construction: [...state.construction] };
  return btoa(JSON.stringify(p)).replace(/=+$/, "");
}
function paintSaved() {
  const list = savedStore.get();
  document.getElementById("saved-list").innerHTML = list.length
    ? list.map((d, i) => `
      <button class="opt-btn" type="button" data-load="${i}">
        <span>${d.name}<br><span class="sub">${new Date(d.at).toLocaleDateString()} · ${money(d.total)}</span></span>
        <span class="delta">Recall</span>
      </button>`).join("")
    : `<p class="prov">Nothing saved yet. A design saved here can be reordered forever.</p>`;
  document.querySelectorAll("[data-load]").forEach(b => b.addEventListener("click", () => {
    const d = savedStore.get()[+b.dataset.load];
    if (!d) return;
    Object.assign(state, d.state, { construction: new Set(d.state.construction) });
    viewer?.set(d.state);
    monoInput.value = state.monogram;
    document.getElementById("color-wheel").value = state.color;
    paintTypes(); paintFabrics(); paintPresets(); paintPatterns(); paintConstruction(); paintPrice(); paintHud();
    toast(`“${d.name}” recalled to the stage`);
  }));
}
paintSaved();

document.getElementById("save-btn").addEventListener("click", () => {
  const list = savedStore.get();
  const name = `${TYPES.find(t => t[0] === state.type)?.[1]} Nº ${String(list.length + 1).padStart(2, "0")}`;
  list.unshift({ name, at: Date.now(), total: pricing().total, state: { ...state, construction: [...state.construction] } });
  savedStore.set(list.slice(0, 12));
  paintSaved();
  toast(`Saved as “${name}”`);
});

document.getElementById("export-btn").addEventListener("click", () => {
  if (!viewer) { toast("Export needs the 3D stage (WebGL)"); return; }
  const a = document.createElement("a");
  a.href = viewer.snapshot();
  a.download = `aurum-${state.type}-one-of-one.png`;
  a.click();
  toast("High-resolution preview exported");
});

document.getElementById("share-btn").addEventListener("click", async () => {
  const code = designCode();
  const text = `My AURUM one-of-one — design code ${code.slice(0, 24)}…`;
  try {
    if (navigator.share) { await navigator.share({ title: "AURUM one-of-one", text }); return; }
    await navigator.clipboard.writeText(code);
    toast("Design code copied. Anyone at the maison can recall it.");
  } catch {
    toast("Design code: " + code.slice(0, 32) + "…");
  }
});

document.getElementById("order-btn").addEventListener("click", () => {
  const p = pricing();
  toast(`Commission received: ${money(p.total)}. The atelier drafts your pattern within 48 hours.`);
});
