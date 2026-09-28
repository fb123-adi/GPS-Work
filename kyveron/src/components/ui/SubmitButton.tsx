"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

/** Submit button that locks while the form is pending (prevents duplicate submissions) without changing width. */
export function SubmitButton({ children, className = "btn btn-primary", disabled }: { children: ReactNode; className?: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending || disabled} data-loading={pending} aria-busy={pending}>
      <span className="btn-label">{children}</span>
    </button>
  );
}
