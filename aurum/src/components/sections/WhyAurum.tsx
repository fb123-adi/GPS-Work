import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const pillars = [
  {
    title: "Premium Materials",
    copy: "Elite fabrics sourced for their hand-feel and resilience, finished for maximum comfort.",
    icon: ThreadIcon,
  },
  {
    title: "Precision Construction",
    copy: "Engineered seams and considered cuts, designed for durability and built for performance.",
    icon: CompassIcon,
  },
  {
    title: "Timeless Luxury",
    copy: "Fashion-forward silhouettes that are never trend-dependent — made to outlast the season.",
    icon: CrestIcon,
  },
];

export function WhyAurum() {
  return (
    <section className="bg-ivory py-20 sm:py-28">
      <div className="mx-auto max-w-editorial px-5 sm:px-8">
        <SectionHeading eyebrow="Why AURUM" title="Held to a higher standard" />

        <div className="mt-16 grid gap-px overflow-hidden border border-stone bg-stone md:grid-cols-3">
          {pillars.map((pillar, i) => (
            <Reveal
              key={pillar.title}
              delay={i * 0.12}
              className="group flex flex-col gap-6 bg-ivory p-10 transition-colors duration-500 hover:bg-parchment"
            >
              <span className="flex h-14 w-14 items-center justify-center border border-gold/40 text-gold-ink transition-colors duration-500 group-hover:bg-gold group-hover:text-ink">
                <pillar.icon />
              </span>
              <h3 className="font-display text-2xl">{pillar.title}</h3>
              <p className="text-[0.95rem] font-light leading-relaxed text-graphite">
                {pillar.copy}
              </p>
              <span className="mt-2 text-[0.7rem] uppercase tracking-luxe text-taupe">
                0{i + 1}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ThreadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M4 4c6 2 10 6 16 16M12 4a8 8 0 0 0 8 8M4 12a8 8 0 0 1 8 8" />
    </svg>
  );
}
function CompassIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </svg>
  );
}
function CrestIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
