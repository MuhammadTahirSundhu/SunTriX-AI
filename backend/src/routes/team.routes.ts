import { Router, Request, Response, NextFunction } from "express";
import Team from "../models/Team";
import { requireAuth } from "../middleware/auth";
import { createError } from "../middleware/errorHandler";
import { logAudit } from "../lib/audit";

const router = Router();

// GET /team — public (visible only)
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const all = req.query.all === "true";
    const filter = all ? {} : { visible: true };
    const members = await Team.find(filter).sort({ order: 1, createdAt: 1 });
    res.json(members);
  } catch (err) { next(err); }
});

// GET /team/:id — admin
router.get("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const member = await Team.findById(req.params.id);
    if (!member) return next(createError("Team member not found", 404));
    res.json(member);
  } catch (err) { next(err); }
});

// POST /team — admin
router.post("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const member = await Team.create(req.body);
    await logAudit(req, "create", "team", member._id.toString(), member.name);
    res.status(201).json(member);
  } catch (err) { next(err); }
});

// PUT /team/:id — admin
router.put("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const member = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!member) return next(createError("Team member not found", 404));
    await logAudit(req, "update", "team", member._id.toString(), member.name);
    res.json(member);
  } catch (err) { next(err); }
});

// DELETE /team/:id — admin
router.delete("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const member = await Team.findByIdAndDelete(req.params.id);
    if (!member) return next(createError("Team member not found", 404));
    await logAudit(req, "delete", "team", req.params.id, member.name);
    res.json({ message: "Team member deleted" });
  } catch (err) { next(err); }
});

export default router;
