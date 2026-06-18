"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";

export default function Newsletter() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  const perks = [
    "Early access to new drops",
    "VIP limited edition releases",
    "Exclusive member discounts",
    "Behind-the-scenes content",
  ];

  return (
    <section className="relative py-24 px-6 lg:px-8 overflow-hidden bg-aurum-dark" id="newsletter">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/newsletter.svg"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="object-cover object-center opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-aurum-dark via-aurum-dark/95 to-aurum-dark" />
      </div>

      {/* Gold line top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-aurum-gold/40 to-transparent z-10" />

      <div className="relative z-20 max-w-4xl mx-auto text-center">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Icon */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-aurum-gold/50" />
            <div className="w-10 h-10 border border-aurum-gold/30 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#CA8A04" strokeWidth="1.5" className="w-5 h-5">
                <path d="M12 2l2 7h7l-5.5 4 2 7L12 16.5 6.5 20l2-7L3 9h7z" />
              </svg>
            </div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-aurum-gold/50" />
          </div>

          <p className="font-jost text-xs tracking-[0.4em] uppercase text-aurum-gold mb-4">
            Exclusive Access
          </p>

          <h2 className="font-bodoni text-4xl md:text-5xl font-bold text-aurum-ivory tracking-tight mb-5">
            JOIN THE
            <br />
            <em className="text-gold-gradient not-italic">AURUM CIRCLE</em>
          </h2>

          <div className="luxury-divider mb-8" />

          <p className="font-jost text-sm text-aurum-gray leading-loose mb-10 max-w-xl mx-auto">
            Become part of an exclusive community of individuals who demand
            the finest. The AURUM Circle grants you privileged access to our
            most coveted pieces before they sell out.
          </p>

          {/* Perks */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {perks.map((perk, i) => (
              <motion.div
                key={perk}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-2 text-left"
              >
                <div className="w-4 h-4 flex items-center justify-center border border-aurum-gold/40 flex-shrink-0">
                  <Check className="w-2.5 h-2.5 text-aurum-gold" />
                </div>
                <span className="font-jost text-xs text-aurum-gray leading-snug">{perk}</span>
              </motion.div>
            ))}
          </div>

          {/* Form */}
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 border border-aurum-gold flex items-center justify-center">
                <Check className="w-6 h-6 text-aurum-gold" />
              </div>
              <p className="font-bodoni text-xl italic text-aurum-ivory">
                Welcome to the Circle.
              </p>
              <p className="font-jost text-sm text-aurum-gray">
                Expect your first dispatch shortly.
              </p>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row items-stretch gap-0 max-w-lg mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 bg-transparent border border-aurum-gold/30 focus:border-aurum-gold px-5 py-4 font-jost text-sm text-aurum-ivory placeholder-aurum-gray/50 outline-none transition-colors duration-300"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-gold px-8 py-4 text-xs tracking-[0.2em] flex items-center gap-2 justify-center whitespace-nowrap"
              >
                Join Now
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </form>
          )}

          <p className="font-jost text-[11px] text-aurum-gray/50 mt-4 tracking-[0.08em]">
            No spam. Unsubscribe anytime. We respect your privacy.
          </p>
        </motion.div>
      </div>

      {/* Gold line bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-aurum-gold/40 to-transparent z-10" />
    </section>
  );
}
