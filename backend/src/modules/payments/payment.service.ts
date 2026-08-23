import crypto from "crypto";
import { paymentRepository, PaymentRepository } from "./payment.repository";
import { taskRequestService, TaskRequestService } from "../task-requests/task-request.service";
import { stripeAdapter, StripeAdapter } from "../../integrations/stripe/stripe.adapter";
import { AppError, ERROR_CODES } from "../../shared/errors/appError";
import { CreateInvoiceDTO, IPayment } from "./payment.types";
import { getSetting } from "../../lib/configLoader";
import TaskRequest from "../../models/TaskRequest";
import { sendPaymentConfirmation, sendInvoiceEmail } from "../../services/email";

export class PaymentService {
  constructor(
    private paymentRepo: PaymentRepository = paymentRepository,
    private taskService: TaskRequestService = taskRequestService,
    private stripe: StripeAdapter = stripeAdapter
  ) {}

  async createInvoice(dto: CreateInvoiceDTO): Promise<{ payment: IPayment; invoiceUrl: string }> {
    const invoiceToken = `inv_${crypto.randomBytes(16).toString("hex")}`;
    const expiresInDays = dto.expiresInDays || 14;
    const expiresAt = new Date(Date.now() + expiresInDays * 86400000);

    const payment = await this.paymentRepo.create({
      ...dto,
      amount: dto.amountCents,
      type: "invoice",
      invoiceToken,
      expiresAt,
      status: "pending",
    });

    const appUrl = getSetting("FRONTEND_URL", "http://localhost:5173");
    const invoiceUrl = `${appUrl}/invoice/${invoiceToken}`;

    await sendInvoiceEmail({
      clientEmail: dto.clientEmail,
      clientName: dto.clientName || "Valued Client",
      description: dto.description,
      amountUSD: `$${(dto.amountCents / 100).toFixed(2)}`,
      invoiceUrl,
      expiresAt: expiresAt.toISOString(),
    });

    return { payment, invoiceUrl };
  }

  async getInvoiceByToken(invoiceToken: string): Promise<IPayment> {
    const payment = await this.paymentRepo.findByInvoiceToken(invoiceToken);
    if (!payment) throw new AppError("Invoice not found", ERROR_CODES.NOT_FOUND);
    return payment;
  }

  async processInvoiceCheckout(invoiceToken: string): Promise<string> {
    const payment = await this.getInvoiceByToken(invoiceToken);
    if (payment.status === "paid") {
      throw new AppError("This invoice has already been paid.", ERROR_CODES.BAD_REQUEST);
    }
    if (payment.expiresAt && new Date() > payment.expiresAt) {
      throw new AppError("This invoice has expired.", 410);
    }

    const appUrl = getSetting("FRONTEND_URL", "http://localhost:5173");
    const session = await this.stripe.createCheckoutSession({
      clientEmail: payment.clientEmail,
      description: payment.description,
      amountCents: payment.amount,
      currency: payment.currency || "usd",
      metadata: {
        invoiceToken: payment.invoiceToken || "",
        taskRequestId: payment.taskRequestId ? payment.taskRequestId.toString() : "",
        paymentType: payment.type,
      },
      successUrl: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&invoiceToken=${payment.invoiceToken}`,
      cancelUrl: `${appUrl}/invoice/${payment.invoiceToken}?canceled=true`,
    });

    payment.stripeSessionId = session.id;
    await payment.save();

    if (!session.url) throw new AppError("Failed to create Stripe checkout session", ERROR_CODES.INTERNAL_SERVER_ERROR);
    return session.url;
  }

  async handlePaymentPaidSideEffects(payment: IPayment): Promise<void> {
    if (payment.taskRequestId) {
      const taskReqId = payment.taskRequestId.toString();
      const task = await TaskRequest.findById(taskReqId);
      if (task && (payment.type === "invoice" || payment.type === "subscription")) {
        if (task.status === "contract_signed" || task.status === "contract_sent") {
          await this.taskService.transitionStatus(taskReqId, "in_progress", "system", `Paid invoice: ${payment.description}`);
        }
      }
    }

    sendPaymentConfirmation({
      clientName: payment.clientName || "Valued Client",
      clientEmail: payment.clientEmail,
      description: payment.description,
      amountUSD: `$${(payment.amount / 100).toFixed(2)}`,
      receiptUrl: (payment as any).stripeReceiptUrl || "",
      paidAt: new Date().toISOString(),
    }).catch(console.error);
  }

  async handleStripeWebhookEvent(rawBody: string | Buffer, signature: string): Promise<{ received: boolean; eventType: string }> {
    const event = await this.stripe.constructWebhookEvent(rawBody, signature);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const invoiceToken = session.metadata?.invoiceToken;
      const stripeSessionId = session.id;

      const { payment, wasAlreadyPaid } = await this.paymentRepo.claimPaymentPaid(invoiceToken, stripeSessionId, {
        stripePaymentIntentId: session.payment_intent as string,
        stripeReceiptUrl: session.payment_intent?.charges?.data[0]?.receipt_url || "",
      });

      if (payment && !wasAlreadyPaid) {
        await this.handlePaymentPaidSideEffects(payment);
      }
    }

    return { received: true, eventType: event.type };
  }
}

export const paymentService = new PaymentService();
