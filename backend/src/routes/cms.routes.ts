import { Router, Request, Response, NextFunction } from "express";
import CmsContent from "../models/CmsContent";
import { requireAuth } from "../middleware/auth";

const router = Router();

const DEFAULT_CONTENT: Record<string, unknown> = {};

async function getOrCreate(key: string, defaultData: unknown = DEFAULT_CONTENT) {
  let doc = await CmsContent.findOne({ key });
  if (!doc) {
    doc = await CmsContent.create({ key, data: defaultData });
  }
  return doc;
}

// GET /cms/hero
router.get("/hero", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await getOrCreate("hero", {
      badge: "Accepting new AI & SaaS project briefs",
      headline: ["Engineering", "Intelligence That", "Perceives, Reasons,", "and Acts"],
      gradientWords: ["Intelligence", "Acts"],
      subheadline: "From agentic AI workflows to production-grade SaaS platforms — SunTriX delivers end-to-end AI engineering with a 24-hour proposal guarantee.",
      ctaPrimary: { text: "Request a Demo", link: "/request-task" },
      ctaSecondary: { text: "Watch Overview", link: "#" },
      trustPills: ["50+ Projects Delivered", "Fortune 500 Clients", "24hr Response SLA"],
      backgroundImage: "",
      enabled: true,
    });
    res.json(doc.data);
  } catch (err) {
    next(err);
  }
});

// PUT /cms/hero — admin
router.put("/hero", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await CmsContent.findOneAndUpdate(
      { key: "hero" },
      { data: req.body },
      { new: true, upsert: true }
    );
    res.json(doc!.data);
  } catch (err) {
    next(err);
  }
});

// GET /cms/announcement
router.get("/announcement", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await getOrCreate("announcement", {
      text: "🚀 Now accepting AI project briefs — 24hr proposal guarantee",
      link: "/request-task",
      linkText: "Submit Brief →",
      enabled: true,
      bgColor: "primary",
    });
    res.json(doc.data);
  } catch (err) {
    next(err);
  }
});

// PUT /cms/announcement — admin
router.put("/announcement", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await CmsContent.findOneAndUpdate(
      { key: "announcement" },
      { data: req.body },
      { new: true, upsert: true }
    );
    res.json(doc!.data);
  } catch (err) {
    next(err);
  }
});

// GET /cms/company
router.get("/company", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await getOrCreate("company", {
      name: "SunTriX",
      tagline: "Engineering Intelligence That Perceives, Reasons, and Acts",
      description: "Your AI-first technology partner delivering end-to-end AI engineering.",
      email: "hello@suntrix.com",
      phone: "+1 (555) 123-4567",
      address: "San Francisco, CA",
      socialLinks: [],
      logo: "",
      introVideoUrl: "",
      introVideoEnabled: false,
    });
    res.json(doc.data);
  } catch (err) {
    next(err);
  }
});

// PUT /cms/company — admin
router.put("/company", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await CmsContent.findOneAndUpdate(
      { key: "company" },
      { data: req.body },
      { new: true, upsert: true }
    );
    res.json(doc!.data);
  } catch (err) {
    next(err);
  }
});

// GET /cms/seo/:page
router.get("/seo/:page", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = `seo_${req.params.page}`;
    const doc = await getOrCreate(key, {
      page: req.params.page,
      title: "SunTriX — AI Engineering Agency",
      description: "Engineering Intelligence That Perceives, Reasons, and Acts.",
      keywords: "AI, machine learning, agentic AI, computer vision, SaaS",
      ogImage: "",
    });
    res.json(doc.data);
  } catch (err) {
    next(err);
  }
});

// PUT /cms/seo/:page — admin
router.put("/seo/:page", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = `seo_${req.params.page}`;
    const doc = await CmsContent.findOneAndUpdate(
      { key },
      { data: { ...req.body, page: req.params.page } },
      { new: true, upsert: true }
    );
    res.json(doc!.data);
  } catch (err) {
    next(err);
  }
});

// Generic GET /cms/content — return all CMS docs (admin)
router.get("/content", requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const docs = await CmsContent.find().sort({ key: 1 });
    res.json(docs);
  } catch (err) {
    next(err);
  }
});

// GET /cms/social-links
router.get("/social-links", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await getOrCreate("social-links", {
      links: [
        { platform: "LinkedIn", url: "#", enabled: true },
        { platform: "Twitter", url: "#", enabled: true },
        { platform: "GitHub", url: "#", enabled: true },
        { platform: "Upwork", url: "#", enabled: true },
        { platform: "Fiverr", url: "#", enabled: true },
        { platform: "YouTube", url: "#", enabled: false },
        { platform: "Instagram", url: "#", enabled: false },
      ],
    });
    res.json(doc.data);
  } catch (err) {
    next(err);
  }
});

// PUT /cms/social-links — admin
router.put("/social-links", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await CmsContent.findOneAndUpdate(
      { key: "social-links" },
      { data: req.body },
      { new: true, upsert: true }
    );
    res.json(doc!.data);
  } catch (err) {
    next(err);
  }
});

// GET/PUT /cms/intro-video
router.get("/intro-video", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await getOrCreate("intro-video", { url: "", enabled: false });
    res.json(doc.data);
  } catch (err) {
    next(err);
  }
});

router.put("/intro-video", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await CmsContent.findOneAndUpdate(
      { key: "intro-video" },
      { data: req.body },
      { new: true, upsert: true }
    );
    res.json(doc!.data);
  } catch (err) {
    next(err);
  }
});

export default router;
