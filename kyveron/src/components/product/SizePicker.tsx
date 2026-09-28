"use client";

export type VariantLite = { id: string; size: string; colour: string; colourHex: string | null; available: number; lowStock: boolean };

/** Colour swatches and a size radio group. Unavailable sizes stay focusable and say why. */
export function SizePicker({
  variants, colour, onColour, value, onChange, idPrefix = "sp",
}: {
  variants: VariantLite[]; colour: string; onColour: (c: string) => void; value: string | null; onChange: (id: string) => void; idPrefix?: string;
}) {
  const colours = [...new Map(variants.map((v) => [v.colour, v.colourHex])).entries()];
  const sizes = variants.filter((v) => v.colour === colour);
  const selected = variants.find((v) => v.id === value);
  return (
    <div className="grid gap-5">
      {colours.length > 1 && (
        <fieldset>
          <legend className="text-sm"><span className="font-medium">Colour</span> <span className="text-ink-soft">· {colour}</span></legend>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Colour">
            {colours.map(([name, hex]) => {
              const any = variants.some((v) => v.colour === name && v.available > 0);
              return (
                <button key={name} type="button" role="radio" aria-checked={name === colour} onClick={() => onColour(name)}
                  aria-label={`${name}${any ? "" : ", sold out"}`}
                  className={`relative h-11 w-11 border transition-[border-color,box-shadow] duration-150 ${name === colour ? "border-obsidian shadow-[inset_0_0_0_3px_var(--ivory)]" : "border-line-strong hover:border-obsidian"}`}
                  style={{ background: hex ?? "#ccc" }}>
                  {!any && <span aria-hidden="true" className="absolute inset-0 m-auto h-px w-[140%] -translate-x-[15%] rotate-45 bg-obsidian/60" />}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
      <fieldset>
        <legend className="text-sm font-medium">Size</legend>
        <div className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-2" role="radiogroup" aria-label="Size">
          {sizes.map((v) => {
            const out = v.available === 0;
            return (
              <button key={v.id} id={`${idPrefix}-${v.id}`} type="button" role="radio" aria-checked={v.id === value}
                data-unavailable={out} onClick={() => onChange(v.id)} className="chip"
                aria-label={`${v.size}${out ? ", sold out" : v.lowStock ? `, only ${v.available} left` : ""}`}>
                {v.size}
              </button>
            );
          })}
        </div>
        <p className="mt-2 min-h-5 text-sm" aria-live="polite">
          {selected && selected.available === 0 && <span className="text-danger">Sold out in {selected.size}. We can email you when it is back.</span>}
          {selected && selected.lowStock && <span className="text-ink-soft">Only {selected.available} left in {selected.size}.</span>}
          {selected && !selected.lowStock && selected.available > 0 && <span className="text-success">In stock, ready to dispatch.</span>}
        </p>
      </fieldset>
    </div>
  );
}
