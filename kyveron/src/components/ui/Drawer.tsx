"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  label: string;
  side?: "right" | "left";
  /** Bottom sheet on small screens. */
  sheet?: boolean;
  children: ReactNode;
};

/**
 * Accessible drawer on the native <dialog> element: focus is trapped and
 * restored by the browser, Escape closes, the backdrop closes, the browser
 * Back button closes, and page scroll is locked while open. The animation
 * never blocks interaction: content is usable from the first frame.
 */
export function Drawer({ open, onClose, label, side = "right", sheet = false, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      document.documentElement.classList.add("scroll-locked");
      requestAnimationFrame(() => d.setAttribute("data-state", "open"));
      history.pushState({ kvDrawer: true }, "");
      pushed.current = true;
    } else if (!open && d.open) {
      d.setAttribute("data-state", "closed");
      document.documentElement.classList.remove("scroll-locked");
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const done = () => d.open && d.close();
      if (reduce) done();
      else setTimeout(done, 330);
      if (pushed.current) {
        pushed.current = false;
        if (history.state?.kvDrawer) history.back();
      }
    }
  }, [open]);

  useEffect(() => {
    const onPop = () => {
      if (pushed.current) {
        pushed.current = false;
        onClose();
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [onClose]);

  useEffect(() => () => document.documentElement.classList.remove("scroll-locked"), []);

  return (
    <dialog
      ref={ref}
      className="drawer"
      aria-label={label}
      data-state="closed"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <div className={`drawer-panel ${side === "left" ? "left" : ""} ${sheet ? "sheet" : ""}`}>{children}</div>
    </dialog>
  );
}
