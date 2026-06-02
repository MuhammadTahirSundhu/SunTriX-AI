/**
 * configLoader.ts
 *
 * Central config layer — reads settings from MongoDB into process.env.
 * Services call getSetting(key) so they always use the latest value.
 * updateSettingCache() is called by the settings route on every PATCH,
 * giving instant hot-reload without a server restart.
 */

import SystemSetting from "../models/SystemSetting";

// ─── In-memory cache (key → value) ─────────────────────────────────────────
const cache: Record<string, string> = {};

// ─── Read a setting (cache → process.env → "") ─────────────────────────────
export function getSetting(key: string, fallback = ""): string {
  if (cache[key] !== undefined && cache[key] !== "") return cache[key];
  if (process.env[key] !== undefined && process.env[key] !== "") return process.env[key]!;
  return fallback;
}

// ─── Update cache + process.env (called after every DB PATCH) ──────────────
export function updateSettingCache(key: string, value: string): void {
  cache[key] = value;
  process.env[key] = value;
}

// ─── Load ALL settings from DB into cache + process.env ────────────────────
export async function loadSettingsFromDB(): Promise<void> {
  try {
    const settings = await SystemSetting.find({});
    for (const s of settings) {
      if (s.value !== undefined && s.value !== "") {
        cache[s.key] = s.value;
        process.env[s.key] = s.value;
      }
    }
    console.log(`✅ Loaded ${settings.length} settings from DB into env`);
  } catch (err) {
    console.warn("⚠️  Could not load settings from DB — using .env values as-is");
  }
}

// ─── Default settings catalog ──────────────────────────────────────────────
// value = the .env value if set, else a sensible default.
// On first startup, these are inserted into MongoDB if the key doesn't exist yet.
// This means the .env file "promotes" its values into the DB automatically.

