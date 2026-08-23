import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../app";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin";

describe("Phase 1 Security & Race Condition Regression Suite", () => {

  describe("1B.3 & 1B.4 — Auth Security & RBAC Enforcement", () => {
    it("should reject viewer role from admin-only write routes with 403 Forbidden", async () => {
      const viewerToken = jwt.sign(
        { id: "viewer_1", email: "viewer@suntrix.com", role: "viewer", name: "Viewer User" },
        process.env.JWT_SECRET || "test_jwt_secret_min_64_chars_long_key_string_for_testing_1234567890"
      );

      const res = await request(app)
        .delete("/v1/task-requests/bulk")
        .set("Authorization", `Bearer ${viewerToken}`)
        .send({ ids: ["507f1f77bcf86cd799439011"] });

      expect(res.status).toBe(403);
      const errMsg = res.body.message || res.body.error || "";
      expect(errMsg).toContain("Insufficient permissions");
    });

    it("should allow admin role to access protected write routes", async () => {
      const adminToken = jwt.sign(
        { id: "admin_1", email: "admin@suntrix.com", role: "admin", name: "Admin User" },
        process.env.JWT_SECRET || "test_jwt_secret_min_64_chars_long_key_string_for_testing_1234567890"
      );

      // Sending bulk delete with empty array — should pass RBAC check and return 400 (validation error), NOT 403
      const res = await request(app)
        .delete("/v1/task-requests/bulk")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ ids: [] });

      expect(res.status).toBe(400);
      const errMsg = res.body.message || res.body.error || "";
      expect(errMsg).not.toContain("Insufficient permissions");
    });

    it("should enforce rate limiting on /v1/auth/login after 5 consecutive attempts", async () => {
      vi.spyOn(Admin, "findOne").mockResolvedValue(null as any);

      // Execute 5 attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post("/v1/auth/login")
          .send({ email: "test@suntrix.com", password: "wrongpassword" });
      }

      // 6th attempt should be blocked with 429
      const res = await request(app)
        .post("/v1/auth/login")
        .send({ email: "test@suntrix.com", password: "wrongpassword" });

      expect(res.status).toBe(429);
      const errMsg = res.body.message || res.body.error || "";
      expect(errMsg).toContain("Too many login attempts");
    });
  });

  describe("1C — Trusted Proxy Configuration", () => {
    it("should configure trust proxy on Express app", () => {
      expect(app.get("trust proxy")).toBe(1);
    });
  });

});
