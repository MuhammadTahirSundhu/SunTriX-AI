import { describe, it, expect } from "vitest";
import { toCents, fromCents, formatMoney } from "../lib/money";

describe("2.5 Money / Cents Safety Unit Tests", () => {
  it("should convert dollar amounts to integer cents accurately", () => {
    expect(toCents(0)).toBe(0);
    expect(toCents(0.01)).toBe(1);
    expect(toCents(1)).toBe(100);
    expect(toCents(999.99)).toBe(99999);
    expect(toCents(1500)).toBe(150000);
    expect(toCents(1500.5)).toBe(150050);
    expect(toCents("1500.50")).toBe(150050);
    expect(toCents("invalid")).toBe(0);
  });

  it("should convert integer cents to dollar amounts accurately", () => {
    expect(fromCents(0)).toBe(0);
    expect(fromCents(1)).toBe(0.01);
    expect(fromCents(100)).toBe(1);
    expect(fromCents(99999)).toBe(999.99);
    expect(fromCents(150050)).toBe(1500.5);
  });

  it("should format cents into localized USD strings", () => {
    expect(formatMoney(150050)).toBe("$1,500.50");
    expect(formatMoney(100)).toBe("$1.00");
    expect(formatMoney(0)).toBe("$0.00");
  });
});
