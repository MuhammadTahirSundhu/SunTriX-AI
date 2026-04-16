import { Router, Request, Response, NextFunction } from "express";
import TaskRequest from "../models/TaskRequest";
import { requireAuth } from "../middleware/auth";
import { createError } from "../middleware/errorHandler";
import { sendTaskNotification } from "../services/email";

const router = Router();

// POST /task-requests — public (form submission)
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, service, description } = req.body;
    if (!name || !email || !service || !description) {
      return next(createError("Name, email, service, and description are required", 400));
    }

    const task = await TaskRequest.create(req.body);

    // Send admin notification (non-blocking)
    sendTaskNotification({
      name: task.name,
      email: task.email,
      company: task.company,
      service: task.service,
      budget: task.budget,
      priority: task.priority,
      projectTitle: task.projectTitle,
      description: task.description,
    }).catch(console.error);

    res.status(201).json({ message: "Task request submitted successfully", id: task._id });
  } catch (err) {
    next(err);
  }
});

// GET /task-requests — admin only
router.get("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, limit = 100, skip = 0 } = req.query;
    const filter = status ? { status } : {};
    const tasks = await TaskRequest.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));
    const total = await TaskRequest.countDocuments(filter);
    res.json({ tasks, total });
  } catch (err) {
    next(err);
  }
});

// GET /task-requests/:id — admin only
router.get("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await TaskRequest.findById(req.params.id);
    if (!task) return next(createError("Task not found", 404));
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// PUT /task-requests/:id — admin only (update status, notes, etc.)
router.put("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await TaskRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return next(createError("Task not found", 404));
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// DELETE /task-requests/:id — admin only
router.delete("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await TaskRequest.findByIdAndDelete(req.params.id);
    if (!task) return next(createError("Task not found", 404));
    res.json({ message: "Task deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
