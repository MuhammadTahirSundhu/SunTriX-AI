import Stripe from "stripe";
import { getSetting } from "../lib/configLoader";

// ─── Lazy factory — reads current STRIPE_SECRET_KEY each call ─────────────
// This means admin can rotate Stripe keys without a server restart.
export function getStripeClient(): any {
  const key = getSetting("STRIPE_SECRET_KEY");
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured. Set it in Admin → Settings → Payments.");
  }
  return new Stripe(key, { typescript: true });
}

// Keep a default export for files that import `stripe` directly
// (payment.routes.ts) — it proxies all calls via the lazy factory.
const stripeProxy = new Proxy({} as any, {
  get(_target, prop) {
    const client = getStripeClient();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export default stripeProxy;
