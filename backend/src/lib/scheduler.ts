import cron from "node-cron";
import Post from "../models/Post";
import Portfolio from "../models/Portfolio";

export function startScheduler(): void {
  // Run every 5 minutes — auto-publish scheduled content
  cron.schedule("*/5 * * * *", async () => {
    const now = new Date();
    try {
      // Auto-publish scheduled blog posts
      const postsResult = await Post.updateMany(
        { status: "scheduled", publishAt: { $lte: now } },
        { status: "published", publishedAt: now }
      );
      if (postsResult.modifiedCount > 0) {
        console.log(`[Scheduler] Auto-published ${postsResult.modifiedCount} blog post(s)`);
      }

      // Auto-publish scheduled portfolio items
      const portfolioResult = await Portfolio.updateMany(
        { status: "draft", publishAt: { $lte: now } },
        { status: "published" }
      );
      if (portfolioResult.modifiedCount > 0) {
        console.log(`[Scheduler] Auto-published ${portfolioResult.modifiedCount} portfolio item(s)`);
      }
    } catch (err) {
      console.error("[Scheduler] Error during auto-publish:", err);
    }
  });

  console.log("[Scheduler] Auto-publish cron job started (every 5 minutes)");
}
