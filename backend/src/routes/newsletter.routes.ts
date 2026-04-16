import { Router, Request, Response, NextFunction } from "express";
import Newsletter from "../models/Newsletter";
import { requireAuth } from "../middleware/auth";
import { createError } from "../middleware/errorHandler";

const router = Router();

// POST /newsletter — public
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return next(createError("Valid email is required", 400));
    }

    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (!existing.subscribed) {
        existing.subscribed = true;
        await existing.save();
        return res.json({ message: "Re-subscribed successfully" });
      }
      return res.json({ message: "Already subscribed" });
    }

    await Newsletter.create({ email });
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

export default router;
