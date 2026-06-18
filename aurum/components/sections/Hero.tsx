"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { img } from "@/lib/images";

// Cinematic entrance: each layer blurs+rises into place on a spring.
const reveal = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: (d: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring" as const, duration: 1, bounce: 0, delay: d },
  }),
};

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Dual-layer parallax: media drifts down, content lifts and fades.
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden"
    >
      {/* Ken Burns media layer — slow perpetual zoom for cinematic life */}
      <motion.div style={{ y: reduce ? 0 : mediaY }} className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { scale: 1.15 }}
          animate={reduce ? {} : { scale: 1 }}
          transition={{ duration: 14, ease: "easeOut" }}
        >
          <Image
            src={img.hero}
            alt="AURUM luxury sportswear campaign"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>
      </motion.div>

      {/* Cinematic vignette + gradient grading */}
      <div className="absolute inset-0 z-10 hero-overlay" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(12,10,9,0.55)_100%)]" />

      {/* Edge accent lines */}
      <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-aurum-gold/20 to-transparent z-20" />
      <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-aurum-gold/20 to-transparent z-20" />

      {/* Content */}
      <motion.div
        style={{ y: reduce ? 0 : contentY, opacity: reduce ? 1 : contentOpacity }}
        className="relative z-30 text-center px-6 max-w-5xl mx-auto"
      >
        <motion.div
          variants={reveal}
          initial="hidden"
          animate="show"
          custom={0.1}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-aurum-gold/60" />
          <span className="font-jost text-xs tracking-[0.4em] uppercase text-aurum-gold">
            Est. MMXXIV
          </span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-aurum-gold/60" />
        </motion.div>

        <h1 className="font-bodoni text-6xl md:text-8xl lg:text-9xl font-bold text-aurum-ivory leading-[0.9] tracking-tight mb-6">
          <motion.span
            variants={reveal}
            initial="hidden"
            animate="show"
            custom={0.25}
            className="block"
          >
            CRAFTED FOR
          </motion.span>
          <motion.span
            variants={reveal}
            initial="hidden"
            animate="show"
            custom={0.45}
            className="block text-gold-gradient"
          >
            EXCELLENCE
          </motion.span>
        </h1>

        <motion.p
          variants={reveal}
          initial="hidden"
          animate="show"
          custom={0.7}
          className="font-jost text-base md:text-lg font-light tracking-[0.08em] text-aurum-gray max-w-2xl mx-auto mb-12"
        >
          Luxury sportswear engineered for performance
          <br className="hidden md:block" /> and designed for prestige.
        </motion.p>

        <motion.div
          variants={reveal}
          initial="hidden"
          animate="show"
          custom={0.9}
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

        <motion.div
          variants={reveal}
          initial="hidden"
          animate="show"
          custom={1.15}
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
