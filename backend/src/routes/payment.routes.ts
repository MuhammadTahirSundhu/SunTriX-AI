import express, { Router, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import stripe from "../services/stripe";
import Payment from "../models/Payment";
import Pricing from "../models/Pricing";
import TaskRequest from "../models/TaskRequest";
import ProjectTracker from "../models/ProjectTracker";
import { requireAuth } from "../middleware/auth";
import { createError } from "../middleware/errorHandler";
import { logAudit } from "../lib/audit";
import { getSetting } from "../lib/configLoader";
import {
  sendPaymentConfirmation,
  sendInvoiceEmail,
} from "../services/email";

const router = Router();

// Read dynamically so admin changes take effect without restart
const getAppUrl = () => getSetting("FRONTEND_URL", "http://localhost:5173");

const fmt = (cents: number, currency = "usd") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);

// ─────────────────────────────────────────────────────────────────
// REMOVED: POST /payments/create-checkout
// Clients should NEVER pay directly from Pricing page.
// The correct flow is:
//   Pricing → "Get a Quote" → /request-task → Admin review →
//   Admin creates Invoice → Client pays via /invoice/:token
// ─────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────
// PUBLIC: GET /payments/verify/:sessionId
// Called by PaymentSuccess page to confirm payment details
// ─────────────────────────────────────────────────────────────────
router.get("/verify/:sessionId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId, {
      expand: ["payment_intent"],
    });

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return next(createError("Payment not completed", 402));
    }

    const payment = await Payment.findOne({ stripeSessionId: session.id })
      .populate("planId", "name price currency billingPeriod")
      .populate("taskRequestId", "projectTitle service trackingToken")
      .lean();

    // Try to get Stripe's hosted receipt URL
    const pi = session.payment_intent as any;
    const receiptUrl = pi?.charges?.data?.[0]?.receipt_url || "";

    // Save receiptUrl back to DB if not yet stored
    if (payment && receiptUrl && !payment.receiptUrl) {
      await Payment.findByIdAndUpdate(payment._id, { receiptUrl });
    }

    const taskReq = payment?.taskRequestId as any;
    const trackingToken = taskReq?.trackingToken || payment?.trackingToken || "";

    res.json({
      status: "paid",
      amount: session.amount_total,
      currency: session.currency,
      email: session.customer_email,
      description: (session.metadata as any)?.planName || payment?.description || "",
      paidAt: payment?.paidAt || new Date(),
      receiptUrl,
      trackingToken,
      payment,
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────
// PUBLIC: GET /payments/invoice/:token
// Client opens invoice/proposal URL sent by admin
// ─────────────────────────────────────────────────────────────────
router.get("/invoice/:token", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payment = await Payment.findOne({ invoiceToken: req.params.token })
      .populate("taskRequestId", "projectTitle service name trackingToken")
      .lean();

    if (!payment) return next(createError("Invoice not found", 404));

    // Check expiry
    if (payment.expiresAt && new Date() > payment.expiresAt && payment.status === "pending") {
      return next(createError("This invoice has expired. Please contact support.", 410));
    }

    if (payment.status === "paid") {
      const taskReq = payment.taskRequestId as any;
      return res.json({
        ...payment,
        alreadyPaid: true,
        trackingToken: taskReq?.trackingToken || payment.trackingToken || "",
      });
    }

    // Create a fresh Stripe Checkout session for this invoice
    const taskReq = payment.taskRequestId as any;
    const trackingToken = taskReq?.trackingToken || payment.trackingToken || "";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: payment.currency || "usd",
            product_data: {
              name: payment.description || "SunTriX Invoice",
              description: taskReq?.projectTitle
                ? `Project: ${taskReq.projectTitle} · Service: ${taskReq.service || "Custom"}`
                : "SunTriX AI Solutions",
            },
            unit_amount: payment.amount,
          },
          quantity: 1,
        },
      ],
      customer_email: payment.clientEmail,
      metadata: {
        invoiceToken: payment.invoiceToken,
        paymentId: payment._id.toString(),
        trackingToken,
        type: "invoice",
      },
      // After payment: redirect to /track/:token so client sees "In Progress" immediately
      success_url: trackingToken
        ? `${getAppUrl()}/track/${trackingToken}?paid=1`
        : `${getAppUrl()}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getAppUrl()}/invoice/${payment.invoiceToken}`,
    });

    // Update session id for webhook matching
    await Payment.findByIdAndUpdate(payment._id, { stripeSessionId: session.id });

    res.json({
      ...payment,
      checkoutUrl: session.url,
      trackingToken,
      expiresAt: payment.expiresAt,
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────
// STRIPE WEBHOOK: POST /payments/webhook
// ⚠️ Must use raw body — registered BEFORE express.json() in app.ts
// ─────────────────────────────────────────────────────────────────
router.post(
  "/webhook",
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = getSetting("STRIPE_WEBHOOK_SECRET");

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not set");
      return res.sendStatus(500);
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      console.log(`[Webhook] Event received: ${event.type}`);

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as any;
          console.log(`[Webhook] checkout.session.completed — session.id: ${session.id}`);

          if (session.metadata?.type === "tracker_milestone") {
            try {
              const { trackerId, milestoneId, trackerToken } = session.metadata;
              const tracker = await ProjectTracker.findById(trackerId);
              if (tracker) {
                const milestone = tracker.milestones.id(milestoneId);
                if (milestone && !milestone.paidAt) {
                  milestone.paidAt = new Date();
                  milestone.stripePaymentIntentId = session.payment_intent || "";
                  
                  // Optional audit log write
                  tracker.auditLog.push({
                    action: `Milestone paid: ${milestone.title}`,
                    actor: "System",
                    actorRole: "System",
                    timestamp: new Date(),
                    metadata: { amount: milestone.amount }
                  });
                  await tracker.save();

                  const task = await TaskRequest.findById(tracker.taskRequestId).lean() as any;
                  if (task) {
                    const { sendTrackerPaymentConfirmedEmail } = await import("../services/email");
                    await sendTrackerPaymentConfirmedEmail({
                      clientEmail: task.email,
                      projectTitle: task.projectTitle,
                      milestoneTitle: milestone.title,
                      amountFormatted: `$${(milestone.amount / 100).toFixed(2)}`,
                      portalUrl: `${getAppUrl()}/client/project/${trackerToken}`,
                    });
                  }
                  console.log(`[Webhook] Tracker milestone ${milestone.title} marked paid (checkout.session.completed)`);
                }
              }
            } catch (e) { console.error("Error processing tracker milestone payment:", e); }
            break;
          }

          // Try to get receipt_url from the charge
          let receiptUrl = "";
          try {
            if (session.payment_intent) {
              const pi = await stripe.paymentIntents.retrieve(session.payment_intent, {
                expand: ["charges"],
              });
              receiptUrl = (pi as any).charges?.data?.[0]?.receipt_url || "";
            }
          } catch (_) {}

          const update: any = {
            status: "paid",
            paidAt: new Date(),
            stripePaymentIntentId: session.payment_intent || "",
            stripeCustomerId: session.customer || "",
            receiptUrl,
          };

          const invoiceToken = session.metadata?.invoiceToken;
          const trackingToken = session.metadata?.trackingToken || "";
          let updated: any = null;

          if (invoiceToken) {
            updated = await Payment.findOneAndUpdate(
              { invoiceToken },
              { ...update, stripeSessionId: session.id, trackingToken },
              { new: true }
            );
          }

          if (!updated) {
            updated = await Payment.findOneAndUpdate(
              { stripeSessionId: session.id },
              { ...update, trackingToken },
              { new: true }
            );
          }

          console.log(`[Webhook] Payment DB update:`, updated ? `✅ _id=${updated._id}` : "❌ NO MATCH");

          // Move linked TaskRequest to in_progress
          if (updated?.taskRequestId) {
            await TaskRequest.findByIdAndUpdate(updated.taskRequestId, {
              status: "in_progress",
              $push: {
                statusHistory: {
                  status: "in_progress",
                  note: "Payment confirmed — project is now active",
                  updatedAt: new Date(),
                },
              },
            });
          }

          // Send payment confirmation email to client
          if (updated) {
            const resolvedTrackingToken =
              trackingToken ||
              (updated.taskRequestId
                ? (await TaskRequest.findById(updated.taskRequestId).select("trackingToken").lean() as any)?.trackingToken
                : "");

            await sendPaymentConfirmation({
              clientName: updated.clientName || "",
              clientEmail: updated.clientEmail,
              description: updated.description,
              amountUSD: fmt(updated.amount, updated.currency),
              receiptUrl,
              trackingUrl: resolvedTrackingToken ? `${getAppUrl()}/track/${resolvedTrackingToken}` : "",
              paidAt: new Date().toLocaleDateString("en-US", { dateStyle: "long" }),
            });
          }

          break;
        }

        case "payment_intent.payment_failed": {
          const pi = event.data.object as any;
          console.log(`[Webhook] payment_intent.payment_failed — pi.id: ${pi.id}`);
          await Payment.findOneAndUpdate(
            { stripePaymentIntentId: pi.id },
            { status: "failed" }
          );
          break;
        }

        case "charge.refunded": {
          const charge = event.data.object as any;
          console.log(`[Webhook] charge.refunded — payment_intent: ${charge.payment_intent}`);
          await Payment.findOneAndUpdate(
            { stripePaymentIntentId: charge.payment_intent },
            {
              status: "refunded",
              refundId: charge.refunds?.data?.[0]?.id || "",
              refundedAt: new Date(),
            }
          );
          break;
        }

        case "customer.subscription.deleted": {
          const sub = event.data.object as any;
          console.log(`[Webhook] Subscription cancelled: ${sub.id}`);
          break;
        }

        default:
          console.log(`[Webhook] Unhandled event type: ${event.type} — ignoring`);
          break;
      }
    } catch (err) {
      console.error("[Webhook] Handler error:", err);
    }

    res.json({ received: true });
  }
);

