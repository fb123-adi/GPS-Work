"use client";

import { createContext, useContext, useState, useTransition, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FacetData } from "@/lib/catalog";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/ui/Icon";

const Pending = createContext<{ pending: boolean; navigate: (p: URLSearchParams) => void }>({ pending: false, navigate: () => {} });

export function ShopProvider({ children }: { children: ReactNode }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const navigate = (p: URLSearchParams) => {
    p.delete("page");
    start(() => router.push(`${pathname}${p.size ? `?${p}` : ""}`, { scroll: false }));
  };
  return <Pending.Provider value={{ pending, navigate }}>{children}</Pending.Provider>;
}

/** Results keep their layout while new data loads; a slim bar and dimming show progress. */
export function Results({ children }: { children: ReactNode }) {
  const { pending } = useContext(Pending);
  return (
    <div className="relative" aria-busy={pending}>
      <div className={`absolute -top-3 left-0 h-0.5 bg-cobalt transition-[width,opacity] duration-500 ease-[var(--ease-smooth)] ${pending ? "w-2/3 opacity-100" : "w-full opacity-0"}`} aria-hidden="true" />
      <div className={`transition-opacity duration-200 ${pending ? "opacity-50" : "opacity-100"}`}>{children}</div>
      <p className="sr-only" aria-live="polite">{pending ? "Updating results" : ""}</p>
    </div>
  );
}

function useToggle() {
  const sp = useSearchParams();
  const { navigate } = useContext(Pending);
  const values = (key: string) => (sp.get(key) ?? "").split(",").filter(Boolean);
  const toggle = (key: string, value: string) => {
    const p = new URLSearchParams(sp.toString());
    const cur = values(key);
    const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
    if (next.length) p.set(key, next.join(","));
    else p.delete(key);
    navigate(p);
  };
  const set = (key: string, value: string | null) => {
    const p = new URLSearchParams(sp.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    navigate(p);
  };
  return { sp, values, toggle, set, navigate };
}

export function SortSelect() {
  const { sp, set } = useToggle();
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm text-ink-soft">Sort</label>
      <select id="sort" className="select !min-h-11 !w-auto !py-1.5 text-sm" value={sp.get("sort") ?? "featured"} onChange={(e) => set("sort", e.target.value === "featured" ? null : e.target.value)}>
        <option value="featured">Featured</option>
        <option value="newest">Newest</option>
        <option value="price_asc">Price, low to high</option>
        <option value="price_desc">Price, high to low</option>
      </select>
    </div>
  );
}

