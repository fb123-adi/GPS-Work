"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toggleWishlist } from "@/app/actions/wishlist";
import { useCart } from "@/components/cart/CartProvider";

export function WishlistButton({ productId, productName, initial, variant = "icon" }: {
  productId: string; productName: string; initial: boolean; variant?: "icon" | "full";
}) {
  const [wished, setWished] = useState(initial);
  const [pending, start] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const { announce } = useCart();

  const onClick = () =>
    start(async () => {
      const prev = wished;
      setWished(!prev); // optimistic; reverted on failure
      const r = await toggleWishlist(productId);
      if (r.needsLogin) {
        setWished(prev);
        router.push(`/login?next=${encodeURIComponent(pathname)}&reason=wishlist`);
        return;
      }
      if (!r.ok) {
        setWished(prev);
        announce(r.error ?? "Could not update your wishlist.");
        return;
      }
      setWished(!!r.wished);
      announce(r.wished ? "Saved to your wishlist" : "Removed from your wishlist");
    });

  const heart = (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="transition-transform duration-300 ease-[var(--ease-emphasis)] group-active/w:scale-90">
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"
        fill={wished ? "var(--cobalt)" : "none"} stroke={wished ? "var(--cobalt)" : "currentColor"} strokeWidth="1.5"
        style={{ transition: "fill 200ms var(--ease-standard), stroke 200ms var(--ease-standard)" }} />
    </svg>
  );

  if (variant === "full") {
    return (
      <button type="button" onClick={onClick} disabled={pending} aria-pressed={wished} className="btn btn-secondary group/w">
        {heart}<span>{wished ? "Saved" : "Save to wishlist"}</span>
      </button>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={pending} aria-pressed={wished}
      aria-label={wished ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`}
      className="group/w inline-flex h-11 w-11 items-center justify-center bg-ivory/80 text-obsidian backdrop-blur-[2px] transition-colors hover:bg-ivory">
      {heart}
    </button>
  );
}
