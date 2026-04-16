import { Router, Request, Response, NextFunction } from "express";
import ContactMessage from "../models/ContactMessage";
import { requireAuth } from "../middleware/auth";
import { createError } from "../middleware/errorHandler";
import { sendContactNotification } from "../services/email";

const router = Router();

// POST /contact — public
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return next(createError("Name, email, and message are required", 400));
    }

    const msg = await ContactMessage.create({
      name,
      email,
      company: req.body.company || "",
      subject: req.body.subject || "Website Contact",
      message,
    });

    sendContactNotification({
      name: msg.name,
      email: msg.email,
      company: msg.company,
      subject: msg.subject,
      message: msg.message,
    }).catch(console.error);

    res.status(201).json({ message: "Message sent successfully" });
  } catch (err) {
    next(err);
  }
});

// GET /contact — admin
router.get("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = req.query.unread === "true" ? { read: false } : {};
    const messages = await ContactMessage.find(filter).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    next(err);
  }
});

// PUT /contact/:id/read — admin
router.put("/:id/read", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!msg) return next(createError("Message not found", 404));
    res.json(msg);
  } catch (err) {
    next(err);
  }
});

// DELETE /contact/:id — admin
router.delete("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const msg = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!msg) return next(createError("Message not found", 404));
    res.json({ message: "Message deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
