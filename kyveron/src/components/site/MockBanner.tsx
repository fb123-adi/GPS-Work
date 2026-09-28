import { drivers } from "@/lib/env";

/** Visible warning whenever any integration runs in mock mode (never in production). */
export function MockBanner() {
  const d = drivers();
  const mocks = [
    d.payments === "mock" && "payments",
    d.auth === "local" && "sign-in",
    d.email === "log" && "email",
    d.storage === "local" && "image storage",
  ].filter(Boolean);
  if (!mocks.length) return null;
  return (
    <div role="note" className="fixed bottom-3 left-16 z-[var(--z-dropdown)] max-w-[calc(100vw-24px)] bg-cobalt px-3 py-1.5 text-xs text-white sm:max-w-xs">
      Development mode: {mocks.join(", ")} {mocks.length === 1 ? "is" : "are"} simulated. No real payments are taken.
    </div>
  );
}
