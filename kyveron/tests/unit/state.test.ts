import { describe, expect, it } from "vitest";
import { canTransition, isCancellableByCustomer, nextStatuses } from "@/lib/orders/state";

describe("order state machine", () => {
  it("only the gateway or system can mark an order paid", () => {
    expect(canTransition("pending_payment", "paid", "gateway")).toBe(true);
    expect(canTransition("pending_payment", "paid", "customer")).toBe(false);
    expect(canTransition("pending_payment", "paid", "staff")).toBe(false);
  });
  it("blocks skipping fulfilment steps", () => {
    expect(canTransition("confirmed", "shipped", "staff")).toBe(false);
    expect(canTransition("packed", "shipped", "staff")).toBe(true);
    expect(canTransition("delivered", "cancelled", "staff")).toBe(false);
  });
  it("refunded is terminal", () => {
    expect(nextStatuses("refunded", "staff")).toEqual([]);
  });
  it("customers cannot cancel once packed", () => {
    expect(isCancellableByCustomer("confirmed")).toBe(true);
    expect(isCancellableByCustomer("packed")).toBe(false);
    expect(isCancellableByCustomer("pending_payment")).toBe(true);
  });
});
