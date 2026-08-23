import Payment, { IPayment } from "../../models/Payment";

export class PaymentRepository {
  async create(data: any): Promise<IPayment> {
    return Payment.create(data);
  }

  async findByInvoiceToken(invoiceToken: string): Promise<IPayment | null> {
    return Payment.findOne({ invoiceToken });
  }

  async findByStripeSessionId(stripeSessionId: string): Promise<IPayment | null> {
    return Payment.findOne({ stripeSessionId });
  }

  async claimPaymentPaid(
    invoiceToken?: string,
    stripeSessionId?: string,
    updateData: Record<string, any> = {}
  ): Promise<{ payment: IPayment | null; wasAlreadyPaid: boolean }> {
    let existing: IPayment | null = null;
    if (invoiceToken) existing = await Payment.findOne({ invoiceToken });
    if (!existing && stripeSessionId) existing = await Payment.findOne({ stripeSessionId });

    if (existing && existing.paidAt) {
      return { payment: existing, wasAlreadyPaid: true };
    }

    const filter = invoiceToken
      ? { invoiceToken, paidAt: null }
      : { stripeSessionId, paidAt: null };

    const updated = await Payment.findOneAndUpdate(
      filter,
      { $set: { ...updateData, status: "paid", paidAt: new Date() } },
      { new: true }
    );

    return { payment: updated, wasAlreadyPaid: false };
  }
}

export const paymentRepository = new PaymentRepository();
