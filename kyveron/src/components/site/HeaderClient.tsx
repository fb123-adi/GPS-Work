"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Wordmark } from "./Wordmark";
import { Icon } from "@/components/ui/Icon";
import { Drawer } from "@/components/ui/Drawer";
import { useCart, useCartCount } from "@/components/cart/CartProvider";
import { SearchPanel } from "./SearchPanel";
import { RegionForm } from "./RegionForm";

type Props = {
  nav: { href: string; label: string }[];
  signedIn: boolean;
  isStaff: boolean;
  initialCount: number;
  currency: string;
  country: string;
  tone: "light" | "overlay";
};

export function HeaderClient({ nav, signedIn, isStaff, initialCount, currency, country, tone }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [solid, setSolid] = useState(tone === "light");
  const solidRef = useRef(solid);
  const { setOpen } = useCart();
  const count = useCartCount(initialCount);
  const pathname = usePathname();

  // Close overlays on navigation (derived during render, no effect needed).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
    setSearchOpen(false);
  }

  useEffect(() => {
    if (tone === "light") return;
    let raf = 0;
    const check = () => {
      raf = 0;
      const next = window.scrollY > window.innerHeight * 0.6;
      if (next !== solidRef.current) {
        solidRef.current = next;
        setSolid(next);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [tone]);

  const overlay = !solid;
  const iconBtn = "inline-flex h-11 w-11 items-center justify-center transition-opacity duration-150 hover:opacity-70";

  return (
    <>
      <header
        className={`load-1 fixed inset-x-0 top-0 z-[var(--z-header)] transition-[background-color,color,border-color] duration-300 ease-[var(--ease-standard)] ${
          overlay ? "on-dark border-b border-transparent bg-transparent text-ivory" : "border-b border-line bg-ivory/95 text-obsidian backdrop-blur-sm"
        }`}
      >
        <div className="container-x flex h-[var(--header-h)] items-center gap-2">
          <button type="button" className={`${iconBtn} -ml-3 lg:hidden`} aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <Icon name="menu" />
          </button>
          <Link href="/" className="mr-6 py-2" aria-label="Kyveron home">
            <Wordmark tone={overlay ? "light" : "dark"} />
          </Link>
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-7 text-[0.875rem]">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="relative py-2 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="ml-auto flex items-center">
            <button type="button" className={iconBtn} aria-label="Search" onClick={() => setSearchOpen(true)}>
              <Icon name="search" />
            </button>
            <Link href="/wishlist" className={`${iconBtn} hidden sm:inline-flex`} aria-label="Wishlist">
              <Icon name="heart" />
            </Link>
            <Link href={signedIn ? "/account" : "/login"} className={iconBtn} aria-label={signedIn ? "Your account" : "Sign in"}>
              <Icon name="user" />
            </Link>
            <button type="button" className={`${iconBtn} relative -mr-3`} onClick={() => setOpen(true)} aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`}>
              <Icon name="bag" />
              {count > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center bg-cobalt px-1 text-[10px] font-semibold text-white tabular-nums">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} label="Menu" side="left">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <Wordmark />
          <button type="button" className={iconBtn} aria-label="Close menu" onClick={() => setMenuOpen(false)}><Icon name="close" /></button>
        </div>
        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-4">
          <ul className="divide-y divide-line">
            {nav.map((n) => (
              <li key={n.href}><Link href={n.href} className="flex items-center justify-between py-4 text-lg">{n.label}<Icon name="chevron" size={16} /></Link></li>
            ))}
            <li><Link href="/wishlist" className="flex py-4 text-lg">Wishlist</Link></li>
            <li><Link href="/track-order" className="flex py-4 text-lg">Track an order</Link></li>
            {isStaff && <li><Link href="/admin" className="flex py-4 text-lg">Admin</Link></li>}
          </ul>
        </nav>
        <div className="border-t border-line px-5 py-5">
          <RegionForm currency={currency} country={country} />
        </div>
      </Drawer>

      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
