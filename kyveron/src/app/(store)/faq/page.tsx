import type { Metadata } from "next";
import Link from "next/link";
import { sql } from "@/lib/db";

export const metadata: Metadata = { title: "Questions and answers", description: "Orders, payments, delivery, returns, and sizing at Kyveron." };

export default async function FaqPage() {
  const faqs = await sql<{ id: string; topic: string; question: string; answer: string }[]>`
    select id, topic, question, answer from faqs where status = 'published' order by topic, sort_order`;
  const topics = [...new Set(faqs.map((f) => f.topic))];
  return (
    <div className="container-x grid gap-12 py-12 lg:grid-cols-[1fr_2fr] lg:py-16">
      <div>
        <h1 className="display text-[clamp(2rem,4vw,3.2rem)]">Questions</h1>
        <p className="mt-4 text-ink-soft">Cannot find an answer? <Link href="/contact" className="link">Contact us</Link>. We reply within one working day.</p>
      </div>
      <div className="grid gap-10">
        {topics.map((t) => (
          <section key={t} aria-labelledby={`t-${t}`}>
            <h2 id={`t-${t}`} className="mb-2 text-lg font-semibold">{t}</h2>
            <div className="border-t border-line" data-reveal-stagger>
              {faqs.filter((f) => f.topic === t).map((f) => (
                <details key={f.id} className="group border-b border-line">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-medium [&::-webkit-details-marker]:hidden">
                    {f.question}<span aria-hidden="true" className="text-xl transition-transform duration-300 group-open:rotate-45">+</span>
                  </summary>
                  <p className="pb-5 text-[#2b2a27]">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
