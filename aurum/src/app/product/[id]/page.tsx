import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById, getProducts, getRelated } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { ProductViewer } from "@/components/three/ProductViewer";
import { AddToCartPanel } from "@/components/shop/AddToCartPanel";
import { ProductCard } from "@/components/ui/ProductCard";
import { Reveal } from "@/components/ui/Reveal";

export function generateStaticParams() {
  return getProducts().map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const product = getProductById(params.id);
  if (!product) return { title: "Not found" };
  return {
    title: product.name,
    description: product.story,
    openGraph: { title: `${product.name} — AURUM`, description: product.story },
  };
}

const details = [
  {
    q: "Materials",
    a: "Crafted from elite, responsibly-sourced fibres selected for hand-feel, recovery, and longevity. Tonal hardware finished in antique brass.",
  },
  {
    q: "Construction",
    a: "Engineered seams and reinforced stress points. Garment-dyed and pre-shrunk for a consistent fit, wash after wash.",
  },
  {
    q: "Care",
    a: "Machine wash cold on a gentle cycle with like colours. Do not tumble dry. Cool iron if needed. Do not dry clean.",
  },
  {
    q: "Shipping & Returns",
    a: "Complimentary worldwide express shipping and 30-day returns. Every order arrives in signature AURUM packaging.",
  },
];

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = getProductById(params.id);
  if (!product) notFound();

  const related = getRelated(product);

  return (
    <article className="bg-ivory">
      {/* spacer for fixed nav */}
      <div className="h-[72px]" />

      <div className="mx-auto max-w-editorial px-5 py-10 sm:px-8 sm:py-14">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-2 text-[0.66rem] uppercase tracking-wide2 text-taupe">
            <li>
              <Link href="/" className="hover:text-gold-ink">Home</Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href={`/${product.category.toLowerCase()}`} className="hover:text-gold-ink">
                {product.category}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-graphite">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Media — interactive 3D atelier view */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductViewer
              tone={product.tone}
              modelUrl={product.modelUrl}
              className="aspect-[4/5] w-full"
              label={
                product.modelUrl
                  ? "Drag to rotate · live 3D model"
                  : "Drag to rotate · 360° atelier view"
              }
            />
            <div className="mt-3 grid grid-cols-4 gap-3">
              {(["ink", "graphite", "champagne", product.tone] as const).map((t, i) => (
                <div
                  key={i}
                  className={`grain aspect-square duo-${t} border ${
                    i === 3 ? "border-gold" : "border-stone"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Detail */}
          <div className="flex flex-col">
            <p className="text-[0.66rem] uppercase tracking-wide2 text-taupe">
              {product.category} · {product.collection}
            </p>
            <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-4 font-body text-xl text-graphite">{formatPrice(product.price)}</p>

            <p className="mt-7 max-w-md text-pretty text-[0.98rem] font-light leading-relaxed text-graphite">
              {product.story}
            </p>

            <div className="my-8 h-px w-full bg-stone" />

            <AddToCartPanel product={product} />

            {/* Accordion */}
            <div className="mt-10 divide-y divide-stone border-y border-stone">
              {details.map((d) => (
                <details key={d.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm uppercase tracking-wide2 text-ink">
                    {d.q}
                    <span className="text-gold-ink transition-transform duration-300 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-graphite">
                    {d.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      <section className="border-t border-stone bg-parchment py-16 sm:py-24">
        <div className="mx-auto max-w-editorial px-5 sm:px-8">
          <Reveal className="mb-10">
            <span className="eyebrow">You may also like</span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl">Complete the look</h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
