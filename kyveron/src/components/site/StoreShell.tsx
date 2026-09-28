import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { cartCount } from "@/lib/cart";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { RevealRoot } from "@/components/motion/RevealRoot";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CookieConsent } from "./CookieConsent";
import { MockBanner } from "./MockBanner";

export async function StoreShell({ children, headerTone = "light" }: { children: ReactNode; headerTone?: "light" | "overlay" }) {
  const [count, store] = await Promise.all([cartCount(), cookies()]);
  return (
    <CartProvider initialCount={count}>
      <a href="#main" className="skip-link">Skip to content</a>
      <Header tone={headerTone} />
      <main id="main" tabIndex={-1} className={headerTone === "light" ? "pt-[var(--header-h)] outline-none" : "outline-none"}>
        <MockBanner />
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <CookieConsent hasChoice={store.has("kv_consent")} />
      <RevealRoot />
    </CartProvider>
  );
}
