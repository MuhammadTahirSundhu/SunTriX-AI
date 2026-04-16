import { Router, Request, Response, NextFunction } from "express";
import { sendChat, ChatMessage } from "../services/groq";

const router = Router();

// POST /chat — public
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { messages } = req.body as { messages: ChatMessage[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "messages array is required" });
      return;
    }

    // Validate message format
    const validRoles = ["user", "assistant"];
    const valid = messages.every(
      (m) => m && typeof m.content === "string" && validRoles.includes(m.role)
    );
    if (!valid) {
      res.status(400).json({ error: "Invalid message format" });
      return;
    }

    // Limit context window
    const contextMessages = messages.slice(-20);
    const content = await sendChat(contextMessages);

    // Return OpenAI-compatible response shape (matches frontend expectations)
    res.json({
      choices: [{ message: { role: "assistant", content } }],
      usage: {},
    });
  } catch (err) {
    next(err);
  }
});

export default router;
