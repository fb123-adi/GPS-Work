"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Card = { slug: string; name: string; priceText: string; image: string | null; alt: string };

/** Recently viewed products. Ids live in localStorage; names and prices come from the server. */
export function RecentlyViewed({ excludeId }: { excludeId: string }) {
  const [items, setItems] = useState<Card[] | null>(null);
  useEffect(() => {
    let ids: string[] = [];
    try {
      ids = JSON.parse(localStorage.getItem("kv_recent") ?? "[]").filter((x: unknown) => typeof x === "string" && x !== excludeId).slice(0, 4);
    } catch {
      ids = [];
    }
    if (!ids.length) return;
    fetch(`/api/products/cards?ids=${ids.join(",")}`).then((r) => (r.ok ? r.json() : [])).then(setItems).catch(() => setItems([]));
  }, [excludeId]);
  if (!items || items.length === 0) return null;
  return (
    <section className="container-x pb-20" aria-labelledby="recent">
      <h2 id="recent" className="mb-6 text-xl font-semibold">Recently viewed</h2>
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
        {items.map((p) => (
          <li key={p.slug}>
            <Link href={`/products/${p.slug}`} className="group block">
              <span className="card-media block">{p.image && <Image src={p.image} alt={p.alt} fill sizes="25vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />}</span>
              <span className="mt-2 flex justify-between gap-2 text-sm"><span>{p.name}</span><span className="tabular-nums">{p.priceText}</span></span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
