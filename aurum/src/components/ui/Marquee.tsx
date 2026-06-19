const ITEMS = [
  "Premium Materials",
  "Precision Construction",
  "Timeless Luxury",
  "Engineered for Performance",
  "Designed for Prestige",
];

/** Continuous brand marquee — pure CSS, pauses for reduced-motion users. */
export function Marquee() {
  const loop = [...ITEMS, ...ITEMS];
  return (
    <div className="border-y border-ivory/10 bg-ink py-5 overflow-hidden">
      <div className="flex w-max animate-marquee whitespace-nowrap">
        {loop.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="px-8 font-display text-sm uppercase tracking-luxe text-ivory/80">
              {item}
            </span>
            <span aria-hidden className="text-gold">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
