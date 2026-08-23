import { Router, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import Newsletter from "../models/Newsletter";
import Campaign from "../models/Campaign";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";
import { createError } from "../middleware/errorHandler";
import { getSetting } from "../lib/configLoader";
import { sendNewsletterConfirmationEmail, sendNewsletterWelcomeEmail } from "../services/email";
import { validate, NewsletterSubscribeSchema } from "../middleware/validate";

const router = Router();

// POST /newsletter — public subscribe
router.post("/", validate(NewsletterSubscribeSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, interest } = req.body;
    // Zod validate() enforces name/email/interest above; regex email check is redundant
    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existing) {
      existing.name = name;
      existing.interest = interest;
      existing.subscribed = true;
      await existing.save();
      return res.json({ message: "Subscription updated successfully" });
    }

    // Respect double opt-in setting
    const doubleOptIn = getSetting("NEWSLETTER_DOUBLE_OPTIN", "false") === "true";

    if (doubleOptIn) {
      // Create subscriber as unconfirmed until they click the confirmation email link
      const confirmToken = crypto.randomBytes(32).toString("hex");
      const confirmTokenExpiry = new Date();
      confirmTokenExpiry.setHours(confirmTokenExpiry.getHours() + 24); // 24-hour expiry

      await Newsletter.create({
        name,
        email,
        interest,
        subscribed: false,
        confirmToken,
        confirmTokenExpiry
      });

      const frontendUrl = getSetting("FRONTEND_URL", "http://localhost:5173");
      const confirmUrl = `${frontendUrl}/newsletter/confirm/${confirmToken}`;

      await sendNewsletterConfirmationEmail({ name, email, confirmUrl });

      res.status(201).json({
        message: "Please check your email to confirm your subscription.",
        requiresConfirmation: true,
      });
    } else {
      await Newsletter.create({ name, email, interest, subscribed: true });
      res.status(201).json({ message: "Subscribed successfully" });
    }
  } catch (err) { next(err); }
});

// GET /newsletter/confirm/:token — public link clicked from confirmation email
router.get("/confirm/:token", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    if (!token) return next(createError("Token is required", 400));

    const subscriber = await Newsletter.findOne({ confirmToken: token });
    if (!subscriber) return next(createError("Invalid confirmation link.", 400));

    if (subscriber.confirmTokenExpiry && new Date() > subscriber.confirmTokenExpiry) {
      return next(createError("Confirmation link has expired. Please subscribe again.", 410));
    }

    if (subscriber.subscribed) {
      return res.json({ message: "Already subscribed!" });
    }

    subscriber.subscribed = true;
    subscriber.confirmToken = undefined;
    subscriber.confirmTokenExpiry = undefined;
    await subscriber.save();

    await sendNewsletterWelcomeEmail({
      name: subscriber.name,
      email: subscriber.email,
      interest: subscriber.interest,
    });

    res.json({ message: "Subscription confirmed! You will now receive our updates." });
  } catch (err) { next(err); }
});

// GET /newsletter — admin subscribers list
router.get("/", requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const subscribers = await Newsletter.find({ subscribed: true }).sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (err) { next(err); }
});

// DELETE /newsletter/:id — admin remove subscriber
router.delete("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Newsletter.findByIdAndDelete(req.params.id);
    res.json({ message: "Subscriber removed" });
  } catch (err) { next(err); }
});

// POST /newsletter/generate-template — AI template generation
router.post("/generate-template", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return next(createError("Prompt is required", 400));
    const { generateEmailTemplate } = await import("../services/groq");
    const htmlCode = await generateEmailTemplate(prompt);
    res.json({ html: htmlCode });
  } catch (err) { next(err); }
});

// GET /newsletter/campaigns — admin campaign history
router.get("/campaigns", requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 }).limit(50);
    res.json({ campaigns });
  } catch (err) { next(err); }
});

const broadcastHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const subject = req.body.subject;
    const body = req.body.body || req.body.htmlContent || req.body.content;
    const targetAudience = req.body.targetAudience;

    if (!subject || !body) {
      return next(createError("Subject and body are required", 400));
    }

    const query: Record<string, unknown> = { subscribed: true };
    if (targetAudience && targetAudience !== "All") query.interest = targetAudience;

    const subscribers = await Newsletter.find(query).select("email");
    const emails = subscribers.map(sub => sub.email);
    if (emails.length === 0) return next(createError("No active subscribers found", 400));

    // Append admin-configured footer text if set
    const footerText = getSetting("NEWSLETTER_FOOTER_TEXT", "");
    const finalBody = footerText
      ? `${body}\n<div style="margin-top:24px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center;">${footerText}</div>`
      : body;

    // Create campaign record immediately with status "pending"
    const campaign = await Campaign.create({
      subject,
      htmlBody: finalBody,
      targetAudience: targetAudience || "All",
      recipientCount: emails.length,
      adminId: req.user?.id || "unknown",
      adminName: req.user?.name || "Admin",
      status: "pending",
    });

    // Respond immediately — do NOT block the HTTP request on email delivery
    res.status(202).json({
      message: `Broadcast queued for ${emails.length} subscriber${emails.length !== 1 ? "s" : ""}. Sending in background.`,
      recipientCount: emails.length,
      campaignId: campaign._id.toString(),
      campaign,
      status: "pending",
    });

    // Fire-and-forget: send emails in background after response is flushed
    setImmediate(async () => {
      try {
        await Campaign.findByIdAndUpdate(campaign._id, { status: "sending" });
        const { sendNewsletterBroadcast, sendCampaignFailureNotification } = await import("../services/email");
        
        const { sentCount, error } = await sendNewsletterBroadcast(subject, finalBody, emails);
        
        if (error) {
          console.error(`[Newsletter] Broadcast failed: campaign=${campaign._id}, sent=${sentCount}, err=${error}`);
          await Campaign.findByIdAndUpdate(campaign._id, {
            status: "failed",
            sentCount,
            errorMessage: error.substring(0, 500),
          }).catch(() => {});
          
          await sendCampaignFailureNotification({
            subject,
            sentCount,
            totalCount: emails.length,
            errorMessage: error,
          });
        } else {
          await Campaign.findByIdAndUpdate(campaign._id, {
            status: "sent",
            sentCount,
            sentAt: new Date(),
          });
          console.log(`[Newsletter] Broadcast complete: campaign=${campaign._id}, recipients=${emails.length}`);
        }
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        console.error(`[Newsletter] Broadcast crashed unexpectedly: campaign=${campaign._id}`, errMsg);
        await Campaign.findByIdAndUpdate(campaign._id, {
          status: "failed",
          errorMessage: errMsg.substring(0, 500),
        }).catch(() => {});
      }
    });
  } catch (err) { next(err); }
};

// Support POST /broadcast and POST /campaigns
router.post("/broadcast", requireAuth, requireRole("admin"), broadcastHandler);
router.post("/campaigns", requireAuth, requireRole("admin"), broadcastHandler);
router.post("/campaigns/:id/send", requireAuth, requireRole("admin"), broadcastHandler);

// ─────────────────────────────────────────────────────────────────
// ADMIN: POST /newsletter/admin/campaigns/:id/retry
// Retries a failed campaign. Only sends to recipients that haven't received it yet.
// ─────────────────────────────────────────────────────────────────
router.post("/admin/campaigns/:id/retry", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return next(createError("Campaign not found", 404));
    
    if (campaign.status !== "failed") {
      return next(createError("Only failed campaigns can be retried", 400));
    }

    // Determine target audience and fetch emails (similar to broadcast)
    let emails: string[] = [];
    if (campaign.targetAudience === "All") {
      const subs = await Newsletter.find({ status: "subscribed" }).select("email").lean();
      emails = subs.map((s) => s.email);
    } else {
      const subs = await Newsletter.find({ status: "subscribed", "interests.name": campaign.targetAudience }).select("email").lean();
      emails = subs.map((s) => s.email);
    }
    
    // We resume from the last successfully sent count
    const remainingEmails = emails.slice(campaign.sentCount);
    if (remainingEmails.length === 0) {
      // Edge case: all sent but marked failed? Just mark as sent.
      campaign.status = "sent";
      campaign.sentAt = new Date();
      await campaign.save();
      return res.json({ message: "Campaign was already fully sent", campaign });
    }

    campaign.status = "sending";
    campaign.errorMessage = "";
    await campaign.save();

    res.json({
      message: `Retrying campaign for remaining ${remainingEmails.length} subscriber(s). Sending in background.`,
      campaignId: campaign._id.toString(),
      status: "sending"
    });

    setImmediate(async () => {
      try {
        const { sendNewsletterBroadcast, sendCampaignFailureNotification } = await import("../services/email");
        const { sentCount, error } = await sendNewsletterBroadcast(campaign.subject, campaign.htmlBody, remainingEmails);
        
        const newTotalSentCount = campaign.sentCount + sentCount;
        
        if (error) {
          console.error(`[Newsletter] Retry failed: campaign=${campaign._id}, sent=${sentCount}, err=${error}`);
          await Campaign.findByIdAndUpdate(campaign._id, {
            status: "failed",
            sentCount: newTotalSentCount,
            errorMessage: error.substring(0, 500),
          }).catch(() => {});
          
          await sendCampaignFailureNotification({
            subject: campaign.subject,
            sentCount: newTotalSentCount,
            totalCount: campaign.recipientCount,
            errorMessage: error,
          });
        } else {
          await Campaign.findByIdAndUpdate(campaign._id, {
            status: "sent",
            sentCount: newTotalSentCount,
            sentAt: new Date(),
          });
          console.log(`[Newsletter] Retry complete: campaign=${campaign._id}, remaining recipients=${remainingEmails.length}`);
        }
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        console.error(`[Newsletter] Retry crashed unexpectedly: campaign=${campaign._id}`, errMsg);
        await Campaign.findByIdAndUpdate(campaign._id, {
          status: "failed",
          errorMessage: errMsg.substring(0, 500),
        }).catch(() => {});
      }
    });

  } catch (err) { next(err); }
});

export default router;

