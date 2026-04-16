import { Router, Request, Response, NextFunction } from "express";
import Portfolio from "../models/Portfolio";
import { requireAuth } from "../middleware/auth";
import { createError } from "../middleware/errorHandler";
import slugify from "slugify";

const router = Router();

// GET /portfolio  — public, lists published; admin sees all
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.headers.authorization?.startsWith("Bearer ");
    const filter = isAdmin ? {} : { status: "published" };
    const projects = await Portfolio.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

// GET /portfolio/slug/:slug  — public
router.get("/slug/:slug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Portfolio.findOne({ slug: req.params.slug });
    if (!project) return next(createError("Project not found", 404));
    res.json(project);
  } catch (err) {
    next(err);
  }
});

// GET /portfolio/:id  — public
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Portfolio.findById(req.params.id);
    if (!project) return next(createError("Project not found", 404));
    res.json(project);
  } catch (err) {
    next(err);
  }
});

// POST /portfolio  — admin only
router.post("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    if (!body.slug) {
      body.slug = slugify(body.title || "untitled", { lower: true, strict: true });
    }
    const project = await Portfolio.create(body);
    res.status(201).json(project);
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) return next(createError("Slug must be unique", 409));
    next(err);
  }
});

// PUT /portfolio/:id  — admin only
router.put("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Portfolio.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!project) return next(createError("Project not found", 404));
    res.json(project);
  } catch (err) {
    next(err);
  }
});

// DELETE /portfolio/:id  — admin only
router.delete("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Portfolio.findByIdAndDelete(req.params.id);
    if (!project) return next(createError("Project not found", 404));
    res.json({ message: "Project deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
