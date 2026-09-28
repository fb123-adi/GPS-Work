import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { drivers, env } from "@/lib/env";

/**
 * Payment gateway adapter. Razorpay in production; a local mock that follows
 * the same order → checkout → signed callback → server verification path for
 * development. The mock refuses to load when APP_ENV=production (env.ts).
 */
export type GatewayOrder = { id: string; amount: number; currency: string };

function safeEqualHex(a: string, b: string) {
  const x = Buffer.from(a, "utf8");
  const y = Buffer.from(b, "utf8");
  return x.length === y.length && timingSafeEqual(x, y);
}

function mockSecret() {
  return env().MOCK_PAYMENT_SECRET ?? createHmac("sha256", env().SESSION_SECRET).update("mock-payments").digest("hex");
}

function razorpayAuth() {
  const e = env();
  return "Basic " + Buffer.from(`${e.RAZORPAY_KEY_ID}:${e.RAZORPAY_KEY_SECRET}`).toString("base64");
}

async function razorpay<T>(path: string, init: { method: "GET" | "POST"; body?: unknown; idempotencyKey?: string }): Promise<T> {
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    method: init.method,
    headers: {
      Authorization: razorpayAuth(),
      "Content-Type": "application/json",
      ...(init.idempotencyKey ? { "X-Razorpay-Idempotency-Key": init.idempotencyKey } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    signal: AbortSignal.timeout(10000),
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: { description?: string; code?: string } };
  if (!res.ok) {
    // Gateway messages can be shown to staff but never include credentials.
    throw new Error(`Razorpay ${res.status}: ${data.error?.description ?? "request failed"}`);
  }
  return data;
}

export const gateway = {
  get provider(): "razorpay" | "mock" {
    return drivers().payments;
  },

  /** Public key id for Checkout.js. Safe to send to the browser. */
  publicKey(): string | null {
    return this.provider === "razorpay" ? env().RAZORPAY_KEY_ID! : null;
  },

  async createOrder(amountMinor: number, currency: string, receipt: string, notes: Record<string, string>): Promise<GatewayOrder> {
    if (this.provider === "mock") {
      return { id: `mock_order_${randomBytes(9).toString("hex")}`, amount: amountMinor, currency };
    }
    const o = await razorpay<{ id: string; amount: number; currency: string }>("/orders", {
      method: "POST",
      body: { amount: amountMinor, currency, receipt: receipt.slice(0, 40), notes, payment_capture: 1 },
    });
    return { id: o.id, amount: o.amount, currency: o.currency };
  },

  /** Verifies the checkout callback signature: HMAC_SHA256(order_id|payment_id). */
  verifyPaymentSignature(gatewayOrderId: string, paymentId: string, signature: string): boolean {
    const key = this.provider === "mock" ? mockSecret() : env().RAZORPAY_KEY_SECRET!;
    const expected = createHmac("sha256", key).update(`${gatewayOrderId}|${paymentId}`).digest("hex");
    return safeEqualHex(expected, signature);
  },

  /** Mock only: what a gateway would sign. Used by the mock checkout page. */
  signMock(gatewayOrderId: string, paymentId: string): string {
    if (this.provider !== "mock") throw new Error("Mock signing is disabled");
    return createHmac("sha256", mockSecret()).update(`${gatewayOrderId}|${paymentId}`).digest("hex");
  },

  verifyWebhook(rawBody: string, signature: string | null): boolean {
    if (!signature) return false;
    const secret = this.provider === "mock" ? mockSecret() : env().RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return false;
    const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
    return safeEqualHex(expected, signature);
  },

  /** Confirms a payment's state directly with the gateway (never trust the browser). */
  async fetchPayment(paymentId: string): Promise<{ id: string; status: string; amount: number; currency: string; order_id: string; method?: string }> {
    if (this.provider === "mock") {
      throw new Error("fetchPayment is not used in mock mode");
    }
    return razorpay(`/payments/${encodeURIComponent(paymentId)}`, { method: "GET" });
  },

  async refund(paymentId: string, amountMinor: number, idempotencyKey: string): Promise<{ id: string; status: string }> {
    if (this.provider === "mock") {
      return { id: `mock_rfnd_${randomBytes(8).toString("hex")}`, status: "processed" };
    }
    return razorpay(`/payments/${encodeURIComponent(paymentId)}/refund`, {
      method: "POST",
      body: { amount: amountMinor, speed: "normal" },
      idempotencyKey,
    });
  },
};
