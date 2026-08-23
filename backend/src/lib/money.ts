/**
 * Authoritative Money / Cents Conversion & Formatting Utility
 * Internal Invariant: All persisted database amounts and service-layer financial logic operate in integer Cents.
 */

/**
 * Converts a floating point or string dollar input to integer cents.
 * Handles edge cases like rounding $999.99 → 99999, $1500.50 → 150050, $0.01 → 1.
 */
export function toCents(dollars: number | string): number {
  const num = typeof dollars === "string" ? parseFloat(dollars) : dollars;
  if (isNaN(num) || num < 0) return 0;
  return Math.round(num * 100);
}

/**
 * Converts integer cents back to floating point dollars for external calculations.
 */
export function fromCents(cents: number): number {
  if (isNaN(cents) || cents < 0) return 0;
  return Math.round(cents) / 100;
}

/**
 * Formats integer cents as human-readable USD currency string (e.g. 150050 -> "$1,500.50").
 */
export function formatMoney(cents: number, currency: string = "USD"): string {
  const dollars = fromCents(cents);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(dollars);
}
