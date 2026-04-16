import { Router, Request, Response, NextFunction } from "express";
import TaskRequest from "../models/TaskRequest";
import ContactMessage from "../models/ContactMessage";
import Portfolio from "../models/Portfolio";
import Testimonial from "../models/Testimonial";
import Newsletter from "../models/Newsletter";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /admin/stats — dashboard overview
router.get("/stats", requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalTasks,
      pendingTasks,
      completedTasks,
      totalContacts,
      unreadContacts,
      totalPortfolio,
      publishedPortfolio,
      totalTestimonials,
      totalSubscribers,
    ] = await Promise.all([
      TaskRequest.countDocuments(),
      TaskRequest.countDocuments({ status: { $in: ["new", "in_review"] } }),
      TaskRequest.countDocuments({ status: "completed" }),
      ContactMessage.countDocuments(),
      ContactMessage.countDocuments({ read: false }),
      Portfolio.countDocuments(),
      Portfolio.countDocuments({ status: "published" }),
      Testimonial.countDocuments(),
      Newsletter.countDocuments({ subscribed: true }),
    ]);

    const revenue = completedTasks * 15000; // Estimated avg project value

    res.json({
      totalTasks,
      pendingTasks,
      completedTasks,
      totalContacts,
      unreadContacts,
      totalPortfolio,
      publishedPortfolio,
      totalTestimonials,
      totalSubscribers,
      revenue,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
