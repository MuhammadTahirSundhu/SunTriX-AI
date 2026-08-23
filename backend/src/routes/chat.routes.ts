import { Router, Request, Response, NextFunction } from "express";
import { groqAdapter } from "../integrations/groq/groq.adapter";
import { boundChatContext } from "../services/groq";

const router = Router();

const MAX_MESSAGE_LENGTH = 5000;
const MAX_MESSAGES = 50;

// POST /chat — public AI chat assistant
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { messages } = req.body as { messages: Array<{ role: "user" | "assistant"; content: string }> };

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "messages array is required" });
      return;
    }

    const recentMessages = messages.slice(-MAX_MESSAGES);
    const validRoles = ["user", "assistant"];
    const valid = recentMessages.every(
      (m) => m && typeof m.content === "string" && validRoles.includes(m.role) && m.content.length <= MAX_MESSAGE_LENGTH
    );

    if (!valid) {
      res.status(400).json({ error: `Invalid message format or message content exceeds ${MAX_MESSAGE_LENGTH} characters` });
      return;
    }

    const bounded = boundChatContext(recentMessages);
    const systemPrompt = "You are SunTriX AI Assistant, an elite software engineering and AI solutions consultant.";
    
    let content = "";
    try {
      content = await groqAdapter.generateChatCompletion({
        systemPrompt,
        messages: bounded.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      });
    } catch (err: any) {
      console.error("Groq AI Error in chat route:", err.message || err);
      content = "The AI assistant is currently unavailable. Please try again shortly or contact support.";
    }

    res.json({
      choices: [{ message: { role: "assistant", content } }],
      usage: {},
    });
  } catch (err) {
    next(err);
  }
});

export default router;
