import { Router, Request, Response, NextFunction } from "express";
import AuditLog from "../models/AuditLog";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /audit — admin only, paginated
router.get("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { entity, action, limit = 50, skip = 0 } = req.query;
    const filter: Record<string, unknown> = {};
    if (entity) filter.entity = entity;
    if (action) filter.action = action;

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await AuditLog.countDocuments(filter);
    res.json({ logs, total });
  } catch (err) { next(err); }
});

export default router;
