"use server";

import { z } from "zod";
import { addToCart, setCartCoupon, setLineQuantity } from "@/lib/cart";
import { buildCartView, type CartView } from "@/lib/cart-view";
import { enforce, LIMITS, RateLimitError } from "@/lib/security/rate-limit";
import { clientIp } from "@/lib/security/request";
import { getCurrentUser } from "@/lib/auth/session";

export type CartResult = { ok: boolean; error?: string; cart: CartView };

const uuid = z.string().uuid();

async function wrap(fn: () => Promise<unknown>): Promise<CartResult> {
  try {
    await fn();
    return { ok: true, cart: await buildCartView() };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Something went wrong. Please try again.";
    return { ok: false, error, cart: await buildCartView() };
  }
}

export async function addItemAction(variantId: string, quantity = 1): Promise<CartResult> {
  if (!uuid.safeParse(variantId).success) return { ok: false, error: "Choose a size.", cart: await buildCartView() };
  return wrap(() => addToCart(variantId, quantity));
}

export async function updateQuantityAction(variantId: string, quantity: number): Promise<CartResult> {
  if (!uuid.safeParse(variantId).success || !Number.isFinite(quantity)) return { ok: false, error: "Invalid request", cart: await buildCartView() };
  return wrap(() => setLineQuantity(variantId, quantity));
}

export async function removeItemAction(variantId: string): Promise<CartResult> {
  return updateQuantityAction(variantId, 0);
}

export async function applyCouponAction(code: string): Promise<CartResult> {
  const clean = z.string().trim().toUpperCase().max(32).regex(/^[A-Z0-9-]+$/).safeParse(code);
  if (!clean.success) return { ok: false, error: "Enter a valid code.", cart: await buildCartView() };
  const user = await getCurrentUser();
  try {
    await enforce(LIMITS.coupon(user ? `u:${user.id}` : `ip:${await clientIp()}`));
  } catch (e) {
    if (e instanceof RateLimitError) return { ok: false, error: e.message, cart: await buildCartView() };
    throw e;
  }
  await setCartCoupon(clean.data);
  const cart = await buildCartView();
  if (cart.couponError) {
    await setCartCoupon(null);
    return { ok: false, error: cart.couponError, cart: await buildCartView() };
  }
  return { ok: true, cart };
}

export async function removeCouponAction(): Promise<CartResult> {
  return wrap(() => setCartCoupon(null));
}

export async function getCartAction(): Promise<CartView> {
  return buildCartView();
}
