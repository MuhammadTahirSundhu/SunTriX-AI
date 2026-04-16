import { Router, Request, Response, NextFunction } from "express";
import Department from "../models/Department";
import { requireAuth } from "../middleware/auth";
import { createError } from "../middleware/errorHandler";

const router = Router();

// GET /departments — public
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.headers.authorization?.startsWith("Bearer ");
    const filter = isAdmin ? {} : { enabled: true };
    const depts = await Department.find(filter).sort({ order: 1 });
    res.json(depts);
  } catch (err) {
    next(err);
  }
});

// GET /departments/:id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return next(createError("Department not found", 404));
    res.json(dept);
  } catch (err) {
    next(err);
  }
});

// POST /departments — admin
router.post("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json(dept);
  } catch (err) {
    next(err);
  }
});

// PUT /departments/:id — admin
router.put("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dept) return next(createError("Department not found", 404));
    res.json(dept);
  } catch (err) {
    next(err);
  }
});

// DELETE /departments/:id — admin
router.delete("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: "Department deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
