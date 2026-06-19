import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const testimonials = [
  {
    quote:
      "The fit is architectural. I train in AURUM and walk into boardrooms in it — nothing else does both.",
    name: "Marcus Vale",
    role: "Olympic Sprinter · Brand Ambassador",
    tone: "duo-ink",
  },
  {
    quote:
      "Finally, performance wear that feels like couture. The materials are on another level entirely.",
    name: "Elena Rossi",
    role: "Editor-in-Chief, Atelier",
    tone: "duo-oxblood",
  },
  {
    quote:
      "Every detail is considered. This is what luxury sportswear should have always been.",
    name: "Dr. Amara Okonkwo",
    role: "Performance Scientist",
    tone: "duo-graphite",
  },
];

export function SocialProof() {
  return (
    <section className="bg-parchment py-20 sm:py-28">
      <div className="mx-auto max-w-editorial px-5 sm:px-8">
        <SectionHeading
          eyebrow="In Their Words"
          title="Trusted by those who set the standard"
        />

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal
              key={t.name}
              delay={i * 0.12}
              className="flex flex-col justify-between gap-8 border border-stone bg-ivory p-9"
            >
              <div>
                <Stars />
                <blockquote className="mt-6 font-display text-xl italic leading-snug text-ink">
                  “{t.quote}”
                </blockquote>
              </div>
              <div className="flex items-center gap-4">
                <span className={`grain h-12 w-12 rounded-full ${t.tone}`} />
                <div>
                  <p className="font-body text-sm font-medium text-ink">{t.name}</p>
                  <p className="text-[0.7rem] uppercase tracking-wide2 text-taupe">{t.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Trust stats */}
        <Reveal className="mt-16 grid grid-cols-2 gap-px overflow-hidden border border-stone bg-stone sm:grid-cols-4">
          {[
            ["50K+", "Members worldwide"],
            ["4.9★", "Average rating"],
            ["120+", "Countries shipped"],
            ["100%", "Carbon-neutral delivery"],
          ].map(([stat, label]) => (
            <div key={label} className="bg-ivory px-6 py-8 text-center">
              <p className="font-display text-3xl text-ink">{stat}</p>
              <p className="mt-2 text-[0.66rem] uppercase tracking-wide2 text-taupe">{label}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

function Stars() {
  return (
    <div className="flex gap-1 text-gold" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="m12 2 3 6.5 7 .8-5.2 4.8 1.4 6.9L12 17.8 5.4 21l1.4-6.9L1.6 9.3l7-.8L12 2Z" />
        </svg>
      ))}
    </div>
  );
}
