import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Lifestyle",
  description: "The AURUM Journal — fitness, success, ambition, and discipline. Editorial stories from those who live at the intersection of performance and prestige.",
};

const stories = [
  { tag: "Discipline", title: "The 5am Standard", tone: "duo-ink", read: "6 min" },
  { tag: "Ambition", title: "Built, Not Born", tone: "duo-oxblood", read: "8 min" },
  { tag: "Success", title: "From Track to Boardroom", tone: "duo-graphite", read: "5 min" },
  { tag: "Fitness", title: "The Art of Recovery", tone: "duo-olive", read: "7 min" },
];

export default function LifestylePage() {
  const [feature, ...rest] = stories;
  return (
    <>
      <PageHeader
        eyebrow="The AURUM Journal"
        title="A way of moving through the world"
        intro="Fitness. Success. Ambition. Discipline. Editorial chronicles of the athletes, founders, and creators who live at the intersection of performance and prestige."
        crumbs={[{ label: "Home", href: "/" }, { label: "Lifestyle" }]}
      />

      <section className="bg-ivory py-14 sm:py-20">
        <div className="mx-auto max-w-editorial px-5 sm:px-8">
          {/* Feature */}
          <Reveal className="group relative mb-5 block aspect-[16/9] overflow-hidden">
            <div className={`grain absolute inset-0 ${feature.tone} transition-transform duration-[1.2s] ease-luxe group-hover:scale-105`} />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
            <div className="absolute bottom-0 left-0 max-w-xl p-8 sm:p-12">
              <span className="eyebrow-on-dark">{feature.tag} · {feature.read} read</span>
              <h2 className="mt-4 font-display text-3xl text-ivory sm:text-5xl">{feature.title}</h2>
            </div>
          </Reveal>

          {/* Grid */}
          <div className="grid gap-5 sm:grid-cols-3">
            {rest.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.1} className="group relative block aspect-[3/4] overflow-hidden">
                <div className={`grain absolute inset-0 ${s.tone} transition-transform duration-[1.2s] ease-luxe group-hover:scale-105`} />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <span className="eyebrow-on-dark">{s.tag} · {s.read}</span>
                  <h3 className="mt-3 font-display text-2xl text-ivory">{s.title}</h3>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
