/**
 * Database Seed Script
 * 
 * Populates MongoDB with initial data:
 * - Admin user (bcrypt hashed password)
 * - Service departments
 * - Portfolio projects
 * - Testimonials
 * 
 * Run: npm run seed (from backend/ directory)
 */
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import Admin from "./models/Admin";
import Department from "./models/Department";
import Portfolio from "./models/Portfolio";
import Testimonial from "./models/Testimonial";

async function seed() {
  await connectDB();
  console.log("\n🌱 Starting database seed...\n");

  // ─── Admin User ──────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_SEED_EMAIL || "admin@suntrix.com";
  const existingAdmin = await Admin.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await Admin.create({
      email: adminEmail,
      password: process.env.ADMIN_SEED_PASSWORD || "admin123",
      name: process.env.ADMIN_SEED_NAME || "Admin",
      role: "admin",
    });
    console.log(`✅ Admin created: ${adminEmail}`);
  } else {
    console.log(`⏭️  Admin already exists: ${adminEmail}`);
  }

  // ─── Departments ─────────────────────────────────────────────
  const deptCount = await Department.countDocuments();
  if (deptCount === 0) {
    await Department.insertMany([
      { name: "SunTriX Agents", subtitle: "Agentic AI & Automation", description: "Deploy autonomous agents that reason, plan, and execute complex tasks — from customer support to multi-agent orchestration.", image: "", href: "/services/agentic-ai", order: 1, enabled: true },
      { name: "SunTriX Intelligence", subtitle: "AI & Machine Learning", description: "Custom models, predictive analytics, NLP, recommendation systems, and full MLOps lifecycle management.", image: "", href: "/services/ai-ml", order: 2, enabled: true },
      { name: "SunTriX Vision", subtitle: "Computer Vision", description: "Object detection, image classification, video analytics, OCR, anomaly detection with real-time edge inference.", image: "", href: "/services/computer-vision", order: 3, enabled: true },
      { name: "SunTriX Platform", subtitle: "AI Product & SaaS Development", description: "End-to-end SaaS platform engineering with multi-tenant architecture, API-first design, embedded AI, and scalable cloud infrastructure.", image: "", href: "/services/saas-platform", order: 4, enabled: true },
    ]);
    console.log("✅ Departments seeded (4 items)");
  } else {
    console.log(`⏭️  Departments already exist (${deptCount})`);
  }

  // ─── Portfolio Projects ───────────────────────────────────────
  const portfolioCount = await Portfolio.countDocuments();
  if (portfolioCount === 0) {
    await Portfolio.insertMany([
      { title: "AI-Powered Document Processing", slug: "ai-document-processing", category: "Agentic AI", description: "Built an autonomous document processing pipeline for a Fortune 500 financial services company. The system uses multi-agent orchestration to classify, extract, validate, and route 50,000+ documents daily with 99.2% accuracy.", shortDescription: "Autonomous pipeline for Fortune 500 company processing 50,000+ documents daily.", metric: "10x", metricLabel: "Faster Processing", coverImage: "", thumbnailImage: "", images: [], videoUrl: "", tags: ["LangChain", "Python", "AWS", "OpenAI"], tools: [{ name: "LangChain", icon: "🔗" }, { name: "Python", icon: "🐍" }, { name: "AWS", icon: "☁️" }], clientLogo: "", clientName: "Fortune 500 Financial Corp", industry: "Financial Services", highlights: ["99.2% accuracy rate", "50K+ daily documents", "60% cost reduction", "Multi-agent orchestration"], status: "published", featured: true, order: 1 },
      { title: "Predictive Maintenance Platform", slug: "predictive-maintenance", category: "AI & ML", description: "Developed a machine learning platform that predicts equipment failures 72 hours in advance with 97.3% accuracy, reducing unplanned downtime by 60% across 12 manufacturing facilities.", shortDescription: "ML-driven maintenance prediction system reducing downtime by 60% in manufacturing.", metric: "97.3%", metricLabel: "Prediction Accuracy", coverImage: "", thumbnailImage: "", images: [], videoUrl: "", tags: ["PyTorch", "MLflow", "Docker", "TimescaleDB"], tools: [{ name: "PyTorch", icon: "🔥" }, { name: "MLflow", icon: "📊" }, { name: "Docker", icon: "🐳" }], clientLogo: "", clientName: "IndustrialTech Corp", industry: "Manufacturing", highlights: ["72-hour advance prediction", "97.3% accuracy", "60% downtime reduction", "12 facilities deployed"], status: "published", featured: true, order: 2 },
      { title: "Quality Inspection System", slug: "quality-inspection", category: "Computer Vision", description: "Automated PCB defect detection system using custom-trained YOLO models with real-time inference on the production line. Achieved 94% improvement in defect detection with sub-100ms inference time.", shortDescription: "Automated PCB defect detection with real-time inference on the production line.", metric: "94%", metricLabel: "Detection Improvement", coverImage: "", thumbnailImage: "", images: [], videoUrl: "", tags: ["YOLO", "OpenCV", "NVIDIA", "TensorRT"], tools: [{ name: "YOLO", icon: "👁️" }, { name: "OpenCV", icon: "📷" }, { name: "NVIDIA", icon: "💚" }], clientLogo: "", clientName: "VisionTech Industries", industry: "Electronics Manufacturing", highlights: ["Sub-100ms inference", "94% improvement", "Real-time edge deployment", "Custom YOLO model"], status: "published", featured: false, order: 3 },
      { title: "Analytics SaaS Platform", slug: "analytics-saas", category: "SaaS Platform", description: "Full-stack analytics platform built from zero to 5,000 paying users in 8 months. Features embedded ML models for predictive analytics, real-time dashboards, and multi-tenant architecture.", shortDescription: "Full-stack analytics platform from 0 to 5,000 users with embedded ML models.", metric: "$2M", metricLabel: "Annual Revenue", coverImage: "", thumbnailImage: "", images: [], videoUrl: "", tags: ["Next.js", "PostgreSQL", "Stripe", "Redis"], tools: [{ name: "Next.js", icon: "⚡" }, { name: "PostgreSQL", icon: "🐘" }, { name: "Stripe", icon: "💳" }], clientLogo: "", clientName: "DataInsight Inc", industry: "SaaS / Analytics", highlights: ["5,000 paying users", "$2M ARR in 8 months", "Multi-tenant architecture", "Embedded ML models"], status: "published", featured: true, order: 4 },
      { title: "Multi-Agent Customer Service", slug: "multi-agent-support", category: "Agentic AI", description: "AI agents handling tier-1 support with intelligent escalation, context retention across conversations, and continuous learning from resolved tickets.", shortDescription: "AI agents handling tier-1 support with intelligent escalation and learning.", metric: "85%", metricLabel: "Auto-Resolution Rate", coverImage: "", thumbnailImage: "", images: [], videoUrl: "", tags: ["AutoGen", "OpenAI", "Redis", "Node.js"], tools: [{ name: "AutoGen", icon: "🤖" }, { name: "OpenAI", icon: "🧠" }, { name: "Redis", icon: "🔴" }], clientLogo: "", clientName: "SupportFlow", industry: "Customer Service", highlights: ["85% auto-resolution", "3x faster response", "Intelligent escalation", "Continuous learning"], status: "published", featured: false, order: 5 },
      { title: "Real-time Video Surveillance", slug: "video-surveillance", category: "Computer Vision", description: "City-scale video analytics for traffic management and public safety. Processing 500+ camera feeds with real-time object detection, tracking, and anomaly alerts.", shortDescription: "City-scale video analytics for traffic management and public safety.", metric: "99.1%", metricLabel: "Detection Rate", coverImage: "", thumbnailImage: "", images: [], videoUrl: "", tags: ["TensorFlow", "Triton", "Kubernetes", "RTSP"], tools: [{ name: "TensorFlow", icon: "🧮" }, { name: "Triton", icon: "🚀" }, { name: "Kubernetes", icon: "☸️" }], clientLogo: "", clientName: "SmartCity Gov", industry: "Government / Smart City", highlights: ["500+ camera feeds", "99.1% detection rate", "Real-time alerts", "City-scale deployment"], status: "published", featured: false, order: 6 },
    ]);
    console.log("✅ Portfolio seeded (6 projects)");
  } else {
    console.log(`⏭️  Portfolio already exists (${portfolioCount} projects)`);
  }

  // ─── Testimonials ─────────────────────────────────────────────
  const testimonialCount = await Testimonial.countDocuments();
  if (testimonialCount === 0) {
    await Testimonial.insertMany([
      { quote: "SunTriX transformed our data pipeline with an agentic AI system that cut processing time by 10x. Their architectural depth is unmatched.", name: "Sarah Chen", role: "CTO", company: "DataFlow Inc.", avatar: "", rating: 5, featured: true, status: "published" },
      { quote: "We went from concept to production-ready SaaS in 12 weeks. The team's ability to combine ML models with scalable infrastructure is remarkable.", name: "Marcus Johnson", role: "VP Engineering", company: "NeuralPath", avatar: "", rating: 5, featured: true, status: "published" },
      { quote: "Their computer vision solution achieved 94% accuracy on our quality inspection system. SunTriX delivered ahead of schedule with exceptional documentation.", name: "Emily Rodriguez", role: "Head of Product", company: "VisionTech", avatar: "", rating: 5, featured: true, status: "published" },
    ]);
    console.log("✅ Testimonials seeded (3 items)");
  } else {
    console.log(`⏭️  Testimonials already exist (${testimonialCount})`);
  }

  console.log("\n🎉 Seed complete!\n");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
