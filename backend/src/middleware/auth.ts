import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { createError } from "./errorHandler";
import { getSetting } from "../lib/configLoader";

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string; name: string };
}

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(createError("Authorization token required", 401));
    }

    const token = authHeader.split(" ")[1];
    const secret = getSetting("JWT_SECRET");
    if (!secret) throw new Error("JWT_SECRET not configured. Set it in Admin → Settings → Security.");

    const decoded = jwt.verify(token, secret) as { id: string; email: string; role: string; name: string };
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(createError("Token expired, please log in again", 401));
    }
    return next(createError("Invalid or expired token", 401));
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(createError("Insufficient permissions", 403));
    }
    next();
  };
}
