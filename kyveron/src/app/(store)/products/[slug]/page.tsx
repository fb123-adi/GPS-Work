import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, publishedReviews, relatedProducts } from "@/lib/catalog";
import { getPriceFormatter } from "@/lib/currency";
import { getCurrentUser } from "@/lib/auth/session";
import { wishedIds } from "@/lib/wishlist";
import { SIZE_GUIDE } from "@/lib/config/sizes";
import { RETURNS } from "@/lib/config/store";
import { ProductView } from "@/components/product/ProductView";
import { ProductCard } from "@/components/product/ProductCard";
import { ReviewForm } from "@/components/product/ReviewForm";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  if (!p) return { title: "Product not found" };
  return {
    title: p.seoTitle?.replace(/ \| Kyveron$/, "") ?? p.name,
    description: p.seoDescription ?? p.description.slice(0, 155),
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { images: p.images[0] ? [{ url: p.images[0].url, alt: p.images[0].alt }] : undefined },
  };
}

const FIT_LABEL: Record<string, string> = { runs_small: "Runs small", true_to_size: "True to size", runs_large: "Runs large" };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const [fmt, related, reviews, user, wished] = await Promise.all([
    getPriceFormatter(), relatedProducts(p.id), publishedReviews(p.id), getCurrentUser(), wishedIds(),
  ]);
  const guide = /jogger|legging|short|pant/i.test(p.name) ? SIZE_GUIDE.bottoms : SIZE_GUIDE.tops;
  const inStock = p.variants.some((v) => v.available > 0);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.images.map((i) => i.url),
    sku: p.variants[0]?.sku,
    brand: { "@type": "Brand", name: "Kyveron" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: Math.min(...p.variants.map((v) => v.priceMinor)) / 100,
      highPrice: Math.max(...p.variants.map((v) => v.priceMinor)) / 100,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(p.rating.count ? { aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating.average, reviewCount: p.rating.count } } : {}),
  };


  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="container-x pb-16 pt-6 lg:pt-10">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-ink-soft">
          <ol className="flex flex-wrap gap-2">
            <li><Link href="/shop" className="hover:underline">Shop</Link> /</li>
            {p.category && <li>{p.category} /</li>}
            <li aria-current="page" className="text-obsidian">{p.name}</li>
          </ol>
        </nav>
        <ProductView
          product={{ id: p.id, slug: p.slug, name: p.name, subtitle: p.subtitle, fit: p.fit, material: p.material, isPerformance: p.isPerformance }}
          images={p.images}
          variants={p.variants.map((v) => ({
            id: v.id, sku: v.sku, size: v.size, colour: v.colour, colourHex: v.colourHex, available: v.available, lowStock: v.lowStock,
            priceText: fmt.format(v.priceMinor), compareText: v.compareAtMinor ? fmt.format(v.compareAtMinor) : null,
          }))}
          rating={p.rating}
          approximate={fmt.approximate}
          wished={wished.has(p.id)}
          details={<ProductDetails p={p} />}
        />
      </div>

      <section id="size-guide" className="border-t border-line bg-surface" aria-labelledby="sg">
        <div className="container-x grid gap-8 py-14 md:grid-cols-[1fr_2fr]">
          <div>
            <h2 id="sg" className="text-xl font-semibold">Size guide</h2>
            <p className="mt-2 text-sm text-ink-soft">Body measurements in centimetres. If you are between sizes, the fit notes above say which way to go. <Link className="link" href="/size-guide">Full size guide</Link></p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm tabular-nums">
              <caption className="sr-only">Size chart for {p.name}</caption>
              <thead><tr className="border-b border-obsidian">{guide.columns.map((c) => <th key={c} scope="col" className="py-2 pr-4 font-semibold">{c}</th>)}</tr></thead>
              <tbody>{guide.rows.map((r) => <tr key={r[0]} className="border-b border-line">{r.map((c, i) => i === 0 ? <th key={i} scope="row" className="py-2.5 pr-4 font-medium">{c}</th> : <td key={i} className="py-2.5 pr-4">{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="reviews" className="container-x py-16" aria-labelledby="rv">
        <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
          <div>
            <h2 id="rv" className="text-xl font-semibold">Reviews</h2>
            {p.rating.count > 0 ? (
              <p className="mt-2"><span className="display text-4xl">{p.rating.average.toFixed(1)}</span> <span className="text-ink-soft">out of 5, from {p.rating.count} {p.rating.count === 1 ? "review" : "reviews"}</span></p>
            ) : (
              <p className="mt-2 text-ink-soft">No reviews yet. Reviews are checked before they appear; we publish negative reviews too.</p>
            )}
          </div>
          <div>
            {reviews.length > 0 && (
              <ul className="divide-y divide-line border-y border-line">
                {reviews.map((r) => (
                  <li key={r.id} className="py-6">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span aria-label={`${r.rating} out of 5`} className="tracking-[0.12em]">{"★".repeat(r.rating)}<span className="text-line-strong">{"★".repeat(5 - r.rating)}</span></span>
                      <span className="font-medium">{r.author}</span>
                      {r.is_verified_purchase && <span className="badge badge-muted">Verified purchase</span>}
                      {r.fit_feedback && <span className="text-ink-soft">{FIT_LABEL[r.fit_feedback]}</span>}
                    </div>
                    {r.title && <p className="mt-2 font-medium">{r.title}</p>}
                    <p className="mt-1 text-[#2b2a27]">{r.body}</p>
                    <p className="mt-2 text-xs text-ink-soft">{r.created_at.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}{r.helpful ? ` · ${r.helpful} found this helpful` : ""}</p>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-8">
              <h3 className="mb-4 font-semibold">Write a review</h3>
              {user ? <ReviewForm productId={p.id} /> : <p className="text-ink-soft"><Link href={`/login?next=/products/${p.slug}%23reviews`} className="link">Sign in</Link> to write a review.</p>}
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-x pb-16" aria-labelledby="related">
          <h2 id="related" className="mb-6 text-xl font-semibold">Pairs well with</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 lg:gap-x-6" data-reveal-stagger>
            {related.map((r) => <li key={r.id}><ProductCard p={r} fmt={fmt} wished={wished.has(r.id)} /></li>)}
          </ul>
        </section>
      )}
      <RecentlyViewed excludeId={p.id} />
    </>
  );
}

function ProductDetails({ p }: { p: NonNullable<Awaited<ReturnType<typeof getProduct>>> }) {
  return (
    <div className="mt-6 border-t border-line">
      {([
        ["Description", <p key="d" className="whitespace-pre-line">{p.description}</p>],
        ["Fabric and care", <div key="f" className="space-y-2">{p.material && <p><strong className="font-medium">Fabric.</strong> {p.material}</p>}{p.care && <p><strong className="font-medium">Care.</strong> {p.care}</p>}</div>],
        ["Fit", <div key="t" className="space-y-2">{p.fit && <p><strong className="font-medium">{p.fit} fit.</strong></p>}{p.fitNotes && <p>{p.fitNotes}</p>}</div>],
        ["Delivery and returns", <div key="r" className="space-y-2"><p>Standard delivery is free over ₹2,999 (₹99 otherwise), usually 3 to 7 working days. Express is ₹249.</p><p>Return or exchange within {RETURNS.windowDays} days of delivery if unworn with tags attached. Not returnable: {RETURNS.exclusions.join("; ").toLowerCase()}.</p><p><Link className="link" href="/legal/shipping">Shipping policy</Link> · <Link className="link" href="/legal/returns-policy">Returns policy</Link></p></div>],
      ] as [string, React.ReactNode][]).map(([title, body], i) => (
        <details key={title} className="group border-b border-line" open={i === 0}>
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between font-medium [&::-webkit-details-marker]:hidden">
            {title}
            <span aria-hidden="true" className="text-xl transition-transform duration-300 group-open:rotate-45">+</span>
          </summary>
          <div className="pb-5 text-[0.9375rem] leading-relaxed text-[#2b2a27]">{body}</div>
        </details>
      ))}
    </div>
  );
}
