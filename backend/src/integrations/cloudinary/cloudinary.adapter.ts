import { v2 as cloudinary } from "cloudinary";
import { getSetting } from "../../lib/configLoader";
import MediaAsset from "../../models/MediaAsset";

export class CloudinaryAdapter {
  private configure() {
    const cloudName = getSetting("CLOUDINARY_CLOUD_NAME");
    const apiKey = getSetting("CLOUDINARY_API_KEY");
    const apiSecret = getSetting("CLOUDINARY_API_SECRET");

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
    }
  }

  async listResources(prefix = "suntrix", maxResults = 200): Promise<any[]> {
    this.configure();
    const images = await cloudinary.api.resources({
      type: "upload",
      prefix,
      max_results: maxResults,
      resource_type: "image",
    });

    const videos = await cloudinary.api.resources({
      type: "upload",
      prefix,
      max_results: maxResults,
      resource_type: "video",
    }).catch(() => ({ resources: [] }));

    return [...images.resources, ...videos.resources];
  }

  async deleteAssetByPublicId(publicId: string): Promise<boolean> {
    this.configure();
    const dbAsset = await MediaAsset.findOne({ publicId });
    const resourceType = dbAsset ? dbAsset.resourceType : "image";

    const res = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType as "image" | "video" | "raw",
    });

    if (dbAsset) {
      await MediaAsset.deleteOne({ _id: dbAsset._id });
    }

    return res.result === "ok";
  }
}

export const cloudinaryAdapter = new CloudinaryAdapter();
