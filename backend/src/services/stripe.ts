import { stripeAdapter } from "../integrations/stripe/stripe.adapter";

export function getStripeClient() {
  return stripeAdapter.getClient();
}

const stripeProxy = new Proxy({} as ReturnType<typeof getStripeClient>, {
  get(_target, prop: string | symbol) {
    const client = stripeAdapter.getClient();
    const value = (client as any)[prop];
    return typeof value === "function" ? (value as Function).bind(client) : value;
  },
});

export default stripeProxy;
