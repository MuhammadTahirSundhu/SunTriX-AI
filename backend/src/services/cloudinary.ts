import { v2 as cloudinary } from "cloudinary";
export { cloudinary };
import multer from "multer";
import path from "path";
import crypto from "crypto";

// Helper to generate md5 hash of file buffer
function getFileHash(buffer: Buffer): string {
  return crypto.createHash("md5").update(buffer).digest("hex");
}

// Helper to check if asset already exists
async function getExistingAsset(
  publicId: string,
  resourceType: "image" | "video" | "raw"
): Promise<{ url: string; publicId: string } | null> {
  try {
    const result = await cloudinary.api.resource(publicId, { resource_type: resourceType });
    if (result && result.secure_url) {
      return { url: result.secure_url, publicId: result.public_id };
    }
  } catch (error: any) {
    if (error?.http_code === 404) return null;
    console.error("Cloudinary resource check error:", error?.message || error);
  }
  return null;
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Multer memory storage — we upload buffer directly to Cloudinary
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter(_req, file, cb) {
    const allowed = [
      // Images
      ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg",
      // Videos
      ".mp4", ".mov", ".webm",
      // Documents
      ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt",
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} is not allowed`));
    }
  },
});

export async function uploadImage(
  buffer: Buffer,
  folder = "suntrix",
  publicId?: string
): Promise<{ url: string; publicId: string }> {
  const hash = getFileHash(buffer);
  const targetPublicId = publicId || `${folder}/${hash}`;

  const existing = await getExistingAsset(targetPublicId, "image");
  if (existing) return existing;

  return new Promise((resolve, reject) => {
    const options: Record<string, unknown> = {
      folder: publicId ? folder : undefined, // If passing exact publicId, we might not need folder if it's included
      resource_type: "image" as const,
      public_id: publicId || hash,
    };

    if (!publicId) options.folder = folder;

    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err || !result) return reject(err || new Error("Upload failed"));
      resolve({ url: result.secure_url, publicId: result.public_id });
    });

    stream.end(buffer);
  });
}

export async function uploadVideo(
  buffer: Buffer,
  folder = "suntrix/videos"
): Promise<{ url: string; publicId: string }> {
  const hash = getFileHash(buffer);
  const targetPublicId = `${folder}/${hash}`;

  const existing = await getExistingAsset(targetPublicId, "video");
  if (existing) return existing;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: hash, resource_type: "video" },
      (err, result) => {
        if (err || !result) return reject(err || new Error("Upload failed"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export async function uploadDocument(
  buffer: Buffer,
  originalName: string,
  folder = "suntrix/docs"
): Promise<{ url: string; publicId: string }> {
  const hash = getFileHash(buffer);
  const ext = path.extname(originalName);
  const targetPublicId = `${folder}/${hash}${ext}`;

  const existing = await getExistingAsset(targetPublicId, "raw");
  if (existing) return existing;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "raw",
        public_id: `${hash}${ext}`,
        use_filename: true,
        unique_filename: false,
      },
      (err, result) => {
        if (err || !result) return reject(err || new Error("Upload failed"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export async function deleteAsset(publicId: string, resourceType: "image" | "video" | "raw" = "image"): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
