import { describe, expect, it } from "vitest";
import { allocate, convertForDisplay, formatMoney, inclusiveTax, percentOf } from "@/lib/money";

describe("money", () => {
  it("computes percentages in integer minor units", () => {
    expect(percentOf(249000, 10)).toBe(24900);
    expect(percentOf(333, 10)).toBe(33);
    expect(percentOf(335, 10)).toBe(34); // half-up
  });
  it("extracts inclusive GST", () => {
    expect(inclusiveTax(249000, 5)).toBe(11857);
    expect(inclusiveTax(549000, 18)).toBe(83746);
    expect(inclusiveTax(0, 18)).toBe(0);
  });
  it("allocates without losing paise", () => {
    const parts = allocate(1000, [333, 333, 334]);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(1000);
    expect(allocate(0, [1, 2])).toEqual([0, 0]);
    expect(allocate(7, [0, 0, 5])).toEqual([0, 0, 7]);
  });
  it("formats INR with Indian grouping", () => {
    expect(formatMoney(12345600)).toBe("₹1,23,456");
    expect(formatMoney(11857)).toBe("₹118.57");
  });
  it("converts only for display, rounding once", () => {
    expect(convertForDisplay(249000, 0.0119, "USD")).toBe(2963);
  });
});
