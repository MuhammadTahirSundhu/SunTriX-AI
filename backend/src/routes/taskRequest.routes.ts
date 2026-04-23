import { Router, Request, Response, NextFunction } from "express";
import TaskRequest from "../models/TaskRequest";
import { requireAuth } from "../middleware/auth";
import { createError } from "../middleware/errorHandler";
import { sendTaskNotification } from "../services/email";
import { logAudit } from "../lib/audit";
import crypto from "crypto";

const router = Router();

// POST /task-requests — public (form submission)
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, service, description } = req.body;
    if (!name || !email || !service || !description) {
      return next(createError("Name, email, service, and description are required", 400));
    }
    const trackingToken = crypto.randomBytes(20).toString("hex");
    const task = await TaskRequest.create({ ...req.body, trackingToken });

    sendTaskNotification({
      name: task.name, email: task.email, company: task.company,
      service: task.service, budget: task.budget, priority: task.priority,
      projectTitle: task.projectTitle, description: task.description,
    }).catch(console.error);

    res.status(201).json({ message: "Task request submitted successfully", id: task._id, trackingToken });
  } catch (err) { next(err); }
});

// GET /task-requests/track/:token — PUBLIC client portal
router.get("/track/:token", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await TaskRequest.findOne({ trackingToken: req.params.token })
      .select("name projectTitle service status statusHistory createdAt updatedAt");
    if (!task) return next(createError("Request not found", 404));
    res.json(task);
  } catch (err) { next(err); }
});

// GET /task-requests — admin only
router.get("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, limit = 100, skip = 0 } = req.query;
    const filter = status ? { status } : {};
    const tasks = await TaskRequest.find(filter).sort({ createdAt: -1 }).limit(Number(limit)).skip(Number(skip));
    const total = await TaskRequest.countDocuments(filter);
    res.json({ tasks, total });
  } catch (err) { next(err); }
});

// GET /task-requests/:id — admin only
router.get("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await TaskRequest.findById(req.params.id);
    if (!task) return next(createError("Task not found", 404));
    res.json(task);
  } catch (err) { next(err); }
});

// PUT /task-requests/:id/status — admin status update
router.put("/:id/status", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, note } = req.body;
    const task = await TaskRequest.findById(req.params.id);
    if (!task) return next(createError("Task not found", 404));
    const oldStatus = task.status;
    task.status = status;
    if (!Array.isArray((task as any).statusHistory)) (task as any).statusHistory = [];
    (task as any).statusHistory.push({ status, note: note || "", updatedAt: new Date() });
    await task.save();
    await logAudit(req, "status_change", "task", task._id.toString(), task.projectTitle || task.name, { oldStatus, newStatus: status });
    res.json(task);
  } catch (err) { next(err); }
});

// PUT /task-requests/:id — admin general update
router.put("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await TaskRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return next(createError("Task not found", 404));
    await logAudit(req, "update", "task", task._id.toString(), task.projectTitle || task.name);
    res.json(task);
  } catch (err) { next(err); }
});

// DELETE /task-requests/:id — admin
router.delete("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await TaskRequest.findByIdAndDelete(req.params.id);
    if (!task) return next(createError("Task not found", 404));
    await logAudit(req, "delete", "task", req.params.id, task.projectTitle || task.name);
    res.json({ message: "Task deleted" });
  } catch (err) { next(err); }
});

// DELETE /task-requests/bulk — bulk delete
router.delete("/bulk", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids }: { ids: string[] } = req.body;
    if (!ids?.length) return next(createError("IDs required", 400));
    await TaskRequest.deleteMany({ _id: { $in: ids } });
    await logAudit(req, "bulk_delete", "task", "", `${ids.length} tasks`);
    res.json({ message: `Deleted ${ids.length} tasks` });
  } catch (err) { next(err); }
});

export default router;