export const DEFAULT_SETTINGS = [
  // ── AI ────────────────────────────────────────────────────────────────────
  {
    key: "GROQ_API_KEY",
    section: "ai",
    label: "Groq API Key",
    description: "Secret key from console.groq.com — used for all AI features",
    type: "password",
    isSecret: true,
    options: [],
    get value() { return process.env.GROQ_API_KEY || ""; },
  },
  {
    key: "GROQ_CHAT_MODEL",
    section: "ai",
    label: "Chat Model",
    description: "Model used for the website chatbot responses",
    type: "select",
    isSecret: false,
    options: [
      "llama-3.3-70b-versatile",
      "llama-3.1-70b-versatile",
      "llama-3.1-8b-instant",
      "mixtral-8x7b-32768",
      "gemma2-9b-it",
    ],
    value: "llama-3.3-70b-versatile",
  },
  {
    key: "GROQ_EXTRACT_MODEL",
    section: "ai",
    label: "AI Extraction Model",
    description: "Model used for AI-assisted field extraction in admin panels",
    type: "select",
    isSecret: false,
    options: [
      "llama-3.1-8b-instant",
      "llama-3.3-70b-versatile",
      "llama-3.1-70b-versatile",
      "mixtral-8x7b-32768",
    ],
    value: "llama-3.1-8b-instant",
  },
  {
    key: "GROQ_CHAT_TEMPERATURE",
    section: "ai",
    label: "Chat Temperature",
    description: "0.0 = deterministic, 1.0 = very creative",
    type: "number",
    isSecret: false,
    options: [],
    value: "0.7",
  },
  {
    key: "GROQ_CHAT_MAX_TOKENS",
    section: "ai",
    label: "Chat Max Tokens",
    description: "Maximum token length for chatbot responses",
    type: "number",
    isSecret: false,
    options: [],
    value: "1024",
  },
  {
    key: "GROQ_EMAIL_TEMPERATURE",
    section: "ai",
    label: "Email Template Temperature",
    description: "Creativity level for AI-generated email templates",
    type: "number",
    isSecret: false,
    options: [],
    value: "0.4",
  },
  {
    key: "GROQ_EMAIL_MAX_TOKENS",
    section: "ai",
    label: "Email Template Max Tokens",
    description: "Maximum length for AI-generated email HTML",
    type: "number",
    isSecret: false,
    options: [],
    value: "2048",
  },
  {
    key: "AI_ENABLED",
    section: "ai",
    label: "AI Features Enabled",
    description: "Master toggle — disabling this turns off all AI endpoints",
    type: "toggle",
    isSecret: false,
    options: [],
    value: "true",
  },

  // ── Email ─────────────────────────────────────────────────────────────────
  {
    key: "RESEND_API_KEY",
    section: "email",
    label: "Resend API Key",
    description: "Secret key from resend.com — used to send all transactional emails",
    type: "password",
    isSecret: true,
    options: [],
    get value() { return process.env.RESEND_API_KEY || ""; },
  },
  {
    key: "ADMIN_EMAIL",
    section: "email",
    label: "Admin Notification Email",
    description: "Email address that receives contact & task request notifications",
    type: "text",
    isSecret: false,
    options: [],
    get value() { return process.env.ADMIN_EMAIL || "admin@suntrix.com"; },
  },
  {
    key: "FROM_EMAIL_NAME",
    section: "email",
    label: "From Sender Name",
    description: "Display name shown in the From field of outgoing emails",
    type: "text",
    isSecret: false,
    options: [],
    value: "SunTriX",
  },
  {
    key: "FROM_EMAIL_ADDRESS",
    section: "email",
    label: "From Email Address",
    description: "Email address used as the sender (must be verified in Resend)",
    type: "text",
    isSecret: false,
    options: [],
    value: "onboarding@resend.dev",
  },
  {
    key: "FRONTEND_URL",
    section: "email",
    label: "Frontend App URL",
    description: "Used to build links inside email templates",
    type: "url",
    isSecret: false,
    options: [],
    get value() { return process.env.FRONTEND_URL || "http://localhost:5173"; },
  },
  {
    key: "EMAIL_CONTACT_NOTIFICATIONS",
    section: "email",
    label: "Contact Form Notifications",
    description: "Send admin email when a contact form is submitted",
    type: "toggle",
    isSecret: false,
    options: [],
    value: "true",
  },
  {
    key: "EMAIL_TASK_NOTIFICATIONS",
    section: "email",
    label: "Task Request Notifications",
    description: "Send admin email when a task request is submitted",
    type: "toggle",
    isSecret: false,
    options: [],
    value: "true",
  },
  {
    key: "EMAIL_PAYMENT_SLA",
    section: "email",
    label: "Response Time SLA",
    description: "Text shown in payment confirmation emails (e.g. '2 business hours')",
    type: "text",
    isSecret: false,
    options: [],
    value: "2 business hours",
  },
  {
    key: "EMAIL_KICKOFF_SLA",
    section: "email",
    label: "Kickoff Call Timeline",
    description: "Text shown in payment confirmation emails (e.g. '24 hours')",
    type: "text",
    isSecret: false,
    options: [],
    value: "24 hours",
  },

  // ── Payment ───────────────────────────────────────────────────────────────
  {
    key: "STRIPE_SECRET_KEY",
    section: "payment",
    label: "Stripe Secret Key",
    description: "Secret key from Stripe dashboard (sk_live_... or sk_test_...)",
    type: "password",
    isSecret: true,
    options: [],
    get value() { return process.env.STRIPE_SECRET_KEY || ""; },
  },
  {
    key: "STRIPE_PUBLISHABLE_KEY",
    section: "payment",
    label: "Stripe Publishable Key",
    description: "Public key sent to the frontend for Stripe.js (pk_live_... or pk_test_...)",
    type: "text",
    isSecret: false,
    options: [],
    get value() { return process.env.STRIPE_PUBLISHABLE_KEY || ""; },
  },
  {
    key: "STRIPE_WEBHOOK_SECRET",
    section: "payment",
    label: "Stripe Webhook Secret",
    description: "Signing secret from your Stripe webhook endpoint (whsec_...)",
    type: "password",
    isSecret: true,
    options: [],
    get value() { return process.env.STRIPE_WEBHOOK_SECRET || ""; },
  },
  {
    key: "STRIPE_MODE",
    section: "payment",
    label: "Payment Mode",
    description: "Switch between live and test mode — update keys accordingly",
    type: "select",
    isSecret: false,
    options: ["test", "live"],
    value: "test",
  },
  {
    key: "PAYMENT_CURRENCY",
    section: "payment",
    label: "Currency",
    description: "Default currency for all invoices and payments",
    type: "select",
    isSecret: false,
    options: ["USD", "EUR", "GBP", "AED", "PKR"],
    value: "USD",
  },
  {
    key: "INVOICE_VALIDITY_DAYS",
    section: "payment",
    label: "Invoice Validity (days)",
    description: "Number of days before an unpaid invoice link expires",
    type: "number",
    isSecret: false,
    options: [],
    value: "7",
  },

  // ── Storage ───────────────────────────────────────────────────────────────
  {
    key: "CLOUDINARY_CLOUD_NAME",
    section: "storage",
    label: "Cloudinary Cloud Name",
    description: "Your Cloudinary cloud name from cloudinary.com dashboard",
    type: "text",
    isSecret: false,
    options: [],
    get value() { return process.env.CLOUDINARY_CLOUD_NAME || ""; },
  },
  {
    key: "CLOUDINARY_API_KEY",
    section: "storage",
    label: "Cloudinary API Key",
    description: "API key from your Cloudinary account settings",
    type: "text",
    isSecret: false,
    options: [],
    get value() { return process.env.CLOUDINARY_API_KEY || ""; },
  },
  {
    key: "CLOUDINARY_API_SECRET",
    section: "storage",
    label: "Cloudinary API Secret",
    description: "API secret from your Cloudinary account settings",
    type: "password",
    isSecret: true,
    options: [],
    get value() { return process.env.CLOUDINARY_API_SECRET || ""; },
  },
  {
    key: "UPLOAD_MAX_SIZE_MB",
    section: "storage",
    label: "Upload Max File Size (MB)",
    description: "Maximum allowed file size for uploads via the media library",
    type: "number",
    isSecret: false,
    options: [],
    value: "50",
  },
  {
    key: "UPLOAD_DEFAULT_FOLDER",
    section: "storage",
    label: "Default Upload Folder",
    description: "Cloudinary folder where media files are stored",
    type: "text",
    isSecret: false,
    options: [],
    value: "suntrix",
  },

  // ── Brand ─────────────────────────────────────────────────────────────────
  {
    key: "BRAND_NAME",
    section: "brand",
    label: "Company Name",
    description: "Used in email templates, chatbot, and across the system",
    type: "text",
    isSecret: false,
    options: [],
    value: "SunTriX AI Solutions",
  },
  {
    key: "BRAND_TAGLINE",
    section: "brand",
    label: "Company Tagline",
    description: "Short tagline shown in email footers and AI responses",
    type: "text",
    isSecret: false,
    options: [],
    value: "Premium AI Engineering Agency",
  },
  {
    key: "BRAND_EMAIL",
    section: "brand",
    label: "Public Contact Email",
    description: "Public-facing email mentioned in chatbot and email templates",
    type: "text",
    isSecret: false,
    options: [],
    value: "hello@suntrix.com",
  },
  {
    key: "BRAND_WEBSITE",
    section: "brand",
    label: "Company Website",
    description: "Used in email footers",
    type: "url",
    isSecret: false,
    options: [],
    value: "https://suntrix.ai",
  },

  {
    key: "BRAND_PROPOSAL_GUARANTEE",
    section: "brand",
    label: "24-hour Proposal Guarantee",
    description: "Whether to mention the proposal guarantee in AI and email copy",
    type: "toggle",
    isSecret: false,
    options: [],
    value: "true",
  },
  {
    key: "BRAND_RESPONSE_TIME",
    section: "brand",
    label: "Response Time Guarantee",
    description: "e.g. '24 hours' — used in chatbot and marketing copy",
    type: "text",
    isSecret: false,
    options: [],
    value: "24 hours",
  },

  // ── Chatbot ───────────────────────────────────────────────────────────────
  {
    key: "CHATBOT_ENABLED",
    section: "chatbot",
    label: "Chatbot Enabled",
    description: "Toggle the AI chat widget on the public website",
    type: "toggle",
    isSecret: false,
    options: [],
    value: "true",
  },
  {
    key: "CHATBOT_NAME",
    section: "chatbot",
    label: "Chatbot Display Name",
    description: "Name used when the chatbot introduces itself",
    type: "text",
    isSecret: false,
    options: [],
    value: "SunTriX AI",
  },
  {
    key: "CHATBOT_WELCOME_MESSAGE",
    section: "chatbot",
    label: "Welcome Message",
    description: "First message shown when the chat is opened",
    type: "textarea",
    isSecret: false,
    options: [],
    value: "👋 Hi! I'm the SunTriX AI assistant. Ask me anything about our services, pricing, or how to get started.",
  },
  {
    key: "CHATBOT_SYSTEM_PROMPT",
    section: "chatbot",
    label: "System Prompt",
    description: "Full system prompt sent to the AI model. Overrides the auto-generated prompt when non-empty.",
    type: "textarea",
    isSecret: false,
    options: [],
    value: "",
  },
  {
    key: "CHATBOT_MAX_WORDS",
    section: "chatbot",
    label: "Max Response Words",
    description: "Instruct the model to keep responses under this word count",
    type: "number",
    isSecret: false,
    options: [],
    value: "300",
  },
  {
    key: "CHATBOT_PRICING_LINK",
    section: "chatbot",
    label: "Task Request / Pricing Page Link",
    description: "URL mentioned by the chatbot when users ask about pricing",
    type: "url",
    isSecret: false,
    options: [],
    value: "/request-task",
  },
  {
    key: "CHATBOT_PORTFOLIO_LINK",
    section: "chatbot",
    label: "Portfolio / Work Page Link",
    description: "URL mentioned by the chatbot when users ask about case studies",
    type: "url",
    isSecret: false,
    options: [],
    value: "/work",
  },
  {
    key: "CHATBOT_CONTACT_LINK",
    section: "chatbot",
    label: "Contact Page Link",
    description: "URL mentioned by the chatbot when users ask how to get in touch",
    type: "url",
    isSecret: false,
    options: [],
    value: "/contact",
  },

  // ── Newsletter ────────────────────────────────────────────────────────────
  {
    key: "NEWSLETTER_BATCH_SIZE",
    section: "newsletter",
    label: "Broadcast Batch Size",
    description: "Number of emails sent per batch to Resend (max 100 for free plans)",
    type: "number",
    isSecret: false,
    options: [],
    value: "100",
  },
  {
    key: "NEWSLETTER_FOOTER_TEXT",
    section: "newsletter",
    label: "Newsletter Footer Text",
    description: "Legal / unsubscribe footer appended to every broadcast email",
    type: "textarea",
    isSecret: false,
    options: [],
    value: "You are receiving this email because you subscribed to SunTriX AI Solutions updates. To unsubscribe, reply with UNSUBSCRIBE.",
  },
  {
    key: "NEWSLETTER_DOUBLE_OPTIN",
    section: "newsletter",
    label: "Double Opt-in",
    description: "Require email confirmation before adding subscribers (GDPR best practice)",
    type: "toggle",
    isSecret: false,
    options: [],
    value: "false",
  },

  // ── Security ──────────────────────────────────────────────────────────────
  {
    key: "JWT_SECRET",
    section: "security",
    label: "JWT Secret",
    description: "Secret used to sign admin auth tokens — changing this logs out all sessions",
    type: "password",
    isSecret: true,
    options: [],
    get value() { return process.env.JWT_SECRET || ""; },
  },
  {
    key: "JWT_EXPIRY",
    section: "security",
    label: "Token Expiry",
    description: "How long admin JWT tokens remain valid",
    type: "select",
    isSecret: false,
    options: ["1d", "7d", "14d", "30d"],
    value: "7d",
  },
  {
    key: "MAINTENANCE_MODE",
    section: "security",
    label: "Maintenance Mode",
    description: "When enabled, public routes return a maintenance message",
    type: "toggle",
    isSecret: false,
    options: [],
    value: "false",
  },
  {
    key: "RATE_LIMIT_MAX",
    section: "security",
    label: "Global Rate Limit (req / 15 min)",
    description: "Maximum requests per IP per 15-minute window",
    type: "number",
    isSecret: false,
    options: [],
    value: "500",
  },
  {
    key: "AUDIT_LOG_RETENTION_DAYS",
    section: "security",
    label: "Audit Log Retention (days)",
    description: "Audit log entries older than this are automatically deleted",
    type: "number",
    isSecret: false,
    options: [],
    value: "90",
  },
] as const;

// ─── Seed defaults into DB if not already present ──────────────────────────
export async function seedDefaultSettings(): Promise<void> {
  try {
    for (const def of DEFAULT_SETTINGS) {
      const exists = await SystemSetting.findOne({ key: def.key });
      if (!exists) {
        await SystemSetting.create({
          key: def.key,
          // Prefer the live .env value if set, otherwise use the catalog default
          value: (def as any).value ?? "",
          section: def.section,
          label: def.label,
          description: def.description ?? "",
          type: def.type,
          options: (def as any).options ?? [],
          isSecret: def.isSecret,
        });
      }
    }
    console.log("✅ Default settings seeded");
  } catch (err) {
    console.warn("⚠️  Could not seed default settings:", err);
  }
}