// ─────────────────────────────────────────────────────────────────
// ADMIN: GET /payments/admin/list
// ─────────────────────────────────────────────────────────────────
router.get("/admin/list", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, type, limit = 50, skip = 0 } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(Number(skip))
        .populate("planId", "name")
        .populate("taskRequestId", "projectTitle name trackingToken")
        .lean(),
      Payment.countDocuments(filter),
    ]);

    res.json({ payments, total });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────
// ADMIN: GET /payments/admin/stats
// ─────────────────────────────────────────────────────────────────
router.get("/admin/stats", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalRevenue, pending, refunded, thisMonth] = await Promise.all([
      Payment.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Payment.countDocuments({ status: "pending" }),
      Payment.aggregate([{ $match: { status: "refunded" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Payment.aggregate([
        { $match: { status: "paid", paidAt: { $gte: new Date(new Date().setDate(1)) } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    res.json({
      totalRevenueCents: totalRevenue[0]?.total || 0,
      pendingCount: pending,
      refundedCents: refunded[0]?.total || 0,
      thisMonthCents: thisMonth[0]?.total || 0,
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────
// ADMIN: POST /payments/admin/create-invoice
// Admin creates a proposal/invoice for a task request client.
// This triggers an automatic email to the client with the invoice link.
// ─────────────────────────────────────────────────────────────────
router.post("/admin/create-invoice", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskRequestId, clientEmail, clientName, amountUSD, description } = req.body;

    if (!clientEmail || !amountUSD || !description) {
      return next(createError("clientEmail, amountUSD, and description are required", 400));
    }
    if (amountUSD <= 0 || amountUSD > 999999) {
      return next(createError("Amount must be between $1 and $999,999", 400));
    }

    const amountCents = Math.round(Number(amountUSD) * 100);
    const invoiceToken = crypto.randomBytes(24).toString("hex");

    // 30-day expiry from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Fetch trackingToken from TaskRequest if linked
    let trackingToken = "";
    let projectTitle = "";
    if (taskRequestId) {
      const tr = await TaskRequest.findById(taskRequestId).select("trackingToken projectTitle status").lean() as any;
      if (tr) {
        if (tr.status !== "contract_signed" && tr.status !== "in_progress") {
          return next(createError("Invoice can only be created after the contract is signed.", 400));
        }
        trackingToken = tr.trackingToken || "";
        projectTitle = tr.projectTitle || "";
        // Status remains unchanged (already contract_signed or in_progress)
      }
    }

    const payment = await Payment.create({
      type: "invoice",
      status: "pending",
      amount: amountCents,
      currency: "usd",
      clientEmail,
      clientName: clientName || "",
      description,
      taskRequestId: taskRequestId || null,
      invoiceToken,
      trackingToken,
      expiresAt,
    });

    await logAudit(req, "create", "payment_invoice", payment._id.toString(), description);

    const invoiceUrl = `${getAppUrl()}/invoice/${invoiceToken}`;

    // Auto-send invoice email to client
    await sendInvoiceEmail({
      clientName: clientName || "",
      clientEmail,
      description,
      amountUSD: fmt(amountCents, "usd"),
      invoiceUrl,
      expiresAt: expiresAt.toLocaleDateString("en-US", { dateStyle: "long" }),
      projectTitle,
    });

    res.status(201).json({ payment, invoiceUrl, invoiceToken });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────
// ADMIN: POST /payments/admin/create-payment-link
// Quick retainer / ad-hoc link not tied to a task.
// Uses a Stripe Checkout Session (not a Payment Link) so that the
// success redirect includes ?session_id= which PaymentSuccess.tsx
// needs to verify the payment.
// ─────────────────────────────────────────────────────────────────
router.post("/admin/create-payment-link", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientEmail, clientName, amountUSD, description } = req.body;
    if (!clientEmail || !amountUSD || !description) {
      return next(createError("clientEmail, amountUSD, and description are required", 400));
    }

    const amountCents = Math.round(Number(amountUSD) * 100);
    const invoiceToken = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Create a Stripe Checkout Session so {CHECKOUT_SESSION_ID} is
    // appended to the success URL — required by PaymentSuccess.tsx
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: { name: description },
          },
          quantity: 1,
        },
      ],
      customer_email: clientEmail,
      metadata: {
        invoiceToken,
        type: "retainer",
        clientEmail,
        planName: description,
      },
      success_url: `${getAppUrl()}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getAppUrl()}/payment/cancel`,
    });

    const payment = await Payment.create({
      type: "retainer",
      status: "pending",
      amount: amountCents,
      currency: "usd",
      clientEmail,
      clientName: clientName || "",
      description,
      invoiceToken,
      stripeSessionId: session.id,
      expiresAt,
    });

    await logAudit(req, "create", "payment_retainer", payment._id.toString(), description);

    res.status(201).json({ payment, paymentLinkUrl: session.url, invoiceToken });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────
// ADMIN: POST /payments/admin/refund/:id
// ─────────────────────────────────────────────────────────────────
router.post("/admin/refund/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reason, amountUSD } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) return next(createError("Payment not found", 404));
    if (payment.status !== "paid") return next(createError("Only paid payments can be refunded", 400));
    if (!payment.stripePaymentIntentId) return next(createError("No payment intent ID on record", 400));

    const refundParams: any = {
      payment_intent: payment.stripePaymentIntentId,
      reason: "requested_by_customer",
    };
    if (amountUSD) {
      refundParams.amount = Math.round(Number(amountUSD) * 100);
    }

    const refund = await stripe.refunds.create(refundParams);

    payment.status = "refunded";
    payment.refundId = refund.id;
    payment.refundedAt = new Date();
    payment.refundReason = reason || "";
    await payment.save();

    await logAudit(req, "delete", "payment_invoice", payment._id.toString(), reason || "");
    res.json({ message: "Refund issued", refundId: refund.id });
  } catch (err) {
    next(err);
  }
});

export default router;
