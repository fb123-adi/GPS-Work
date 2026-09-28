import type { Metadata } from "next";
import { SIZE_GUIDE } from "@/lib/config/sizes";

export const metadata: Metadata = { title: "Size guide", description: "Body measurements for Kyveron tops and bottoms, and how to measure yourself." };

function Table({ title, g }: { title: string; g: { columns: string[]; rows: string[][] } }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-sm tabular-nums">
          <thead><tr className="border-b border-obsidian">{g.columns.map((c) => <th key={c} scope="col" className="py-2 pr-4 font-semibold">{c}{c === "Size" ? "" : " (cm)"}</th>)}</tr></thead>
          <tbody>{g.rows.map((r) => <tr key={r[0]} className="border-b border-line">{r.map((c, i) => i === 0 ? <th key={i} scope="row" className="py-2.5 pr-4 font-medium">{c}</th> : <td key={i} className="py-2.5 pr-4">{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}

export default function SizeGuide() {
  return (
    <div className="container-x max-w-4xl py-12 lg:py-16">
      <h1 className="display text-[clamp(2rem,4vw,3.2rem)]">Size guide</h1>
      <p className="mt-4 max-w-2xl text-ink-soft">These are body measurements. Each product page also tells you how that piece fits and whether to size up or down. Measurements are placeholders until final grading is confirmed.</p>
      <Table title="Tops, sweats, and outerwear" g={SIZE_GUIDE.tops} />
      <Table title="Bottoms" g={SIZE_GUIDE.bottoms} />
      <section className="prose-kv mt-12">
        <h2>How to measure</h2>
        <ul>
          <li><strong>Chest:</strong> around the fullest part, under the arms, tape level.</li>
          <li><strong>Waist:</strong> around your natural waist, above the navel.</li>
          <li><strong>Hip:</strong> around the fullest part of the seat.</li>
          <li><strong>Inseam:</strong> from the crotch to the ankle bone, along the inside leg.</li>
        </ul>
        <p>Between sizes? For a closer fit take the smaller size; for layering take the larger. Exchanges for another size are free within 14 days.</p>
      </section>
    </div>
  );
}
