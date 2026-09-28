import type { Metadata } from "next";
import { buildCartView } from "@/lib/cart-view";
import { CartPageClient } from "@/components/cart/CartPageClient";

export const metadata: Metadata = { title: "Your bag", robots: { index: false } };

export default async function CartPage() {
  const initial = await buildCartView();
  return <div className="container-x py-10 lg:py-14"><CartPageClient initial={initial} /></div>;
}