function FilterGroups({ facets, hideCollection }: { facets: FacetData; hideCollection?: boolean }) {
  const { sp, values, toggle, set, navigate } = useToggle();
  const [min, setMin] = useState(sp.get("min") ?? "");
  const [max, setMax] = useState(sp.get("max") ?? "");
  const group = "border-b border-line py-5";
  return (
    <div>
      <fieldset className={group}>
        <legend className="mb-3 text-sm font-semibold">For</legend>
        <div className="flex flex-wrap gap-2">
          {[["men", "Men"], ["women", "Women"], ["unisex", "Unisex"]].map(([v, l]) => (
            <button key={v} type="button" className="chip" aria-pressed={values("gender").includes(v)} onClick={() => toggle("gender", v)}>{l}</button>
          ))}
        </div>
      </fieldset>
      <fieldset className={group}>
        <legend className="mb-3 text-sm font-semibold">Category</legend>
        <ul className="space-y-1">
          {facets.categories.map((c) => (
            <li key={c.slug}>
              <label className="flex min-h-10 cursor-pointer items-center gap-3 text-[0.9375rem]">
                <input type="checkbox" className="checkbox !mt-0" checked={values("category").includes(c.slug)} onChange={() => toggle("category", c.slug)} />
                {c.name}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
      <fieldset className={group}>
        <legend className="mb-3 text-sm font-semibold">Size</legend>
        <div className="flex flex-wrap gap-2">
          {facets.sizes.map((s) => (
            <button key={s} type="button" className="chip" aria-pressed={values("size").includes(s)} onClick={() => toggle("size", s)}>{s}</button>
          ))}
        </div>
      </fieldset>
      <fieldset className={group}>
        <legend className="mb-3 text-sm font-semibold">Colour</legend>
        <div className="flex flex-wrap gap-2">
          {facets.colours.map((c) => {
            const on = values("colour").includes(c.name);
            return (
              <button key={c.name} type="button" aria-pressed={on} onClick={() => toggle("colour", c.name)}
                className={`inline-flex min-h-10 items-center gap-2 border px-2.5 text-sm transition-colors ${on ? "border-obsidian bg-obsidian text-ivory" : "border-line-strong hover:border-obsidian"}`}>
                <span className="h-4 w-4 border border-black/15" style={{ background: c.hex ?? "#ccc" }} aria-hidden="true" />{c.name}
              </button>
            );
          })}
        </div>
      </fieldset>
      <fieldset className={group}>
        <legend className="mb-3 text-sm font-semibold">Price (₹)</legend>
        <form className="flex items-end gap-2" onSubmit={(e) => {
          e.preventDefault();
          const p = new URLSearchParams(sp.toString());
          if (min) p.set("min", String(Math.max(0, Number(min)))); else p.delete("min");
          if (max) p.set("max", String(Math.max(0, Number(max)))); else p.delete("max");
          navigate(p);
        }}>
          <div className="field flex-1"><label htmlFor="pmin" className="!font-normal text-ink-soft">Min</label><input id="pmin" inputMode="numeric" className="input !min-h-11" value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} placeholder="0" /></div>
          <div className="field flex-1"><label htmlFor="pmax" className="!font-normal text-ink-soft">Max</label><input id="pmax" inputMode="numeric" className="input !min-h-11" value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))} placeholder={String(Math.ceil(facets.priceMax / 100))} /></div>
          <button className="btn btn-secondary btn-sm !min-h-11">Apply</button>
        </form>
      </fieldset>
      <fieldset className={group}>
        <legend className="sr-only">Availability</legend>
        <label className="flex min-h-10 cursor-pointer items-center gap-3 text-[0.9375rem]">
          <input type="checkbox" className="checkbox !mt-0" checked={sp.get("stock") === "1"} onChange={(e) => set("stock", e.target.checked ? "1" : null)} />
          In stock only
        </label>
      </fieldset>
      {!hideCollection && facets.collections.length > 0 && (
        <fieldset className={group}>
          <legend className="mb-3 text-sm font-semibold">Collection</legend>
          <div className="flex flex-wrap gap-2">
            {facets.collections.map((c) => (
              <button key={c.slug} type="button" className="chip" aria-pressed={sp.get("collection") === c.slug}
                onClick={() => set("collection", sp.get("collection") === c.slug ? null : c.slug)}>{c.title}</button>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}

export function Filters({ facets, activeCount, hideCollection }: { facets: FacetData; activeCount: number; hideCollection?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const clear = activeCount > 0 && (
    <button type="button" className="link text-sm" onClick={() => router.push(pathname)}>Clear all filters</button>
  );
  return (
    <>
      <aside className="hidden lg:block" aria-label="Filters">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <h2 className="text-sm font-semibold">Filters{activeCount ? ` (${activeCount})` : ""}</h2>
          {clear}
        </div>
        <FilterGroups facets={facets} hideCollection={hideCollection} />
      </aside>
      <button type="button" className="btn btn-secondary btn-sm lg:hidden" onClick={() => setOpen(true)}>
        <Icon name="filter" size={16} /> Filters{activeCount ? ` (${activeCount})` : ""}
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} label="Filters" side="left">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button type="button" className="inline-flex h-11 w-11 items-center justify-center -mr-2" aria-label="Close filters" onClick={() => setOpen(false)}><Icon name="close" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5"><FilterGroups facets={facets} hideCollection={hideCollection} /></div>
        <div className="flex gap-3 border-t border-line p-5">
          {clear}
          <button type="button" className="btn btn-primary ml-auto" onClick={() => setOpen(false)}>Show results</button>
        </div>
      </Drawer>
    </>
  );
}
