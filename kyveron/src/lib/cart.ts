import "server-only";
import { cookies } from "next/headers";
import { sql, type Db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { secureCookie } from "@/lib/security/request";
import { MAX_QTY_PER_LINE } from "@/lib/config/store";

/**
 * The cart lives in Postgres. Guests hold an unguessable cart id in an
 * httpOnly cookie; signed-in customers own a cart row. The browser never
 * holds prices or quantities as truth.
 */
export const CART_COOKIE = "kv_cart";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type CartLine = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  size: string;
  colour: string;
  sku: string;
  imageUrl: string | null;
  imageAlt: string | null;
  quantity: number;
  unitPriceMinor: number;
  compareAtMinor: number | null;
  available: number;
  purchasable: boolean;
};

/** Resolves the current cart id without creating one (safe in Server Components). */
export async function findCartId(): Promise<string | null> {
  const user = await getCurrentUser();
  if (user) {
    const [c] = await sql<{ id: string }[]>`select id from carts where user_id = ${user.id} and converted_at is null`;
    return c?.id ?? null;
  }
  const id = (await cookies()).get(CART_COOKIE)?.value;
  if (!id || !UUID.test(id)) return null;
  const [c] = await sql<{ id: string }[]>`select id from carts where id = ${id} and user_id is null and converted_at is null`;
  return c?.id ?? null;
}

/** Resolves or creates the cart. Only call from Server Actions / Route Handlers. */
export async function ensureCartId(): Promise<string> {
  const existing = await findCartId();
  if (existing) return existing;
  const user = await getCurrentUser();
  const [c] = await sql<{ id: string }[]>`
    insert into carts (user_id) values (${user?.id ?? null})
    on conflict (user_id) where user_id is not null and converted_at is null do update set updated_at = now()
    returning id`;
  if (!user) (await cookies()).set(CART_COOKIE, c.id, { ...secureCookie(), maxAge: 60 * 86400 });
  return c.id;
}

export async function loadLines(cartId: string, db: Db = sql): Promise<CartLine[]> {
  const rows = await db<{
    variant_id: string; product_id: string; slug: string; name: string; size: string; colour: string; sku: string;
    image_url: string | null; image_alt: string | null; quantity: number; price_minor: string; compare_at_minor: string | null;
    available: number; purchasable: boolean;
  }[]>`
    select ci.variant_id, p.id as product_id, p.slug, p.name, v.size, v.colour, v.sku, ci.quantity,
      v.price_minor, v.compare_at_minor,
      greatest(v.stock_on_hand - v.reserved, 0) as available,
      (p.status = 'published' and p.deleted_at is null and v.deleted_at is null and v.is_available
        and (p.publish_at is null or p.publish_at <= now())) as purchasable,
      img.url as image_url, img.alt as image_alt
    from cart_items ci
    join product_variants v on v.id = ci.variant_id
    join products p on p.id = v.product_id
    left join lateral (
      select url, alt from product_images i where i.product_id = p.id
      order by (i.colour = v.colour) desc nulls last, i.sort_order limit 1
    ) img on true
    where ci.cart_id = ${cartId}
    order by ci.added_at`;
  return rows.map((r) => ({
    variantId: r.variant_id, productId: r.product_id, slug: r.slug, name: r.name, size: r.size, colour: r.colour,
    sku: r.sku, imageUrl: r.image_url, imageAlt: r.image_alt, quantity: r.quantity,
    unitPriceMinor: Number(r.price_minor), compareAtMinor: r.compare_at_minor ? Number(r.compare_at_minor) : null,
    available: r.available, purchasable: r.purchasable,
  }));
}

export async function addToCart(variantId: string, quantity: number) {
  if (!UUID.test(variantId)) throw new Error("Unknown item");
  const qty = Math.max(1, Math.min(MAX_QTY_PER_LINE, Math.trunc(quantity)));
  const [v] = await sql<{ available: number }[]>`
    select greatest(v.stock_on_hand - v.reserved, 0) as available
    from product_variants v join products p on p.id = v.product_id
    where v.id = ${variantId} and v.deleted_at is null and v.is_available
      and p.status = 'published' and p.deleted_at is null`;
  if (!v) throw new Error("This item is not available.");
  const cartId = await ensureCartId();
  const [existing] = await sql<{ quantity: number }[]>`
    select quantity from cart_items where cart_id = ${cartId} and variant_id = ${variantId}`;
  const next = Math.min(MAX_QTY_PER_LINE, (existing?.quantity ?? 0) + qty);
  if (next > v.available) {
    throw new Error(v.available === 0 ? "This size is out of stock." : `Only ${v.available} left in this size.`);
  }
  await sql`insert into cart_items (cart_id, variant_id, quantity) values (${cartId}, ${variantId}, ${next})
    on conflict (cart_id, variant_id) do update set quantity = ${next}`;
  await sql`update carts set updated_at = now() where id = ${cartId}`;
  return cartId;
}

export async function setLineQuantity(variantId: string, quantity: number) {
  const cartId = await findCartId();
  if (!cartId || !UUID.test(variantId)) return;
  const qty = Math.trunc(quantity);
  if (qty <= 0) {
    await sql`delete from cart_items where cart_id = ${cartId} and variant_id = ${variantId}`;
    return;
  }
  const [v] = await sql<{ available: number }[]>`
    select greatest(stock_on_hand - reserved, 0) as available from product_variants where id = ${variantId}`;
  const capped = Math.min(qty, MAX_QTY_PER_LINE, v?.available ?? 0);
  if (capped <= 0) throw new Error("This size is out of stock.");
  await sql`update cart_items set quantity = ${capped} where cart_id = ${cartId} and variant_id = ${variantId}`;
  if (capped < qty) throw new Error(`Only ${capped} available. We updated the quantity.`);
}

export async function setCartCoupon(code: string | null) {
  const cartId = await ensureCartId();
  await sql`update carts set coupon_code = ${code} where id = ${cartId}`;
}

/** On sign-in, fold the guest cart into the customer's cart. */
export async function mergeGuestCart(userId: string) {
  const store = await cookies();
  const guestId = store.get(CART_COOKIE)?.value;
  if (!guestId || !UUID.test(guestId)) return;
  await sql.begin(async (tx) => {
    const [guest] = await tx`select id, coupon_code from carts where id = ${guestId} and user_id is null and converted_at is null for update`;
    if (!guest) return;
    const [own] = await tx<{ id: string }[]>`
      insert into carts (user_id, coupon_code) values (${userId}, ${guest.coupon_code})
      on conflict (user_id) where user_id is not null and converted_at is null do update set updated_at = now()
      returning id`;
    await tx`
      insert into cart_items (cart_id, variant_id, quantity, added_at)
      select ${own.id}, variant_id, quantity, added_at from cart_items where cart_id = ${guest.id}
      on conflict (cart_id, variant_id) do update
        set quantity = least(${MAX_QTY_PER_LINE}, cart_items.quantity + excluded.quantity)`;
    await tx`delete from carts where id = ${guest.id}`;
  });
  store.delete(CART_COOKIE);
}

export async function cartCount(): Promise<number> {
  const id = await findCartId();
  if (!id) return 0;
  const [r] = await sql<{ n: number }[]>`select coalesce(sum(quantity), 0)::int as n from cart_items where cart_id = ${id}`;
  return r.n;
}
