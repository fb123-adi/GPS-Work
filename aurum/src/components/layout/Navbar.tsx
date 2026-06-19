"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/providers/CartProvider";
import { CartDrawer } from "./CartDrawer";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, open } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[70] transition-all duration-500 ease-luxe",
          scrolled
            ? "bg-ivory/85 backdrop-blur-md border-b border-stone/70"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <nav className="mx-auto flex h-[72px] max-w-editorial items-center justify-between px-5 sm:px-8">
          {/* Left: nav (desktop) / burger (mobile) */}
          <div className="flex flex-1 items-center">
            <button
              className="flex min-h-[44px] min-w-[44px] items-center justify-center lg:hidden"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <BurgerIcon className={scrolled ? "text-ink" : "text-ink"} />
            </button>
            <ul className="hidden items-center gap-8 lg:flex">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group relative font-body text-[0.72rem] uppercase tracking-wide2 text-ink"
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 ease-luxe group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Center: wordmark */}
          <Link
            href="/"
            className="flex-1 text-center font-display text-2xl tracking-luxe text-ink sm:text-[1.7rem]"
            aria-label={`${site.name} home`}
          >
            {site.name}
          </Link>

          {/* Right: utilities */}
          <div className="flex flex-1 items-center justify-end gap-1 sm:gap-3">
            <button
              aria-label="Search"
              className="hidden min-h-[44px] min-w-[44px] items-center justify-center text-ink hover:text-gold-ink sm:flex"
            >
              <SearchIcon />
            </button>
            <button
              aria-label="Account"
              className="hidden min-h-[44px] min-w-[44px] items-center justify-center text-ink hover:text-gold-ink sm:flex"
            >
              <UserIcon />
            </button>
            <button
              onClick={open}
              aria-label={`Open bag, ${count} items`}
              className="relative flex min-h-[44px] min-w-[44px] items-center justify-center text-ink hover:text-gold-ink"
            >
              <BagIcon />
              {count > 0 && (
                <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-medium text-ink">
                  {count}
                </span>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[95] flex flex-col bg-ivory lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex h-[72px] items-center justify-between px-5">
              <span className="font-display text-2xl tracking-luxe">{site.name}</span>
              <button
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center"
              >
                <CloseIcon />
              </button>
            </div>
            <ul className="flex flex-col gap-2 px-6 pt-8">
              {site.nav.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * i + 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block border-b border-stone py-4 font-display text-3xl"
                  >
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="mt-auto px-6 pb-10 text-xs uppercase tracking-wide2 text-taupe">
              Join the AURUM Circle for VIP drops & early access.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer />
    </>
  );
}

function BurgerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}
function BagIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M6 7h12l1 13H5L6 7Z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </svg>
  );
}
