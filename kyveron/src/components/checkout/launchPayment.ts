"use client";

import type { PaymentSession } from "@/lib/payments/service";

type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayFailure = { error: { code?: string; description?: string; metadata?: { payment_id?: string } } };
type RazorpayCtor = new (opts: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: RazorpayFailure) => void) => void };

let loader: Promise<RazorpayCtor> | null = null;

function loadRazorpay(): Promise<RazorpayCtor> {
  const w = window as unknown as { Razorpay?: RazorpayCtor };
  if (w.Razorpay) return Promise.resolve(w.Razorpay);
  loader ??= new Promise((resolve, reject) => {
    // Inserted by our nonced bundle, so allowed by the CSP's 'strict-dynamic'.
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => (w.Razorpay ? resolve(w.Razorpay) : reject(new Error("Razorpay unavailable")));
    s.onerror = () => {
      loader = null;
      reject(new Error("Could not load the payment window. Check your connection and try again."));
    };
    document.head.appendChild(s);
  });
  return loader;
}

export type PaymentOutcome =
  | { kind: "paid"; orderId: string }
  | { kind: "failed"; message: string }
  | { kind: "dismissed" }
  | { kind: "redirect"; url: string }
  | { kind: "unverified"; message: string; orderId?: string };

async function verify(r: RazorpayResponse): Promise<PaymentOutcome> {
  const res = await fetch("/api/payments/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gatewayOrderId: r.razorpay_order_id, paymentId: r.razorpay_payment_id, signature: r.razorpay_signature }),
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; orderId?: string; error?: string };
  if (data.ok && data.orderId) return { kind: "paid", orderId: data.orderId };
  return { kind: "unverified", message: data.error ?? "We could not confirm the payment yet.", orderId: data.orderId };
}

/**
 * Opens the gateway for a server-created payment session. Success is never
 * assumed from the browser: the result is posted back for server-side
 * signature verification.
 */
export async function launchPayment(session: PaymentSession): Promise<PaymentOutcome> {
  if (session.provider === "mock") {
    return { kind: "redirect", url: `/checkout/mock-gateway/${encodeURIComponent(session.gatewayOrderId)}` };
  }
  const Razorpay = await loadRazorpay();
  return new Promise<PaymentOutcome>((resolve) => {
    let settled = false;
    const done = (o: PaymentOutcome) => {
      if (!settled) {
        settled = true;
        resolve(o);
      }
    };
    const rzp = new Razorpay({
      key: session.keyId,
      order_id: session.gatewayOrderId,
      amount: session.amountMinor,
      currency: session.currency,
      name: "Kyveron",
      description: `Order ${session.orderNumber}`,
      prefill: session.prefill,
      notes: { order_number: session.orderNumber },
      theme: { color: "#151515" },
      retry: { enabled: true, max_count: 3 },
      timeout: 900,
      handler: (r: RazorpayResponse) => verify(r).then(done),
      modal: { ondismiss: () => done({ kind: "dismissed" }), confirm_close: true },
    });
    rzp.on("payment.failed", (f: RazorpayFailure) => {
      void fetch("/api/payments/failed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gatewayOrderId: session.gatewayOrderId, paymentId: f.error.metadata?.payment_id,
          code: f.error.code, description: f.error.description,
        }),
      });
      // Razorpay lets the customer retry inside the same window; we only
      // settle on dismiss or success.
    });
    rzp.open();
  });
}
