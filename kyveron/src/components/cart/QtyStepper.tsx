"use client";

export function QtyStepper({
  value, max, onChange, disabled, label,
}: { value: number; max: number; onChange: (v: number) => void; disabled?: boolean; label: string }) {
  return (
    <div className="inline-flex items-center border border-line-strong" role="group" aria-label={label}>
      <button type="button" className="h-9 w-9 text-lg leading-none disabled:opacity-40" aria-label="Decrease quantity"
        disabled={disabled || value <= 1} onClick={() => onChange(value - 1)}>−</button>
      <output className="w-8 text-center text-sm tabular-nums" aria-live="polite">{value}</output>
      <button type="button" className="h-9 w-9 text-lg leading-none disabled:opacity-40" aria-label="Increase quantity"
        disabled={disabled || value >= max} onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}
