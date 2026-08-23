/**
 * configLoader.ts
 *
 * Central config layer — reads settings from MongoDB into process.env & in-memory cache.
 * Services call getSetting(key) so they always use the latest value.
 * updateSettingCache() is called by the settings route on every update/upsert,
 * giving instant hot-reload without a server restart.
 */

import SystemSetting from "../models/SystemSetting";

export const DEFAULT_SYSTEM_SETTINGS = [
  {
    key: "GROQ_API_KEY",
    value: "",
    section: "ai",
    label: "Groq API Key",
    description: "API Key for Groq Cloud AI services",
    type: "password",
    isSecret: true,
  },
  {
    key: "GROQ_CHAT_MODEL",
    value: "llama-3.1-8b-instant",
    section: "ai",
    label: "Chat & Generation AI Model",
    description: "Groq model used for AI Chatbot, Proposals, Contracts & Email Templates",
    type: "select",
    options: [],
    isSecret: false,
  },
  {
    key: "GROQ_EXTRACT_MODEL",
    value: "llama-3.1-8b-instant",
    section: "ai",
    label: "Extraction AI Model",
    description: "Groq model used for fast structured JSON field extraction",
    type: "select",
    options: [],
    isSecret: false,
  },
  {
    key: "GROQ_CHAT_TEMPERATURE",
    value: "0.7",
    section: "ai",
    label: "Chat Temperature",
    description: "Creativity index (0.0 to 1.0)",
    type: "number",
    isSecret: false,
  },
  {
    key: "GROQ_CHAT_MAX_TOKENS",
    value: "1024",
    section: "ai",
    label: "Chat Max Tokens",
    description: "Maximum tokens per chatbot response",
    type: "number",
    isSecret: false,
  },
  {
    key: "CHATBOT_ENABLED",
    value: "true",
    section: "chatbot",
    label: "Enable Website Chatbot",
    description: "Toggle chatbot widget on public website",
    type: "toggle",
    isSecret: false,
  },
  {
    key: "CHATBOT_NAME",
    value: "SunTriX AI Assistant",
    section: "chatbot",
    label: "Chatbot Name",
    description: "Display name for the AI assistant",
    type: "text",
    isSecret: false,
  },
  {
    key: "CHATBOT_WELCOME_MESSAGE",
    value: "Hello! How can SunTriX help build or scale your AI solutions today?",
    section: "chatbot",
    label: "Welcome Message",
    description: "Initial message displayed when chat opens",
    type: "text",
    isSecret: false,
  },
  {
    key: "CHATBOT_SYSTEM_PROMPT",
    value: "You are SunTriX AI Assistant, an elite software engineering and AI solutions consultant.",
    section: "chatbot",
    label: "Custom System Prompt",
    description: "System instructions provided to the AI assistant",
    type: "textarea",
    isSecret: false,
  },
  {
    key: "CHATBOT_MAX_WORDS",
    value: "150",
    section: "chatbot",
    label: "Max Response Length (Words)",
    description: "Target maximum words per response",
    type: "number",
    isSecret: false,
  },
];

// ─── In-memory cache (key → value) ─────────────────────────────────────────
const cache: Record<string, string> = {};

// ─── Read a setting (cache → process.env → fallback) ───────────────────────
export function getSetting(key: string, fallback = ""): string {
  if (cache[key] !== undefined) return cache[key];
  if (process.env[key] !== undefined && process.env[key] !== "") return process.env[key]!;
  return fallback;
}

// ─── Update cache + process.env (called after DB update/upsert) ────────────
export function updateSettingCache(key: string, value: string): void {
  cache[key] = value;
  process.env[key] = value;
}

// ─── Load ALL settings from DB into cache + process.env ────────────────────
export async function loadSettingsFromDB(): Promise<void> {
  try {
    // 1. Seed defaults if DB settings table is missing records
    for (const def of DEFAULT_SYSTEM_SETTINGS) {
      const existing = await SystemSetting.findOne({ key: def.key });
      if (!existing) {
        await SystemSetting.create({
          ...def,
          value: process.env[def.key] || def.value,
        });
      }
    }

    // 2. Load all settings into in-memory cache
    const settings = await SystemSetting.find({});
    for (const s of settings) {
      if (s.value !== undefined) {
        cache[s.key] = s.value;
        process.env[s.key] = s.value;
      }
    }
    console.log(`✅ Loaded ${settings.length} settings from DB into memory & env`);
  } catch (err) {
    console.warn("⚠️  Could not load settings from DB — using .env values as-is", err);
  }
}
