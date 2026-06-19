"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";

const benefits = ["Early access", "VIP drops", "Exclusive discounts", "Limited editions"];

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="relative overflow-hidden bg-ink py-24 text-ivory sm:py-32">
      <div className="grain absolute inset-0 opacity-[0.06]" />
      <div className="absolute inset-0 bg-[radial-gradient(70%_120%_at_50%_0%,rgba(169,131,67,0.16),transparent)]" />

      <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        <Reveal>
          <span className="eyebrow-on-dark">Membership</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-6 text-balance font-display text-4xl leading-tight sm:text-5xl md:text-6xl">
            Join the <span className="italic text-gold">AURUM Circle</span>
          </h2>
        </Reveal>
        <Reveal delay={0.18}>
          <p className="mx-auto mt-6 max-w-md text-base font-light leading-relaxed text-ivory/75">
            Become a member for first access to limited editions and the privileges
            reserved for our inner circle.
          </p>
        </Reveal>

        <Reveal delay={0.26}>
          {submitted ? (
            <p
              role="status"
              className="mx-auto mt-10 max-w-md border border-gold/40 bg-gold/10 px-6 py-5 font-display text-lg text-gold"
            >
              Welcome to the Circle. Check your inbox to confirm.
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email) setSubmitted(true);
              }}
              className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="min-h-[52px] flex-1 border border-ivory/25 bg-transparent px-5 text-sm text-ivory placeholder:text-ivory/40 focus:border-gold focus:outline-none"
              />
              <button
                type="submit"
                className="min-h-[52px] bg-gold px-7 text-[0.72rem] uppercase tracking-wide2 text-ink transition-colors hover:bg-ivory"
              >
                Join Now
              </button>
            </form>
          )}
        </Reveal>

        <Reveal delay={0.34}>
          <ul className="mt-10 flex flex-wrap justify-center gap-x-7 gap-y-3">
            {benefits.map((b) => (
              <li
                key={b}
                className="flex items-center gap-2 text-[0.68rem] uppercase tracking-wide2 text-ivory/60"
              >
                <span className="text-gold">✦</span>
                {b}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
