"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <section
      ref={ref}
      className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden"
    >
      {/* Background image with parallax */}
      <motion.div
        style={{ y, scale }}
        className="absolute inset-0 z-0"
      >
        <Image
          src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1800&q=90"
          alt="AURUM Hero"
          fill
          sizes="100vw"
          priority
          className="object-cover object-center"
        />
      </motion.div>

      {/* Overlay */}
      <div className="absolute inset-0 z-10 hero-overlay" />

      {/* Gold accent lines */}
      <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-aurum-gold/20 to-transparent z-20" />
      <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-aurum-gold/20 to-transparent z-20" />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-30 text-center px-6 max-w-5xl mx-auto"
      >
        {/* Pre-title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-aurum-gold/60" />
          <span className="font-jost text-xs tracking-[0.4em] uppercase text-aurum-gold">
            Est. MMXXIV
          </span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-aurum-gold/60" />
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-bodoni text-6xl md:text-8xl lg:text-9xl font-bold text-aurum-ivory leading-[0.9] tracking-tight mb-6"
        >
          CRAFTED FOR
          <br />
          <em className="text-gold-gradient not-italic">EXCELLENCE</em>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.7 }}
          className="font-jost text-base md:text-lg font-light tracking-[0.08em] text-aurum-gray max-w-2xl mx-auto mb-12"
        >
          Luxury sportswear engineered for performance
          <br className="hidden md:block" /> and designed for prestige.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.a
            href="#featured"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-gold px-10 py-4 text-sm tracking-[0.2em]"
          >
            Shop Collection
          </motion.a>
          <motion.a
            href="#manifesto"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-outline px-10 py-4 text-sm tracking-[0.2em]"
          >
            Discover AURUM
          </motion.a>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="mt-16 flex items-center justify-center gap-8 md:gap-12"
        >
          {[
            { value: "12K+", label: "Members" },
            { value: "98%", label: "Satisfaction" },
            { value: "47", label: "Countries" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="font-bodoni text-2xl text-aurum-gold">{value}</div>
              <div className="font-jost text-[10px] tracking-[0.2em] text-aurum-gray uppercase mt-0.5">
                {label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2"
      >
        <span className="font-jost text-[9px] tracking-[0.3em] uppercase text-aurum-gray">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 text-aurum-gold" />
        </motion.div>
      </motion.div>
    </section>
  );
}
