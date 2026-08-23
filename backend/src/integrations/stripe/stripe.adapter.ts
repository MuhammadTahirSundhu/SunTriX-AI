import Stripe from "stripe";
import { getSetting } from "../../lib/configLoader";

export class StripeAdapter {
  getClient(): InstanceType<typeof Stripe> {
    const secretKey = getSetting("STRIPE_SECRET_KEY") || "sk_test_placeholder";
    return new Stripe(secretKey, { apiVersion: "2025-02-24.acacia" as any });
  }

  async constructWebhookEvent(payload: string | Buffer, signature: string): Promise<any> {
    const client = this.getClient();
    const webhookSecret = getSetting("STRIPE_WEBHOOK_SECRET") || "";
    return client.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  async createCheckoutSession(params: {
    clientEmail: string;
    description: string;
    amountCents: number;
    currency?: string;
    metadata: Record<string, string>;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ id: string; url: string | null }> {
    const client = this.getClient();
    const session = await client.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: (params.currency || "USD").toLowerCase(),
            product_data: { name: params.description },
            unit_amount: params.amountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: params.clientEmail,
      metadata: params.metadata,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });

    return { id: session.id, url: session.url };
  }

  async createRefund(paymentIntentId: string, amountCents?: number, reason?: string): Promise<any> {
    const client = this.getClient();
    return client.refunds.create({
      payment_intent: paymentIntentId,
      amount: amountCents,
      reason: reason as any,
    });
  }
}

export const stripeAdapter = new StripeAdapter();
