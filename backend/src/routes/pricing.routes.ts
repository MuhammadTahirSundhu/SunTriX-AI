import { Router, Request, Response, NextFunction } from "express";
import Pricing from "../models/Pricing";
import { requireAuth } from "../middleware/auth";
import { createError } from "../middleware/errorHandler";
import { logAudit } from "../lib/audit";

const router = Router();

// GET /pricing — public (enabled only) or admin all
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const all = req.query.all === "true";
    const filter = all ? {} : { enabled: true };
    const plans = await Pricing.find(filter).sort({ order: 1 });
    res.json(plans);
  } catch (err) { next(err); }
});

// POST /pricing — admin
router.post("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plan = await Pricing.create(req.body);
    await logAudit(req, "create", "pricing", plan._id.toString(), plan.planName);
    res.status(201).json(plan);
  } catch (err) { next(err); }
});

// PUT /pricing/:id — admin
router.put("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plan = await Pricing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) return next(createError("Pricing plan not found", 404));
    await logAudit(req, "update", "pricing", plan._id.toString(), plan.planName);
    res.json(plan);
  } catch (err) { next(err); }
});

// DELETE /pricing/:id — admin
router.delete("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plan = await Pricing.findByIdAndDelete(req.params.id);
    if (!plan) return next(createError("Pricing plan not found", 404));
    await logAudit(req, "delete", "pricing", req.params.id, plan.planName);
    res.json({ message: "Pricing plan deleted" });
  } catch (err) { next(err); }
});

export default router;
