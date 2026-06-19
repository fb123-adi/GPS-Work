"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { ProductTone } from "@/lib/products";
import { cn } from "@/lib/utils";

// WebGL must stay client-only — Three has no business in SSR.
const Atelier3D = dynamic(() => import("./Atelier3D"), {
  ssr: false,
  loading: () => <ViewerSkeleton />,
});

function ViewerSkeleton() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="flex flex-col items-center gap-4">
        <span className="h-16 w-16 animate-spin rounded-full border border-gold/20 border-t-gold" />
        <span className="text-[0.62rem] uppercase tracking-luxe text-ivory/50">
          Rendering atelier
        </span>
      </div>
    </div>
  );
}

export function ProductViewer({
  tone = "champagne",
  className,
  label = "Drag to rotate · 360°",
}: {
  tone?: ProductTone;
  className?: string;
  label?: string;
}) {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const handler = () => setReduce(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className={cn("relative overflow-hidden bg-ink", className)}>
      <div className="grain absolute inset-0 duo-ink opacity-70" />
      <Atelier3D tone={tone} autoRotate={!reduce} className="relative z-10 !absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center">
        <span className="flex items-center gap-2 bg-ink/50 px-4 py-2 text-[0.6rem] uppercase tracking-wide2 text-ivory/70 backdrop-blur">
          <RotateIcon /> {label}
        </span>
      </div>
    </div>
  );
}

function RotateIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" />
    </svg>
  );
}
