"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Polls the server-rendered page while a payment is being confirmed, then stops. */
export function AutoRefresh({ seconds, max }: { seconds: number; max: number }) {
  const router = useRouter();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= max) return;
    const t = setTimeout(() => { router.refresh(); setN((x) => x + 1); }, seconds * 1000);
    return () => clearTimeout(t);
  }, [n, max, seconds, router]);
  return n >= max ? <p className="mt-3 text-sm">Still waiting. You can close this page; we will email you once the payment is confirmed or refunded.</p> : null;
}
