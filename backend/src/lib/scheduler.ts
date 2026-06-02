import cron from "node-cron";
import Post from "../models/Post";
import Portfolio from "../models/Portfolio";
import AuditLog from "../models/AuditLog";
import { getSetting } from "./configLoader";

export function startScheduler(): void {
  // ── Every 5 minutes: auto-publish scheduled content ────────────
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

  // ── Daily at 2:00 AM: audit log retention cleanup ──────────────
  cron.schedule("0 2 * * *", async () => {
    try {
      const retentionDays = parseInt(getSetting("AUDIT_LOG_RETENTION_DAYS", "90"));
      if (retentionDays <= 0) return; // 0 means keep forever
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      const result = await AuditLog.deleteMany({ createdAt: { $lt: cutoffDate } });
      if (result.deletedCount > 0) {
        console.log(`[Scheduler] Pruned ${result.deletedCount} audit log entries older than ${retentionDays} days`);
      }
    } catch (err) {
      console.error("[Scheduler] Error during audit log cleanup:", err);
    }
  });

  console.log("[Scheduler] Jobs started: auto-publish (*/5 min), audit cleanup (daily 2am)");
}

