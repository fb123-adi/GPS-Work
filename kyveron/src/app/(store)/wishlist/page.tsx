import type { Metadata } from "next";
import Link from "next/link";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { getProduct, productsByIds } from "@/lib/catalog";
import { getPriceFormatter } from "@/lib/currency";
import { WishlistItem } from "@/components/product/WishlistItem";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="container-x max-w-lg py-20">
        <h1 className="display text-3xl">Your wishlist</h1>
        <p className="mt-4 text-ink-soft">Sign in to save pieces and see them on any device.</p>
        <Link href="/login?next=/wishlist" className="btn btn-primary mt-8"><span className="btn-label">Sign in</span></Link>
      </div>
    );
  }
  const ids = (await sql<{ product_id: string }[]>`select wi.product_id from wishlist_items wi join wishlists w on w.id = wi.wishlist_id
    where w.user_id = ${user.id} order by wi.added_at desc`).map((r) => r.product_id);
  const [cards, fmt] = await Promise.all([productsByIds(ids), getPriceFormatter()]);
  const details = await Promise.all(cards.map((c) => getProduct(c.slug)));
  return (
    <div className="container-x py-10 lg:py-14">
      <h1 className="display mb-8 text-[clamp(1.8rem,3vw,2.6rem)]">Wishlist</h1>
      {cards.length === 0 ? <p className="text-ink-soft">Nothing saved yet. Tap the heart on any product to keep it here. <Link href="/shop" className="link">Browse the shop</Link></p> : (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {cards.map((c, i) => (
            <li key={c.id}><WishlistItem card={{ id: c.id, slug: c.slug, name: c.name, image: c.image, priceText: fmt.format(c.priceMinor), inStock: c.inStock }}
              variants={(details[i]?.variants ?? []).map((v) => ({ id: v.id, size: v.size, colour: v.colour, colourHex: v.colourHex, available: v.available, lowStock: v.lowStock }))} /></li>
          ))}
        </ul>
      )}
    </div>
  );
}
