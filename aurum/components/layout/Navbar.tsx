"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, Heart, Menu, X, ChevronDown } from "lucide-react";
import Link from "next/link";

const navLinks = [
  {
    label: "Collections",
    href: "#collections",
    children: ["Men", "Women", "Children", "Limited Edition"],
  },
  { label: "Men", href: "#men" },
  { label: "Women", href: "#women" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "nav-blur bg-aurum-black/80 border-b border-aurum-gold/10 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex flex-col items-start">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex flex-col"
              >
                <span className="font-bodoni text-2xl font-bold tracking-[0.25em] text-aurum-ivory leading-none">
                  AURUM
                </span>
                <span className="text-[9px] font-jost font-light tracking-[0.35em] text-aurum-gold uppercase mt-0.5">
                  Luxury Sportswear
                </span>
              </motion.div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() =>
                    link.children && setActiveDropdown(link.label)
                  }
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-1 font-jost text-sm font-light tracking-[0.12em] text-aurum-gray hover:text-aurum-ivory uppercase transition-colors duration-300 animated-underline"
                  >
                    {link.label}
                    {link.children && (
                      <ChevronDown className="w-3 h-3 mt-0.5" />
                    )}
                  </Link>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {link.children && activeDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-3 w-48 bg-aurum-dark border border-aurum-gold/20 py-2"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child}
                            href={`#${child.toLowerCase().replace(" ", "-")}`}
                            className="block px-5 py-2.5 font-jost text-xs tracking-[0.12em] uppercase text-aurum-gray hover:text-aurum-ivory hover:bg-aurum-gold/5 transition-colors duration-200"
                          >
                            {child}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:flex w-9 h-9 items-center justify-center text-aurum-gray hover:text-aurum-ivory transition-colors"
              >
                <Search className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:flex w-9 h-9 items-center justify-center text-aurum-gray hover:text-aurum-ivory transition-colors"
              >
                <Heart className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-9 h-9 flex items-center justify-center text-aurum-gray hover:text-aurum-ivory transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-aurum-gold text-aurum-black text-[9px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileOpen(true)}
                className="lg:hidden w-9 h-9 flex items-center justify-center text-aurum-gray hover:text-aurum-ivory transition-colors"
              >
                <Menu className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-aurum-black/60"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute right-0 top-0 h-full w-80 bg-aurum-dark border-l border-aurum-gold/20 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-aurum-gold/10">
                <span className="font-bodoni text-xl tracking-[0.2em] text-aurum-ivory">
                  AURUM
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-9 h-9 flex items-center justify-center text-aurum-gray hover:text-aurum-ivory"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-6 space-y-1">
                {["Men", "Women", "Children", "Collections", "Limited Edition", "About", "Contact"].map(
                  (item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={`#${item.toLowerCase().replace(" ", "-")}`}
                        onClick={() => setMobileOpen(false)}
                        className="block py-3.5 font-jost text-sm tracking-[0.15em] uppercase text-aurum-gray hover:text-aurum-ivory border-b border-aurum-gold/5 transition-colors"
                      >
                        {item}
                      </Link>
                    </motion.div>
                  )
                )}
              </nav>

              <div className="p-6 border-t border-aurum-gold/10">
                <div className="flex items-center gap-4 mb-4">
                  <Search className="w-4 h-4 text-aurum-gray" />
                  <Heart className="w-4 h-4 text-aurum-gray" />
                  <ShoppingBag className="w-4 h-4 text-aurum-gray" />
                </div>
                <p className="font-jost text-xs text-aurum-gray tracking-[0.1em]">
                  Free shipping on orders over £200
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
