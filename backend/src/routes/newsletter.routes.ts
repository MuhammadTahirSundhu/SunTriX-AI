import { Router, Request, Response, NextFunction } from "express";
import Newsletter from "../models/Newsletter";
import { requireAuth } from "../middleware/auth";
import { createError } from "../middleware/errorHandler";

const router = Router();

// POST /newsletter — public
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

    await Newsletter.create({ name, email, interest });
    res.status(201).json({ message: "Subscribed successfully" });
  } catch (err) {
    next(err);
  }
});

// GET /newsletter — admin
router.get("/", requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const subscribers = await Newsletter.find({ subscribed: true }).sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (err) {
    next(err);
  }
});

// DELETE /newsletter/:id — admin (unsubscribe/remove)
router.delete("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Newsletter.findByIdAndDelete(req.params.id);
    res.json({ message: "Subscriber removed" });
  } catch (err) {
    next(err);
  }
});

// POST /newsletter/generate-template — admin AI template generation
router.post("/generate-template", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return next(createError("Prompt is required", 400));
    }
    
    const { generateEmailTemplate } = await import("../services/groq");
    const htmlCode = await generateEmailTemplate(prompt);
    
    res.json({ html: htmlCode });
  } catch (err) {
    next(err);
  }
});

// POST /newsletter/broadcast — admin send campaign
router.post("/broadcast", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subject, body, targetAudience } = req.body;
    if (!subject || !body) {
      return next(createError("Subject and body are required", 400));
    }
    
    // Filter query: either all subscribed, or specifically targeted by interest
    const query: any = { subscribed: true };
    if (targetAudience && targetAudience !== "All") {
      query.interest = targetAudience;
    }

    const subscribers = await Newsletter.find(query).select("email");
    const emails = subscribers.map(sub => sub.email);
    
    if (emails.length === 0) {
      return next(createError("No active subscribers found for this audience", 400));
    }
    
    const { sendNewsletterBroadcast } = await import("../services/email");
    await sendNewsletterBroadcast(subject, body, emails);
    
    res.json({ message: `Newsletter broadcasted to ${emails.length} subscribers` });
  } catch (err) {
    next(err);
  }
});

export default router;
