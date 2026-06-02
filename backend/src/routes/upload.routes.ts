import { Router, Request, Response, NextFunction } from "express";
import { upload, uploadImage, uploadVideo, uploadDocument, cloudinary } from "../services/cloudinary";
import { requireAuth } from "../middleware/auth";
import { createError } from "../middleware/errorHandler";
import path from "path";

const router = Router();

// GET /upload — list all assets from Cloudinary (admin only)
router.get("/", requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "suntrix",
      max_results: 200,
      resource_type: "image",
    });
    const imageAssets = result.resources.map((r: Record<string, unknown>) => ({
      _id: r.asset_id as string || r.public_id as string,
      publicId: r.public_id as string,
      url: r.url as string,
      secureUrl: r.secure_url as string,
      resourceType: "image",
      format: r.format as string,
      width: r.width as number,
      height: r.height as number,
      bytes: r.bytes as number,
      folder: r.folder as string || "suntrix",
      createdAt: r.created_at as string,
    }));

    // Also fetch videos
    const videoResult = await cloudinary.api.resources({
      type: "upload",
      prefix: "suntrix",
      max_results: 100,
      resource_type: "video",
    }).catch(() => ({ resources: [] }));

    const videoAssets = videoResult.resources.map((r: Record<string, unknown>) => ({
      _id: r.asset_id as string || r.public_id as string,
      publicId: r.public_id as string,
      url: r.url as string,
      secureUrl: r.secure_url as string,
      resourceType: "video",
      format: r.format as string,
      width: r.width as number,
      height: r.height as number,
      bytes: r.bytes as number,
      folder: r.folder as string || "suntrix",
      createdAt: r.created_at as string,
    }));

    // Deduplicate existing Cloudinary assets by hash/filename (the last part of publicId)
    // This hides old duplicates from the UI
    const uniqueAssets = new Map<string, any>();
    
    [...imageAssets, ...videoAssets].forEach((asset: any) => {
      const parts = asset.publicId.split("/");
      const hashOrName = parts[parts.length - 1]; // This is the MD5 hash we generated
      if (!uniqueAssets.has(hashOrName)) {
        uniqueAssets.set(hashOrName, asset);
      }
    });

    res.json(Array.from(uniqueAssets.values()));
  } catch (err) {
    next(err);
  }
});

// POST /upload/image — admin only
router.post(
  "/image",
  requireAuth,
  upload.single("file"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) return next(createError("No file uploaded", 400));
      const folder = (req.body.folder as string) || "suntrix";
      const result = await uploadImage(req.file.buffer, folder);
      res.json({
        _id: result.publicId,
        publicId: result.publicId,
        url: result.url,
        secureUrl: result.url,
        resourceType: "image",
        format: path.extname(req.file.originalname).replace(".", "") || "jpg",
        bytes: req.file.size,
        folder,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /upload/video — admin only
router.post(
  "/video",
  requireAuth,
  upload.single("file"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) return next(createError("No file uploaded", 400));
      const folder = (req.body.folder as string) || "suntrix/videos";
      const result = await uploadVideo(req.file.buffer, folder);
      res.json({
        _id: result.publicId,
        publicId: result.publicId,
        url: result.url,
        secureUrl: result.url,
        resourceType: "video",
        format: path.extname(req.file.originalname).replace(".", "") || "mp4",
        bytes: req.file.size,
        folder,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /upload/document — admin only (PDFs, DOCs, XLS, PPT, etc.)
router.post(
  "/document",
  requireAuth,
  upload.single("file"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) return next(createError("No file uploaded", 400));
      const folder = (req.body.folder as string) || "suntrix/docs";
      const result = await uploadDocument(req.file.buffer, req.file.originalname, folder);
      const ext = path.extname(req.file.originalname).toLowerCase();
      res.json({
        _id: result.publicId,
        publicId: result.publicId,
        url: result.url,
        secureUrl: result.url,
        resourceType: "raw",
        format: ext.replace(".", ""),
        name: req.file.originalname,
        bytes: req.file.size,
        folder,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /upload/bulk — bulk delete from Cloudinary (admin only)
router.delete("/bulk", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { publicIds } = req.body;
    if (!Array.isArray(publicIds)) return next(createError("publicIds array required", 400));
    
    // Cloudinary supports bulk deletion
    if (publicIds.length > 0) {
      await cloudinary.api.delete_resources(publicIds);
    }
    
    res.json({ success: true, count: publicIds.length });
  } catch (err) {
    next(err);
  }
});

// DELETE /upload/:encodedId — delete from Cloudinary (admin only)
// publicId is base64-encoded to avoid slash issues in URLs
router.delete("/:encodedId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const publicId = Buffer.from(req.params.encodedId, "base64").toString("utf-8");
    await cloudinary.uploader.destroy(publicId);
    res.json({ success: true, publicId });
  } catch (err) {
    next(err);
  }
});

export default router;
