"use client";

import { useRef } from "react";
import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/ui/ProductCard";
import { Reveal } from "@/components/ui/Reveal";

const featured = getProducts();

export function FeaturedProducts() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section className="bg-ink py-20 text-ivory sm:py-28">
      <div className="mx-auto max-w-editorial px-5 sm:px-8">
        <Reveal className="mb-12 flex items-end justify-between gap-6">
          <div>
            <span className="eyebrow-on-dark">Featured</span>
            <h2 className="mt-4 text-3xl leading-tight text-ivory sm:text-4xl">
              This season&apos;s icons
            </h2>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Previous"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center border border-ivory/20 text-ivory transition-colors hover:border-gold hover:text-gold"
            >
              <ArrowIcon dir="left" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Next"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center border border-ivory/20 text-ivory transition-colors hover:border-gold hover:text-gold"
            >
              <ArrowIcon dir="right" />
            </button>
          </div>
        </Reveal>
      </div>

      {/* Snap carousel — wishlist/quick-view live inside each card */}
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {featured.map((p) => (
          <div
            key={p.id}
            className="w-[68vw] shrink-0 snap-start sm:w-[40vw] lg:w-[23vw]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}

function ArrowIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      style={{ transform: dir === "left" ? "rotate(180deg)" : undefined }}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
