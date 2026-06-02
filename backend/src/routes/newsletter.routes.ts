import { Router, Request, Response, NextFunction } from "express";
import Newsletter from "../models/Newsletter";
import Campaign from "../models/Campaign";
import { requireAuth } from "../middleware/auth";
import { createError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { getSetting } from "../lib/configLoader";

const router = Router();

// POST /newsletter — public subscribe
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, interest } = req.body;
    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !interest) {
      return next(createError("Name, valid email, and interest are required", 400));
    }
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
    // When double opt-in is enabled, create subscriber as unconfirmed (subscribed=false)
    // until they click a confirmation email. For now we create pending and note in response.
    await Newsletter.create({ name, email, interest, subscribed: !doubleOptIn });

    if (doubleOptIn) {
      res.status(201).json({
        message: "Please check your email to confirm your subscription.",
        requiresConfirmation: true,
      });
    } else {
      res.status(201).json({ message: "Subscribed successfully" });
    }
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
    const campaigns = await Campaign.find().sort({ sentAt: -1 }).limit(50);
    res.json(campaigns);
  } catch (err) { next(err); }
});

// POST /newsletter/broadcast — admin send campaign
router.post("/broadcast", requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { subject, body, targetAudience } = req.body;
    if (!subject || !body) return next(createError("Subject and body are required", 400));

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

    const { sendNewsletterBroadcast } = await import("../services/email");
    await sendNewsletterBroadcast(subject, finalBody, emails);

    // Save campaign to history
    await Campaign.create({
      subject,
      htmlBody: finalBody,
      targetAudience: targetAudience || "All",
      recipientCount: emails.length,
      adminId: req.user?.id || "unknown",
      adminName: req.user?.name || "Admin",
      sentAt: new Date(),
    });

    res.json({ message: `Newsletter broadcast to ${emails.length} subscribers`, recipientCount: emails.length });
  } catch (err) { next(err); }
});

export default router;
