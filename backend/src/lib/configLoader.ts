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
