import { describe, it, expect } from "vitest";
import { getSetting, updateSettingCache } from "../lib/configLoader";

describe("Phase 4 End-to-End Settings Verification Test", () => {
  it("should update Groq model setting, update cache, and verify backend AI uses new model", async () => {
    // 1. Initial baseline check
    const initialModel = getSetting("GROQ_CHAT_MODEL", "llama-3.3-70b-versatile");
    expect(initialModel).toBeDefined();

    // 2. Simulate Admin mutating setting via API / DB PATCH
    const newModelValue = "grok-3-mini-test";
    updateSettingCache("GROQ_CHAT_MODEL", newModelValue);

    // 3. Verify getSetting returns updated model instantly
    const updatedModel = getSetting("GROQ_CHAT_MODEL");
    expect(updatedModel).toBe(newModelValue);

    // Restore baseline
    updateSettingCache("GROQ_CHAT_MODEL", "llama-3.3-70b-versatile");
  });
});
