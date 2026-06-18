"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { brandPillars } from "@/lib/data";

const icons: Record<string, React.ReactNode> = {
  diamond: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
      <path d="M2.25 13.5L12 21.75L21.75 13.5M2.25 13.5L12 2.25L21.75 13.5M2.25 13.5L12 13.5M21.75 13.5L12 13.5M12 2.25L7.5 13.5M12 2.25L16.5 13.5" />
    </svg>
  ),
  precision: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
      <circle cx="12" cy="12" r="9.75" />
      <circle cx="12" cy="12" r="4.5" />
      <line x1="12" y1="2.25" x2="12" y2="7.5" />
      <line x1="12" y1="16.5" x2="12" y2="21.75" />
      <line x1="2.25" y1="12" x2="7.5" y2="12" />
      <line x1="16.5" y1="12" x2="21.75" y2="12" />
    </svg>
  ),
  crown: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
      <path d="M2.25 18.75L5.25 8.25L9.75 13.5L12 5.25L14.25 13.5L18.75 8.25L21.75 18.75H2.25Z" />
    </svg>
  ),
};

export default function BrandPillars() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 px-6 lg:px-8 bg-aurum-dark" id="about">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="font-jost text-xs tracking-[0.4em] uppercase text-aurum-gold mb-4">
            Why AURUM
          </p>
          <h2 className="font-bodoni text-4xl md:text-5xl font-bold text-aurum-ivory tracking-tight">
            The AURUM Standard
          </h2>
          <div className="luxury-divider mt-6" />
        </motion.div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {brandPillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              className="group text-center"
            >
              {/* Icon */}
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-8">
                <div className="absolute inset-0 border border-aurum-gold/20 rotate-45 group-hover:rotate-[135deg] transition-transform duration-700" />
                <div className="text-aurum-gold group-hover:scale-110 transition-transform duration-500">
                  {icons[pillar.icon]}
                </div>
              </div>

              {/* Subtitle */}
              <p className="font-jost text-[10px] tracking-[0.35em] uppercase text-aurum-gold mb-3">
                {pillar.subtitle}
              </p>

              {/* Title */}
              <h3 className="font-bodoni text-2xl md:text-3xl font-semibold text-aurum-ivory mb-5">
                {pillar.title}
              </h3>

              {/* Divider */}
              <div className="w-10 h-px bg-aurum-gold/40 mx-auto mb-5 group-hover:w-20 transition-all duration-500" />

              {/* Description */}
              <p className="font-jost text-sm text-aurum-gray leading-relaxed tracking-wide">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
