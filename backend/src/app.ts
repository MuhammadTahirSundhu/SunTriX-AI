import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import { connectDB } from "./config/db";
import { errorHandler } from "./middleware/errorHandler";

// Route imports
import authRoutes from "./routes/auth.routes";
import portfolioRoutes from "./routes/portfolio.routes";
import caseStudyRoutes from "./routes/caseStudy.routes";
import testimonialRoutes from "./routes/testimonial.routes";
import taskRequestRoutes from "./routes/taskRequest.routes";
import contactRoutes from "./routes/contact.routes";
import newsletterRoutes from "./routes/newsletter.routes";
import chatRoutes from "./routes/chat.routes";
import cmsRoutes from "./routes/cms.routes";
import departmentRoutes from "./routes/department.routes";
import uploadRoutes from "./routes/upload.routes";
import adminRoutes from "./routes/admin.routes";
import teamRoutes from "./routes/team.routes";
import clientRoutes from "./routes/client.routes";
import pricingRoutes from "./routes/pricing.routes";
import postRoutes from "./routes/post.routes";
import auditRoutes from "./routes/audit.routes";
import aiExtractRoutes from "./routes/aiExtract.routes";
import { startScheduler } from "./lib/scheduler";

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Security ────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// ─── CORS ────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ─── Rate Limiting ────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: { error: "Too many submissions, please try again later." },
  skip: (req) => req.method !== "POST",
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 30,
  message: { error: "Chat rate limit exceeded, please wait." },
});

app.use(globalLimiter);

// ─── Body Parsing ────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── NoSQL Injection Protection ──────────────────────────────────
// Strips keys containing $ or . from req.body, req.params, req.query
app.use(mongoSanitize({ replaceWith: "_" }));

// ─── Logging ─────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// ─── Health Check ─────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// ─── API Routes ──────────────────────────────────────────────────
const V1 = "/v1";

app.use(`${V1}/auth`, authRoutes);
app.use(`${V1}/portfolio`, portfolioRoutes);
app.use(`${V1}/case-studies`, caseStudyRoutes);
app.use(`${V1}/testimonials`, testimonialRoutes);
app.use(`${V1}/task-requests`, formLimiter, taskRequestRoutes);
app.use(`${V1}/contact`, formLimiter, contactRoutes);
app.use(`${V1}/newsletter`, formLimiter, newsletterRoutes);
app.use(`${V1}/chat`, chatLimiter, chatRoutes);
app.use(`${V1}/cms`, cmsRoutes);
app.use(`${V1}/departments`, departmentRoutes);
app.use(`${V1}/upload`, uploadRoutes);
app.use(`${V1}/admin`, adminRoutes);
app.use(`${V1}/team`, teamRoutes);
app.use(`${V1}/clients`, clientRoutes);
app.use(`${V1}/pricing`, pricingRoutes);
app.use(`${V1}/posts`, postRoutes);
app.use(`${V1}/audit`, auditRoutes);
app.use(`${V1}/ai`, aiExtractRoutes);

// ─── 404 ──────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Error Handler ────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────
async function start() {
  await connectDB();
  startScheduler();
  app.listen(PORT, () => {
    console.log(`\n🚀 SunTriX API running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   Env:    ${process.env.NODE_ENV}\n`);
  });
}

start().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});

export default app;
