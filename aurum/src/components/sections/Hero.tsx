"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ButtonLink } from "@/components/ui/Button";

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-ink text-ivory">
      {/* Cinematic backdrop. Drop a campaign film/poster in place of this layer:
          <video autoPlay muted loop playsInline poster="...">.
          The duotone + ken-burns reads as luxury editorial until then. */}
      <div className={`grain absolute inset-0 duo-ink ${reduce ? "" : "animate-kenburns"}`} />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/10 to-ink" />
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_30%,transparent,rgba(12,10,9,0.55))]" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="eyebrow-on-dark"
        >
          Luxury Sportswear · Est. MMXXV
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 text-balance font-display text-[2.7rem] font-medium leading-[1.02] sm:text-6xl md:text-7xl lg:text-[5.5rem]"
        >
          Crafted for
          <span className="block italic text-gold">Excellence</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 max-w-xl text-pretty text-base font-light leading-relaxed text-ivory/80 sm:text-lg"
        >
          Luxury sportswear engineered for performance and designed for prestige.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <ButtonLink href="/collections" variant="gold">
            Shop Collection
          </ButtonLink>
          <ButtonLink
            href="/about"
            variant="outline"
            className="border-ivory/40 text-ivory hover:bg-ivory hover:text-ink"
          >
            Discover AURUM
          </ButtonLink>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="text-[0.6rem] uppercase tracking-luxe text-ivory/50">Scroll</span>
        <motion.span
          animate={reduce ? {} : { y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="block h-8 w-px bg-gradient-to-b from-gold to-transparent"
        />
      </motion.div>
    </section>
  );
}
