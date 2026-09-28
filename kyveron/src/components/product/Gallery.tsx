"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

type Img = { id: string; url: string; alt: string; colour: string | null };

/**
 * Product gallery. Desktop: two-column stacked images (photography dominant).
 * Mobile: swipeable scroll-snap strip with position dots. Any image opens a
 * zoom viewer (native dialog): pointer position pans the 2.2x image; keyboard
 * arrows move between images; Escape closes.
 */
export function Gallery({ images, colour, name }: { images: Img[]; colour: string; name: string }) {
  const shown = images.filter((i) => !i.colour || i.colour === colour);
  const list = shown.length ? shown : images;
  const [zoomAt, setZoomAt] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  const strip = useRef<HTMLDivElement>(null);

  // Reset the mobile strip when the colour changes (derived during render).
  const [shownColour, setShownColour] = useState(colour);
  if (shownColour !== colour) {
    setShownColour(colour);
    setActive(0);
  }
  useEffect(() => {
    strip.current?.scrollTo({ left: 0 });
  }, [colour]);

  return (
    <div>
      <div className="hidden grid-cols-2 gap-2 md:grid">
        {list.map((img, i) => (
          <button key={img.id} type="button" onClick={() => setZoomAt(i)}
            className={`group relative block cursor-zoom-in overflow-hidden bg-[#e7e2d8] ${i === 0 && list.length % 2 === 1 ? "col-span-2 aspect-[4/5]" : "aspect-[4/5]"}`}
            aria-label={`Zoom image ${i + 1} of ${list.length}: ${img.alt}`}>
            <Image src={img.url} alt={img.alt} fill priority={i < 2} sizes="(min-width: 1024px) 30vw, 50vw" className="object-cover transition-transform duration-700 ease-[var(--ease-smooth)] group-hover:scale-[1.02]" />
            <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center bg-ivory/85 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true">
              <Icon name="zoom" size={18} />
            </span>
          </button>
        ))}
      </div>

      <div className="md:hidden">
        <div ref={strip} className="-mx-[var(--gutter)] flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(el.scrollLeft / el.clientWidth);
            if (i !== active) setActive(i);
          }}
          aria-label={`${name} images`} role="region" tabIndex={0}>
          {list.map((img, i) => (
            <button key={img.id} type="button" onClick={() => setZoomAt(i)} className="relative aspect-[4/5] w-full flex-none snap-center bg-[#e7e2d8]" aria-label={`Zoom: ${img.alt}`}>
              <Image src={img.url} alt={img.alt} fill priority={i === 0} sizes="100vw" className="object-cover" />
            </button>
          ))}
        </div>
        {list.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
            {list.map((_, i) => <span key={i} className={`h-1 transition-[width,background-color] duration-300 ${i === active ? "w-6 bg-obsidian" : "w-2 bg-line-strong"}`} />)}
          </div>
        )}
      </div>

      {zoomAt !== null && <Zoom images={list} start={zoomAt} onClose={() => setZoomAt(null)} />}
    </div>
  );
}

function Zoom({ images, start, onClose }: { images: Img[]; start: number; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [i, setI] = useState(start);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  useEffect(() => {
    const d = ref.current!;
    d.showModal();
    document.documentElement.classList.add("scroll-locked");
    return () => document.documentElement.classList.remove("scroll-locked");
  }, []);

  const img = images[i];
  const go = (d: number) => { setZoomed(false); setI((x) => (x + d + images.length) % images.length); };

  return (
    <dialog ref={ref} className="m-0 h-full max-h-none w-full max-w-none bg-ivory p-0 backdrop:bg-obsidian/60" aria-label="Image zoom"
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onKeyDown={(e) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); }}>
      <div className="relative h-full w-full overflow-hidden"
        onPointerMove={(e) => {
          if (!zoomed || e.pointerType === "touch") return;
          const r = e.currentTarget.getBoundingClientRect();
          setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
        }}>
        <button type="button" className={`relative block h-full w-full ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
          onClick={() => setZoomed((z) => !z)} aria-label={zoomed ? "Zoom out" : "Zoom in"}>
          <Image src={img.url} alt={img.alt} fill sizes="100vw" quality={90}
            className="object-contain transition-transform duration-300 ease-[var(--ease-standard)]"
            style={{ transform: zoomed ? "scale(2.2)" : "none", transformOrigin: origin }} />
        </button>
        <div className="absolute right-4 top-4 flex gap-2">
          <span className="flex h-11 items-center bg-ivory px-3 text-sm tabular-nums">{i + 1} / {images.length}</span>
          <button type="button" autoFocus className="flex h-11 w-11 items-center justify-center bg-obsidian text-ivory" onClick={onClose} aria-label="Close zoom">
            <Icon name="close" />
          </button>
        </div>
        {images.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 rotate-180 items-center justify-center bg-ivory" aria-label="Previous image"><Icon name="chevron" /></button>
            <button type="button" onClick={() => go(1)} className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-ivory" aria-label="Next image"><Icon name="chevron" /></button>
          </>
        )}
      </div>
    </dialog>
  );
}
