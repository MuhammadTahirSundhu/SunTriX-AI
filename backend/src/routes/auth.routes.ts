import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { createError } from "../middleware/errorHandler";

const router = Router();

// POST /auth/login
router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(createError("Email and password are required", 400));
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return next(createError("Invalid email or password", 401));
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return next(createError("Invalid email or password", 401));
    }

    const secret = process.env.JWT_SECRET!;
    const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as `${number}${"s"|"m"|"h"|"d"|"w"}`;
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role, name: admin.name },
      secret,
      { expiresIn }
    );

    res.json({
      token,
      user: { id: admin._id, email: admin.email, name: admin.name, role: admin.role },
    });
  } catch (err) {
    next(err);
  }
});

// GET /auth/me
router.get("/me", requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const admin = await Admin.findById(req.user!.id).select("-password");
    if (!admin) return next(createError("User not found", 404));
    res.json(admin);
  } catch (err) {
    next(err);
  }
});

// POST /auth/logout  (client-side token removal; server just acknowledges)
router.post("/logout", requireAuth, (_req: Request, res: Response) => {
  res.json({ message: "Logged out successfully" });
});

export default router;
