/* AURUM admin — catalogue register.
   Add / edit / price / remove products via the localStorage admin layer
   in data.js. Every change reflects across the boutique immediately. */
import { CATALOG, admin, SILHOUETTES, GROUPS, CAPSULES, COLORWAYS, money } from "./data.js";
import { plate } from "./garments.js";
import { mountChrome, toast } from "./ui.js";

mountChrome({ current: "" });
const el = id => document.getElementById(id);

let filterCat = "all";
let query = "";
let editingId = null; // null = adding

/* ---------- Populate editor selects ---------- */
el("f-silhouette").innerHTML = SILHOUETTES.map(s => `<option value="${s}">${s}</option>`).join("");
el("f-group").innerHTML = GROUPS.map(g => `<option value="${g}">${g}</option>`).join("");
el("f-capsule").innerHTML = CAPSULES.map(c => `<option value="${c}">${c}</option>`).join("");
el("f-colorways").innerHTML = COLORWAYS.map(w =>
  `<label class="cw-check"><input type="checkbox" value="${w.id}"><i style="background:${w.hex}"></i>${w.name}</label>`).join("");

/* ---------- Category chips ---------- */
const CATS = [["all", "All"], ["men", "Men"], ["women", "Women"], ["unisex", "Unisex"], ["kids", "Kids"]];
el("cat-chips").innerHTML = CATS.map(([k, label]) =>
  `<button class="chip" type="button" data-cat="${k}" aria-pressed="${k === filterCat}">${label}</button>`).join("");
el("cat-chips").querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
  filterCat = b.dataset.cat;
  el("cat-chips").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.cat === filterCat)));
  render();
}));
el("search").addEventListener("input", e => { query = e.target.value.toLowerCase().trim(); render(); });

/* ---------- Render ---------- */
function currentList() {
  let list = filterCat === "all"
    ? [...CATALOG.men, ...CATALOG.women, ...CATALOG.unisex, ...CATALOG.kids]
    : [...CATALOG[filterCat]];
  if (query) list = list.filter(p =>
    p.name.toLowerCase().includes(query) || p.fabric.toLowerCase().includes(query) ||
    p.capsule.toLowerCase().includes(query) || p.group.toLowerCase().includes(query) || p.id.includes(query));
  return list;
}

function statusBadge(p) {
  if (admin.isCustom(p.id)) return `<span class="badge badge-new">New</span>`;
  if (admin.isEdited(p.id)) return `<span class="badge badge-edit">Edited</span>`;
  return `<span class="badge badge-stock">Stock</span>`;
}

function render() {
  const s = admin.state();
  el("admin-stats").innerHTML = [
    ["Live pieces", CATALOG.men.length + CATALOG.women.length + CATALOG.unisex.length + CATALOG.kids.length],
    ["Created", s.custom.length],
    ["Edited", Object.keys(s.overrides).length],
    ["Removed", s.hidden.length],
  ].map(([k, v]) => `<div class="admin-stat"><span class="val">${v}</span><span class="lbl">${k}</span></div>`).join("");

  const list = currentList();
  el("admin-rows").innerHTML = list.length ? list.map(p => `
    <tr data-id="${p.id}">
      <th scope="row" class="cell-piece">
        <span class="admin-thumb" aria-hidden="true">${plate(p, { alt: "" })}</span>
        <span><strong>${p.name}</strong><br><span class="prov">${p.id} · ${p.silhouette}</span></span>
      </th>
      <td>${p.catLabel}</td>
      <td>${p.capsule}</td>
      <td style="text-align:right">
        <input class="price-input" type="number" min="0" step="1" value="${p.price}" data-price="${p.id}" aria-label="Price for ${p.name} in USD">
      </td>
      <td class="prov">${money(p.price)}</td>
      <td>${statusBadge(p)}</td>
      <td class="cell-actions">
        <button class="btn btn-line btn-xs" type="button" data-edit="${p.id}">Edit</button>
        ${admin.isCustom(p.id)
          ? `<button class="btn btn-line btn-xs danger" type="button" data-remove="${p.id}">Delete</button>`
          : admin.isEdited(p.id) || admin.isHidden(p.id)
            ? `<button class="btn btn-line btn-xs" type="button" data-reset="${p.id}">Reset</button>`
            : `<button class="btn btn-line btn-xs danger" type="button" data-remove="${p.id}">Remove</button>`}
      </td>
    </tr>`).join("")
    : `<tr><td colspan="7" class="empty-note" style="text-align:center">No pieces match this view.</td></tr>`;

  // Inline price commit
  el("admin-rows").querySelectorAll("[data-price]").forEach(inp => {
    inp.addEventListener("change", () => {
      const v = Math.max(0, Math.round(Number(inp.value) || 0));
      admin.patch(inp.dataset.price, { price: v });
      toast("Price updated");
      render();
    });
  });
  el("admin-rows").querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => openEditor(b.dataset.edit)));
  el("admin-rows").querySelectorAll("[data-remove]").forEach(b => b.addEventListener("click", () => {
    admin.remove(b.dataset.remove); toast("Piece removed from the boutique"); render();
  }));
  el("admin-rows").querySelectorAll("[data-reset]").forEach(b => b.addEventListener("click", () => {
    admin.reset(b.dataset.reset); toast("Restored to house default"); render();
  }));
}

