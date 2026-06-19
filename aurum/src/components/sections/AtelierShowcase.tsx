import { Reveal } from "@/components/ui/Reveal";
import { ProductViewer } from "@/components/three/ProductViewer";
import { ButtonLink } from "@/components/ui/Button";

const points = [
  "Inspect every seam in real time",
  "Spin 360° — explore the cut from any angle",
  "Materials rendered as they are crafted",
];

export function AtelierShowcase() {
  return (
    <section className="bg-charcoal py-20 text-ivory sm:py-28">
      <div className="mx-auto grid max-w-editorial items-center gap-12 px-5 sm:px-8 lg:grid-cols-2">
        {/* 3D viewer — real glTF model */}
        <Reveal>
          <ProductViewer
            tone="champagne"
            modelUrl="/models/aurum-sneaker.glb"
            label="Drag to rotate · live 3D model"
            className="aspect-square w-full sm:aspect-[4/3] lg:aspect-square"
          />
        </Reveal>

        {/* Copy */}
        <Reveal delay={0.12} className="lg:pl-6">
          <span className="eyebrow-on-dark">The 3D Atelier</span>
          <h2 className="mt-6 text-balance font-display text-4xl leading-tight sm:text-5xl">
            See it as we make it — in three dimensions
          </h2>
          <p className="mt-6 max-w-lg text-base font-light leading-relaxed text-ivory/75">
            Every AURUM piece can be examined in our interactive 3D atelier. Rotate,
            study the construction, and understand the craft before it ever reaches you.
          </p>
          <ul className="mt-8 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-sm font-light text-ivory/80">
                <span className="text-gold">✦</span>
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <ButtonLink href="/product/aur-009" variant="gold">
              Explore in 3D
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
