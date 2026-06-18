"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

const editorials = [
  {
    image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=85",
    tag: "Performance",
    title: "Train at the Pinnacle",
    text: "Elite performance fabric engineered with NASA-grade moisture technology.",
  },
  {
    image: "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=600&q=85",
    tag: "Lifestyle",
    title: "Beyond the Gym",
    text: "AURUM transitions seamlessly from the weight room to the boardroom.",
  },
  {
    image: "https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=800&q=85",
    tag: "Ambition",
    title: "Discipline is Luxury",
    text: "Every great achievement starts with the right foundation. Choose AURUM.",
    large: true,
  },
  {
    image: "https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?w=600&q=85",
    tag: "Craftsmanship",
    title: "Details Define Excellence",
    text: "Gold-threaded accents and precision stitching on every piece.",
  },
];

export default function Lifestyle() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 px-6 lg:px-8 bg-aurum-charcoal" id="lifestyle">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4"
        >
          <div>
            <p className="font-jost text-xs tracking-[0.4em] uppercase text-aurum-gold mb-3">
              The AURUM Life
            </p>
            <h2 className="font-bodoni text-4xl md:text-5xl font-bold text-aurum-ivory tracking-tight">
              Fitness. Success.
              <br />
              <em className="text-gold-gradient not-italic">Ambition.</em>
            </h2>
          </div>
          <p className="font-jost text-sm text-aurum-gray leading-relaxed max-w-xs">
            AURUM is more than apparel — it is a statement of intent.
            A declaration that excellence is not optional.
          </p>
        </motion.div>

        {/* Editorial grid */}
        <div className="grid grid-cols-12 gap-4 auto-rows-[280px]">
          {editorials.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.12 }}
              className={`relative overflow-hidden group cursor-pointer ${
                item.large
                  ? "col-span-12 md:col-span-7 row-span-2"
                  : "col-span-12 md:col-span-5"
              }`}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width:768px) 100vw, 50vw"
                className="object-cover object-center transition-transform duration-[1000ms] ease-out group-hover:scale-105"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-aurum-black via-aurum-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-block font-jost text-[10px] tracking-[0.3em] uppercase text-aurum-gold bg-aurum-gold/10 border border-aurum-gold/20 px-3 py-1 mb-3">
                  {item.tag}
                </span>
                <h3 className={`font-bodoni font-semibold text-aurum-ivory mb-2 ${item.large ? "text-3xl" : "text-xl"}`}>
                  {item.title}
                </h3>
                <p className="font-jost text-sm text-aurum-gray opacity-0 group-hover:opacity-100 transition-opacity duration-400 translate-y-2 group-hover:translate-y-0">
                  {item.text}
                </p>
              </div>

              {/* Corner accent */}
              <div className="absolute top-4 right-4 w-5 h-5 border-t border-r border-aurum-gold/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