/* ---------- Editor ---------- */
const dlg = el("editor");
function findProduct(id) {
  return [...CATALOG.men, ...CATALOG.women, ...CATALOG.unisex, ...CATALOG.kids].find(p => p.id === id);
}
function openEditor(id) {
  editingId = id ?? null;
  const p = id ? findProduct(id) : null;
  el("editor-title").textContent = p ? `Edit — ${p.name}` : "Add a piece";
  el("editor-save").textContent = p ? "Save changes" : "Create piece";
  el("f-name").value = p?.name ?? "";
  el("f-cat").value = p?.cat ?? "men";
  el("f-cat").disabled = !!p && !admin.isCustom(p.id); // don't move stock pieces between floors
  el("f-price").value = p?.price ?? 480;
  el("f-silhouette").value = p?.silhouette ?? "tee";
  el("f-group").value = p?.group ?? "Tops";
  el("f-capsule").value = p?.capsule ?? "Elite Collection";
  el("f-fabric").value = p?.fabric ?? "Merino wool";
  el("f-origin").value = p?.origin ?? "Biella, Italy";
  const selected = new Set((p?.colorways ?? [COLORWAYS[0], COLORWAYS[2], COLORWAYS[5]]).map(w => w.id));
  el("f-colorways").querySelectorAll("input").forEach(c => { c.checked = selected.has(c.value); });
  el("f-bestseller").checked = !!p?.bestseller;
  el("f-limited").checked = !!p?.limited;
  dlg.showModal();
}
dlg.querySelectorAll("[data-cancel]").forEach(b => b.addEventListener("click", () => dlg.close()));

el("editor-form").addEventListener("submit", e => {
  e.preventDefault();
  const colorways = [...el("f-colorways").querySelectorAll("input:checked")].map(c => c.value);
  const fields = {
    name: el("f-name").value.trim(),
    price: Math.max(0, Math.round(Number(el("f-price").value) || 0)),
    silhouette: el("f-silhouette").value,
    group: el("f-group").value,
    capsule: el("f-capsule").value,
    fabric: el("f-fabric").value.trim() || "Merino wool",
    origin: el("f-origin").value.trim() || "Biella, Italy",
    colorways: colorways.length ? colorways : ["noir"],
    bestseller: el("f-bestseller").checked,
    limited: el("f-limited").checked,
  };
  if (editingId) {
    admin.patch(editingId, fields);
    toast("Piece updated");
  } else {
    admin.add({ ...fields, cat: el("f-cat").value, item: fields.name });
    toast("Piece added to the boutique");
  }
  dlg.close();
  render();
});

el("add-btn").addEventListener("click", () => openEditor(null));

/* ---------- Export / import / reset ---------- */
el("export-btn").addEventListener("click", () => {
  const blob = new Blob([admin.exportJSON()], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "aurum-catalogue.json";
  a.click();
  URL.revokeObjectURL(a.href);
  toast("Catalogue exported");
});
el("import-btn").addEventListener("click", () => el("import-file").click());
el("import-file").addEventListener("change", async e => {
  const file = e.target.files[0];
  if (!file) return;
  try { admin.importJSON(await file.text()); toast("Catalogue imported"); render(); }
  catch { toast("That file could not be read"); }
  e.target.value = "";
});
el("reset-all-btn").addEventListener("click", () => {
  if (confirm("Reset the entire catalogue to the house default? This removes every admin change in this browser.")) {
    admin.resetAll(); toast("Catalogue reset to default"); render();
  }
});

render();
