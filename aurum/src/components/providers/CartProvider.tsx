"use client";

import { createContext, useContext, useMemo, useState, useCallback } from "react";
import type { Product } from "@/lib/products";

export type CartLine = { product: Product; qty: number };

type CartContextValue = {
  lines: CartLine[];
  isOpen: boolean;
  count: number;
  subtotal: number;
  open: () => void;
  close: () => void;
  add: (product: Product) => void;
  remove: (id: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const add = useCallback((product: Product) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, qty: l.qty + 1 } : l
        );
      }
      return [...prev, { product, qty: 1 }];
    });
    setIsOpen(true);
  }, []);

  const remove = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.product.id !== id));
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((n, l) => n + l.qty * l.product.price, 0);
    return {
      lines,
      isOpen,
      count,
      subtotal,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add,
      remove,
    };
  }, [lines, isOpen, add, remove]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
