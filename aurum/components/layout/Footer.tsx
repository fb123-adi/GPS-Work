"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Play, Video } from "lucide-react";

const footerLinks = {
  Brand: ["About AURUM", "Our Story", "Craftsmanship", "Sustainability", "Careers"],
  Collections: ["Men", "Women", "Children", "Limited Edition", "New Arrivals"],
  Support: ["Size Guide", "Shipping & Returns", "Track Order", "Care Instructions", "FAQ"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Accessibility"],
};

export default function Footer() {
  return (
    <footer className="bg-aurum-black border-t border-aurum-gold/10">
      {/* Top stripe */}
      <div className="h-px bg-gradient-to-r from-transparent via-aurum-gold/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="font-bodoni text-3xl font-bold tracking-[0.25em] text-aurum-ivory">
                AURUM
              </h2>
              <p className="font-jost text-xs tracking-[0.3em] text-aurum-gold uppercase mt-1">
                Luxury Sportswear
              </p>
            </div>
            <p className="font-jost text-sm text-aurum-gray leading-relaxed mb-6 max-w-xs">
              Where performance meets prestige. AURUM crafts luxury sportswear
              for those who refuse to compromise on excellence.
            </p>

            {/* Social */}
            <div className="flex items-center gap-4">
              {[
                { icon: Play, label: "Instagram" },
                { icon: Video, label: "YouTube" },
              ].map(({ icon: Icon, label }) => (
                <motion.a
                  key={label}
                  href="#"
                  whileHover={{ scale: 1.1, color: "#CA8A04" }}
                  className="w-9 h-9 flex items-center justify-center border border-aurum-gold/20 text-aurum-gray hover:text-aurum-gold hover:border-aurum-gold/40 transition-colors duration-300"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
              {/* TikTok */}
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                className="w-9 h-9 flex items-center justify-center border border-aurum-gold/20 text-aurum-gray hover:text-aurum-gold hover:border-aurum-gold/40 transition-colors duration-300"
                aria-label="TikTok"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.67a8.18 8.18 0 004.78 1.52V6.7a4.85 4.85 0 01-1.01-.01z" />
                </svg>
              </motion.a>
              {/* Pinterest */}
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                className="w-9 h-9 flex items-center justify-center border border-aurum-gold/20 text-aurum-gray hover:text-aurum-gold hover:border-aurum-gold/40 transition-colors duration-300"
                aria-label="Pinterest"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                </svg>
              </motion.a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-jost text-xs font-semibold tracking-[0.2em] uppercase text-aurum-ivory mb-5">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="font-jost text-sm text-aurum-gray hover:text-aurum-ivory transition-colors duration-200 animated-underline"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-aurum-gold/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-jost text-xs text-aurum-gray tracking-[0.08em]">
            © {new Date().getFullYear()} AURUM Luxury Sportswear. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <span className="font-jost text-xs text-aurum-gray tracking-[0.08em]">
              Crafted with excellence
            </span>
            <div className="flex items-center gap-2">
              {["VISA", "MC", "AMEX", "PAYPAL"].map((card) => (
                <span
                  key={card}
                  className="px-2 py-1 border border-aurum-gold/20 font-jost text-[9px] tracking-[0.08em] text-aurum-gray"
                >
                  {card}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
