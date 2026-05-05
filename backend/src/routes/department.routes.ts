import { Router, Request, Response, NextFunction } from "express";
import Department from "../models/Department";
import { requireAuth } from "../middleware/auth";
import { createError } from "../middleware/errorHandler";
import { logAudit } from "../lib/audit";

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

// PUT /departments/reorder — admin bulk reorder
router.put("/reorder", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids }: { ids: string[] } = req.body;
    if (!ids || !Array.isArray(ids)) return next(createError("Array of IDs required", 400));
    
    const updates = ids.map((id, index) => ({
      updateOne: { filter: { _id: id }, update: { order: index } }
    }));
    await Department.bulkWrite(updates);
    await logAudit(req, "reorder", "department", "", `Reordered ${ids.length} departments`);
    res.json({ message: "Reordered successfully" });
  } catch (err) { next(err); }
});

// DELETE /departments/bulk — admin bulk delete
router.delete("/bulk", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids }: { ids: string[] } = req.body;
    if (!ids?.length) return next(createError("IDs required", 400));
    await Department.deleteMany({ _id: { $in: ids } });
    await logAudit(req, "bulk_delete", "department", "", `${ids.length} departments`);
    res.json({ message: `Deleted ${ids.length} departments` });
  } catch (err) { next(err); }
});

// POST /departments/bulk/import — admin bulk import
router.post("/bulk/import", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) return next(createError("Array of items required", 400));
    
    const result = await Department.insertMany(items);
    await logAudit(req, "bulk_import", "department", "", `Imported ${result.length} departments`);
    res.status(201).json({ message: `Imported ${result.length} departments`, count: result.length });
  } catch (err) { next(err); }
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
