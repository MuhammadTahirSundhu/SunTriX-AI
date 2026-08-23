import { describe, it, expect, vi } from "vitest";
import { deleteAsset, cloudinary } from "../services/cloudinary";
import MediaAsset from "../models/MediaAsset";

describe("2.6 Cloudinary Dynamic Resource Type Delete Unit Tests", () => {
  it("should look up MediaAsset resourceType and invoke Cloudinary destroy with correct resource_type for video", async () => {
    const mockFindOne = vi.spyOn(MediaAsset, "findOne").mockResolvedValue({
      publicId: "suntrix/videos/demo",
      resourceType: "video",
    } as any);

    const mockDeleteOne = vi.spyOn(MediaAsset, "deleteOne").mockResolvedValue({ deletedCount: 1 } as any);

    const mockDestroy = vi.spyOn(cloudinary.uploader, "destroy").mockResolvedValue({ result: "ok" });

    await deleteAsset("suntrix/videos/demo");

    expect(mockFindOne).toHaveBeenCalledWith({ publicId: "suntrix/videos/demo" });
    expect(mockDestroy).toHaveBeenCalledWith("suntrix/videos/demo", { resource_type: "video" });
    expect(mockDeleteOne).toHaveBeenCalledWith({ publicId: "suntrix/videos/demo" });
  });

  it("should default to image resourceType if MediaAsset record is missing", async () => {
    vi.spyOn(MediaAsset, "findOne").mockResolvedValue(null);
    vi.spyOn(MediaAsset, "deleteOne").mockResolvedValue({ deletedCount: 0 } as any);
    const mockDestroy = vi.spyOn(cloudinary.uploader, "destroy").mockResolvedValue({ result: "not_found" });

    await deleteAsset("suntrix/images/unknown");

    expect(mockDestroy).toHaveBeenCalledWith("suntrix/images/unknown", { resource_type: "image" });
  });
});
