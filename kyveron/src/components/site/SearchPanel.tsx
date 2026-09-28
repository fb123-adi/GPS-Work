"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/ui/Icon";

type Suggest = { products: { slug: string; name: string; image: string | null }[]; collections: { slug: string; title: string }[] };

const POPULAR = ["Supima tee", "Hoodie", "Jogger", "Legging", "Merino"];

export function SearchPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [data, setData] = useState<Suggest | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const shown = q.trim().length >= 2 ? data : null;

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  useEffect(() => {
    if (q.trim().length < 2) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        if (res.ok) setData(await res.json());
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  return (
    <Drawer open={open} onClose={onClose} label="Search" sheet>
      <form
        role="search"
        className="flex items-center gap-3 border-b border-line px-5 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
        }}
      >
        <Icon name="search" className="flex-none text-ink-soft" />
        <label htmlFor="site-search" className="sr-only">Search products</label>
        <input
          id="site-search" ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} type="search" autoComplete="off"
          placeholder="Search tees, joggers, merino" className="h-12 flex-1 bg-transparent text-lg outline-none placeholder:text-[#6b675f]"
          maxLength={80}
        />
        <button type="button" className="inline-flex h-11 w-11 items-center justify-center" aria-label="Close search" onClick={onClose}>
          <Icon name="close" />
        </button>
      </form>
      <div className="flex-1 overflow-y-auto px-5 py-5" aria-live="polite" aria-busy={loading}>
        {!shown && (
          <div>
            <p className="wide-label text-ink-soft">Popular searches</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {POPULAR.map((p) => (
                <li key={p}><Link href={`/search?q=${encodeURIComponent(p)}`} className="chip">{p}</Link></li>
              ))}
            </ul>
          </div>
        )}
        {shown && shown.products.length === 0 && shown.collections.length === 0 && !loading && (
          <p className="text-ink-soft">No matches for “{q}”. Try a fabric or a garment, like “merino” or “short”.</p>
        )}
        {shown && shown.collections.length > 0 && (
          <ul className="mb-5 space-y-1">
            {shown.collections.map((c) => (
              <li key={c.slug}><Link href={`/collections/${c.slug}`} className="link">Collection: {c.title}</Link></li>
            ))}
          </ul>
        )}
        {shown && shown.products.length > 0 && (
          <ul className="divide-y divide-line">
            {shown.products.map((p) => (
              <li key={p.slug}>
                <Link href={`/products/${p.slug}`} className="flex items-center gap-4 py-3 hover:opacity-80">
                  <span className="relative h-16 w-[52px] flex-none overflow-hidden bg-[#e7e2d8]">
                    {p.image && <Image src={p.image} alt="" fill sizes="52px" className="object-cover" />}
                  </span>
                  <span>{p.name}</span>
                </Link>
              </li>
            ))}
            <li className="pt-4"><Link href={`/search?q=${encodeURIComponent(q)}`} className="link">See all results for “{q}”</Link></li>
          </ul>
        )}
      </div>
    </Drawer>
  );
}
