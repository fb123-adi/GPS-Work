import Image from "next/image";
import Link from "next/link";
import type { ProductCard as Card } from "@/lib/catalog";
import type { PriceFormatter } from "@/lib/currency";
import { QuickViewButton } from "./QuickViewButton";
import { WishlistButton } from "./WishlistButton";

export function ProductCard({
  p, fmt, priority = false, wished = false,
}: { p: Card; fmt: PriceFormatter; priority?: boolean; wished?: boolean }) {
  const onSale = p.compareAtMinor !== null && p.compareAtMinor > p.priceMinor;
  const from = p.maxPriceMinor > p.priceMinor;
  return (
    <article className="product-card group relative has-[h3_a:focus-visible]:outline-2 has-[h3_a:focus-visible]:outline-offset-4 has-[h3_a:focus-visible]:outline-cobalt has-[h3_a:focus-visible]:outline">
      <div className="card-media">
        <Link href={`/products/${p.slug}`} className="absolute inset-0" tabIndex={-1} aria-hidden="true">
          {p.image && (
            <Image src={p.image.url} alt="" fill priority={priority} sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw" className="img-main object-cover" />
          )}
          {p.hoverImage && (
            <Image src={p.hoverImage.url} alt="" fill sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw" className="img-alt object-cover" />
          )}
        </Link>
        <div className="pointer-events-none absolute left-3 right-14 top-3 flex flex-wrap gap-1.5">
          {!p.inStock && <span className="badge badge-muted bg-ivory">Sold out</span>}
          {p.inStock && onSale && <span className="badge">Reduced</span>}
          {p.inStock && !onSale && p.isNew && <span className="badge">New</span>}
          {p.isPerformance && <span className="badge badge-cobalt">Performance</span>}
        </div>
        <div className="absolute right-2 top-2 z-10">
          <WishlistButton productId={p.id} productName={p.name} initial={wished} />
        </div>
        <div className="quick absolute inset-x-3 bottom-3 z-10">
          <QuickViewButton slug={p.slug} name={p.name} disabled={!p.inStock} />
        </div>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[0.9375rem] font-medium leading-snug">
            <Link href={`/products/${p.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
              {p.name}
            </Link>
          </h3>
          {p.subtitle && <p className="spec-line mt-0.5 truncate">{p.subtitle}</p>}
        </div>
        <p className="price-swap whitespace-nowrap text-right text-[0.9375rem] tabular-nums">
          {from && <span className="text-ink-soft">From </span>}
          <span>{fmt.format(p.priceMinor)}</span>
          {onSale && (
            <>
              <br />
              <s className="text-sm text-ink-soft" aria-label={`Was ${fmt.format(p.compareAtMinor!)}`}>{fmt.format(p.compareAtMinor!)}</s>
            </>
          )}
        </p>
      </div>
      {p.colours.length > 1 && (
        <ul className="mt-2 flex items-center gap-1.5" aria-label={`${p.colours.length} colours: ${p.colours.map((c) => c.name).join(", ")}`}>
          {p.colours.slice(0, 5).map((c) => (
            <li key={c.name} className="h-3 w-3 border border-black/15" style={{ background: c.hex ?? "#ccc" }} title={c.name} />
          ))}
          {p.colours.length > 5 && <li className="text-xs text-ink-soft">+{p.colours.length - 5}</li>}
        </ul>
      )}
    </article>
  );
}
