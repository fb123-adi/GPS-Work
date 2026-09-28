/**
 * Order state machine. Every transition goes through `transition()` in
 * ./service.ts, which checks this table, records history, and notifies.
 */
export const ORDER_STATUSES = [
  "pending_payment", "payment_failed", "paid", "confirmed", "processing", "packed", "shipped",
  "out_for_delivery", "delivered", "cancellation_requested", "cancelled", "return_requested",
  "returned", "refund_pending", "refunded", "payment_disputed",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type Actor = "customer" | "staff" | "system" | "gateway";

type Rule = { to: OrderStatus; by: Actor[] };

const T: Record<OrderStatus, Rule[]> = {
  pending_payment: [
    { to: "paid", by: ["gateway", "system"] },
    { to: "payment_failed", by: ["gateway", "system"] },
    { to: "cancelled", by: ["system", "staff", "customer"] },
  ],
  payment_failed: [
    { to: "paid", by: ["gateway", "system"] },
    { to: "pending_payment", by: ["system", "customer"] },
    { to: "cancelled", by: ["system", "staff", "customer"] },
  ],
  paid: [
    { to: "confirmed", by: ["system", "staff"] },
    { to: "cancellation_requested", by: ["customer"] },
    { to: "cancelled", by: ["staff"] },
    { to: "payment_disputed", by: ["gateway"] },
    { to: "refund_pending", by: ["staff"] },
  ],
  confirmed: [
    { to: "processing", by: ["staff"] },
    { to: "cancellation_requested", by: ["customer"] },
    { to: "cancelled", by: ["staff"] },
    { to: "payment_disputed", by: ["gateway"] },
  ],
  processing: [
    { to: "packed", by: ["staff"] },
    { to: "cancellation_requested", by: ["customer"] },
    { to: "cancelled", by: ["staff"] },
    { to: "payment_disputed", by: ["gateway"] },
  ],
  packed: [
    { to: "shipped", by: ["staff"] },
    { to: "cancelled", by: ["staff"] },
    { to: "payment_disputed", by: ["gateway"] },
  ],
  shipped: [
    { to: "out_for_delivery", by: ["staff", "system"] },
    { to: "delivered", by: ["staff", "system"] },
    { to: "payment_disputed", by: ["gateway"] },
  ],
  out_for_delivery: [
    { to: "delivered", by: ["staff", "system"] },
    { to: "shipped", by: ["staff"] }, // failed delivery attempt, back in transit
    { to: "payment_disputed", by: ["gateway"] },
  ],
  delivered: [
    { to: "return_requested", by: ["customer", "staff"] },
    { to: "payment_disputed", by: ["gateway"] },
  ],
  cancellation_requested: [
    { to: "cancelled", by: ["staff"] },
    { to: "confirmed", by: ["staff"] }, // request declined
    { to: "processing", by: ["staff"] },
  ],
  cancelled: [{ to: "refund_pending", by: ["staff", "system"] }],
  return_requested: [
    { to: "returned", by: ["staff"] },
    { to: "delivered", by: ["staff"] }, // return rejected
  ],
  returned: [{ to: "refund_pending", by: ["staff", "system"] }],
  refund_pending: [
    { to: "refunded", by: ["gateway", "staff", "system"] },
  ],
  refunded: [],
  payment_disputed: [
    { to: "paid", by: ["gateway", "staff"] }, // dispute won
    { to: "refunded", by: ["gateway", "staff"] }, // dispute lost
    { to: "confirmed", by: ["staff"] },
  ],
};

export function canTransition(from: OrderStatus, to: OrderStatus, by: Actor): boolean {
  return T[from].some((r) => r.to === to && r.by.includes(by));
}

export function nextStatuses(from: OrderStatus, by: Actor): OrderStatus[] {
  return T[from].filter((r) => r.by.includes(by)).map((r) => r.to);
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Awaiting payment",
  payment_failed: "Payment failed",
  paid: "Paid",
  confirmed: "Confirmed",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancellation_requested: "Cancellation requested",
  cancelled: "Cancelled",
  return_requested: "Return requested",
  returned: "Returned",
  refund_pending: "Refund pending",
  refunded: "Refunded",
  payment_disputed: "Payment under review",
};

/** Customer-facing timeline steps (the happy path). */
export const TIMELINE: OrderStatus[] = ["confirmed", "packed", "shipped", "out_for_delivery", "delivered"];

export const PAID_STATES: OrderStatus[] = [
  "paid", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered",
  "cancellation_requested", "return_requested", "returned", "refund_pending", "payment_disputed",
];

export function isCancellableByCustomer(s: OrderStatus) {
  return canTransition(s, "cancellation_requested", "customer") || s === "pending_payment" || s === "payment_failed";
}
