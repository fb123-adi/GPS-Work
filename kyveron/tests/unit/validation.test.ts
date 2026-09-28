import { describe, expect, it } from "vitest";
import { addressSchema, checkoutSchema, indianMobile } from "@/lib/validation";
import { taxRateFor, shippingFor } from "@/lib/pricing";
import { estimateDelivery } from "@/lib/delivery";
import { passwordProblem, hashPassword, verifyPassword } from "@/lib/auth/password";

const addr = { fullName: "Asha Rao", phone: "98765 43210", line1: "12 MG Road", city: "Bengaluru", state: "Karnataka", postalCode: "560001", country: "IN" };

describe("validation", () => {
  it("normalises Indian mobiles", () => {
    expect(indianMobile.parse("+91 98765-43210")).toBe("+919876543210");
    expect(indianMobile.safeParse("12345").success).toBe(false);
    expect(indianMobile.safeParse("5876543210").success).toBe(false);
  });
  it("validates PIN codes and states", () => {
    expect(addressSchema.safeParse(addr).success).toBe(true);
    expect(addressSchema.safeParse({ ...addr, postalCode: "060001" }).success).toBe(false);
    expect(addressSchema.safeParse({ ...addr, state: "Atlantis" }).success).toBe(false);
    expect(addressSchema.safeParse({ ...addr, country: "US" }).success).toBe(false);
  });
  it("checkout never accepts amounts", () => {
    const r = checkoutSchema.safeParse({ idempotencyKey: crypto.randomUUID(), email: "a@b.co", phone: "9876543210", shipping: addr,
      billingSameAsShipping: true, shippingMethod: "standard", paymentMethod: "upi", acceptTerms: true, totalMinor: 1 });
    expect(r.success).toBe(true);
    expect("totalMinor" in (r.success ? r.data : {})).toBe(false);
    expect(checkoutSchema.safeParse({ ...r.data, acceptTerms: false }).success).toBe(false);
  });
});

describe("pricing rules", () => {
  it("applies GST slab by unit value", () => {
    expect(taxRateFor(249000)).toBe(5);
    expect(taxRateFor(250000)).toBe(5);
    expect(taxRateFor(250001)).toBe(18);
  });
  it("free standard shipping over threshold", () => {
    expect(shippingFor("standard", 299900).fee).toBe(0);
    expect(shippingFor("standard", 100000).fee).toBe(9900);
    expect(shippingFor("express", 500000).fee).toBe(24900);
    expect(shippingFor("bogus", 100000).method.id).toBe("standard");
  });
  it("estimates delivery and rejects bad PINs", () => {
    expect(estimateDelivery("12345").ok).toBe(false);
    const r = estimateDelivery("190001");
    expect(r.ok && r.methods.every((m) => m.id !== "express")).toBe(true);
  });
});

describe("passwords", () => {
  it("hashes with scrypt and verifies", async () => {
    const h = await hashPassword("correct horse battery");
    expect(h.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("correct horse battery", h)).toBe(true);
    expect(await verifyPassword("wrong", h)).toBe(false);
  });
  it("rejects weak passwords", () => {
    expect(passwordProblem("short")).toBeTruthy();
    expect(passwordProblem("password123456")).toBeTruthy();
    expect(passwordProblem("a quiet morning run")).toBeNull();
  });
});
