"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { CartView } from "@/lib/cart-view";
import { addItemAction, applyCouponAction, getCartAction, removeCouponAction, updateQuantityAction } from "@/app/actions/cart";

type Ctx = {
  cart: CartView | null;
  open: boolean;
  pending: boolean;
  setOpen: (o: boolean) => void;
  refresh: () => Promise<void>;
  add: (variantId: string, qty?: number, opts?: { openDrawer?: boolean }) => Promise<{ ok: boolean; error?: string }>;
  update: (variantId: string, qty: number) => Promise<void>;
  applyCoupon: (code: string) => Promise<{ ok: boolean; error?: string }>;
  removeCoupon: () => Promise<void>;
  announce: (msg: string) => void;
  toast: string | null;
  lastError: string | null;
};

const CartContext = createContext<Ctx | null>(null);

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}

export function CartProvider({ children }: { initialCount?: number; children: ReactNode }) {
  const [cart, setCart] = useState<CartView | null>(null);
  const [open, setOpenState] = useState(false);
  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const announce = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const refresh = useCallback(async () => {
    setCart(await getCartAction());
  }, []);

  // The server may change the bag outside this provider (checkout, sign-in);
  // re-sync on navigation once the bag has been loaded.
  const pathname = usePathname();
  const loaded = cart !== null;
  useEffect(() => {
    if (!loaded) return;
    let alive = true;
    getCartAction().then((c) => alive && setCart(c));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const setOpen = useCallback(
    (o: boolean) => {
      setOpenState(o);
      if (o) void refresh();
    },
    [refresh],
  );

  const add: Ctx["add"] = useCallback(
    async (variantId, qty = 1, opts = {}) => {
      setPending(true);
      try {
        const r = await addItemAction(variantId, qty);
        setCart(r.cart);
        setLastError(r.ok ? null : r.error ?? null);
        if (r.ok) {
          announce("Added to your bag");
          if (opts.openDrawer !== false) setOpenState(true);
        }
        return { ok: r.ok, error: r.error };
      } finally {
        setPending(false);
      }
    },
    [announce],
  );

  const update = useCallback(async (variantId: string, qty: number) => {
    setPending(true);
    try {
      const r = await updateQuantityAction(variantId, qty);
      setCart(r.cart);
      setLastError(r.ok ? null : r.error ?? null);
    } finally {
      setPending(false);
    }
  }, []);

  const applyCoupon = useCallback(async (code: string) => {
    const r = await applyCouponAction(code);
    setCart(r.cart);
    return { ok: r.ok, error: r.error };
  }, []);

  const removeCoupon = useCallback(async () => {
    const r = await removeCouponAction();
    setCart(r.cart);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      cart, open, pending, setOpen, refresh, add, update, applyCoupon,
      removeCoupon, announce, toast, lastError,
    }),
    [cart, open, pending, setOpen, refresh, add, update, applyCoupon, removeCoupon, announce, toast, lastError],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <div className="toast" role="status" aria-live="polite" data-show={toast ? "true" : "false"}>
        {toast}
      </div>
    </CartContext.Provider>
  );
}

export function useCartCount(initial: number) {
  const { cart } = useCart();
  return cart ? cart.count : initial;
}
