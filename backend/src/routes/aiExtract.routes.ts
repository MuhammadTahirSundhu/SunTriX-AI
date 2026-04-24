import { Router, Request, Response, NextFunction } from "express";
import { requireAuth } from "../middleware/auth";
import { extractFields } from "../services/groq";

const router = Router();

// POST /v1/ai/extract — admin-only
router.post(
  "/extract",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { module, text } = req.body as { module: string; text: string };

      if (!module || !text?.trim()) {
        res.status(400).json({ error: "module and text are required" });
        return;
      }

      const fields = await extractFields(module, text.trim());
      res.json({ fields });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
