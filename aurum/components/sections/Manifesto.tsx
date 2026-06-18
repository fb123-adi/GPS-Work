"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function Manifesto() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="manifesto"
      ref={ref}
      className="relative py-32 px-6 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=85"
          alt="AURUM Manifesto"
          className="w-full h-full object-cover object-center opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-aurum-black via-aurum-black/95 to-aurum-black/80" />
      </div>

      {/* Gold vertical line */}
      <div className="absolute left-1/2 top-0 w-px h-full bg-gradient-to-b from-transparent via-aurum-gold/20 to-transparent z-10" />

      <div className="relative z-20 max-w-4xl mx-auto text-center">
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="flex items-center justify-center gap-4 mb-10"
        >
          <div className="h-px flex-1 max-w-16 bg-gradient-to-r from-transparent to-aurum-gold/50" />
          <span className="font-jost text-xs tracking-[0.4em] uppercase text-aurum-gold">
            Our Philosophy
          </span>
          <div className="h-px flex-1 max-w-16 bg-gradient-to-l from-transparent to-aurum-gold/50" />
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.15 }}
          className="font-bodoni text-4xl md:text-6xl lg:text-7xl font-bold text-aurum-ivory leading-tight tracking-tight mb-10"
        >
          THE PURSUIT OF
          <br />
          <em className="text-gold-gradient not-italic">EXCELLENCE</em>
        </motion.h2>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="luxury-divider mb-10"
        />

        {/* Body text */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="font-jost text-base md:text-lg font-light text-aurum-gray leading-loose tracking-wide max-w-3xl mx-auto mb-12"
        >
          AURUM exists to redefine modern sportswear through{" "}
          <span className="text-aurum-ivory font-normal">superior craftsmanship</span>,
          exceptional materials, and{" "}
          <span className="text-aurum-ivory font-normal">timeless design</span>.
          <br />
          <br />
          We believe that true performance and true luxury are not opposites — they
          are the same pursuit, expressed through different mediums. Every AURUM
          piece is a testament to this conviction.
        </motion.p>

        {/* Quote */}
        <motion.blockquote
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
          className="border-l-2 border-aurum-gold pl-6 text-left max-w-lg mx-auto"
        >
          <p className="font-bodoni text-xl md:text-2xl italic text-aurum-ivory leading-relaxed">
            &ldquo;Excellence is never an accident. It is the result of high
            intention, sincere effort, and intelligent execution.&rdquo;
          </p>
          <cite className="block mt-4 font-jost text-xs tracking-[0.2em] uppercase text-aurum-gold not-italic">
            — The AURUM Standard
          </cite>
        </motion.blockquote>
      </div>
    </section>
  );
}
