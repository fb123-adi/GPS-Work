"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { testimonials } from "@/lib/data";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [active, setActive] = useState(0);

  const prev = () => setActive((a) => (a - 1 + testimonials.length) % testimonials.length);
  const next = () => setActive((a) => (a + 1) % testimonials.length);

  return (
    <section className="py-24 px-6 lg:px-8 bg-aurum-black overflow-hidden" id="reviews">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="font-jost text-xs tracking-[0.4em] uppercase text-aurum-gold mb-4">
            Social Proof
          </p>
          <h2 className="font-bodoni text-4xl md:text-5xl font-bold text-aurum-ivory tracking-tight">
            Worn by Champions
          </h2>
          <div className="luxury-divider mt-6" />
        </motion.div>

        {/* Stars display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-1 mb-10"
        >
          {[1, 2, 3, 4, 5].map((s) => (
            <svg key={s} className="w-5 h-5 text-aurum-gold fill-current" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
          <span className="ml-3 font-jost text-sm text-aurum-gray">
            5.0 · 1,400+ Reviews
          </span>
        </motion.div>

        {/* Testimonial carousel */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-center px-4 md:px-16"
            >
              {/* Quote mark */}
              <div className="font-bodoni text-8xl text-aurum-gold/20 leading-none mb-4 select-none">
                &ldquo;
              </div>

              <p className="font-bodoni text-xl md:text-2xl italic text-aurum-ivory leading-relaxed mb-8">
                {testimonials[active].text}
              </p>

              {/* Author */}
              <div className="flex items-center justify-center gap-4">
                <img
                  src={testimonials[active].avatar}
                  alt={testimonials[active].name}
                  className="w-12 h-12 rounded-full object-cover border border-aurum-gold/20"
                />
                <div className="text-left">
                  <div className="font-jost text-sm font-semibold text-aurum-ivory">
                    {testimonials[active].name}
                  </div>
                  <div className="font-jost text-xs text-aurum-gold tracking-[0.1em]">
                    {testimonials[active].role}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Nav buttons */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={prev}
              className="w-10 h-10 border border-aurum-gold/30 flex items-center justify-center text-aurum-gray hover:text-aurum-gold hover:border-aurum-gold transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`transition-all duration-300 ${
                    i === active
                      ? "w-6 h-1.5 bg-aurum-gold"
                      : "w-1.5 h-1.5 bg-aurum-gold/30 hover:bg-aurum-gold/60"
                  }`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={next}
              className="w-10 h-10 border border-aurum-gold/30 flex items-center justify-center text-aurum-gray hover:text-aurum-gold hover:border-aurum-gold transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
