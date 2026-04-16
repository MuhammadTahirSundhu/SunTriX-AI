import { useState, useEffect } from "react";
import { Image, Video, Upload, Trash2, Copy, Search, X, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest, ENDPOINTS } from "@/lib/api";

interface CloudinaryAsset {
  _id: string;
  publicId: string;
  url: string;
  secureUrl: string;
  resourceType: "image" | "video";
  format: string;
  width: number;
  height: number;
  bytes: number;
  folder: string;
  createdAt: string;
}

const AdminMedia = () => {
  const [media, setMedia] = useState<CloudinaryAsset[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const MEDIA_LIST_URL = ENDPOINTS.UPLOAD_IMAGE.replace("/image", "");
  const reload = async () => {
    const { data } = await apiRequest<CloudinaryAsset[]>(MEDIA_LIST_URL);
    if (data) setMedia(data);
  };

  useEffect(() => { reload(); }, []);

  const filtered = media.filter((m) => {
    if (filter !== "all" && m.resourceType !== filter) return false;
    if (search && !m.publicId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleUpload = async (type: "image" | "video") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = type === "image" ? "image/*" : "video/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const endpoint = type === "image" ? ENDPOINTS.UPLOAD_IMAGE : ENDPOINTS.UPLOAD_VIDEO;
      const token = localStorage.getItem("suntrix_token");
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        toast({ title: "Uploaded ✅", description: `${file.name} uploaded to Cloudinary` });
        reload();
      } catch {
        toast({ title: "Upload failed", description: "Check your Cloudinary config" });
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const handleDelete = async (publicId: string, _id: string) => {
    const encodedId = btoa(publicId);
    const { error } = await apiRequest(ENDPOINTS.UPLOAD_DELETE(encodedId), { method: "DELETE" });
    if (error) toast({ title: "Error", description: error });
    else {
      setMedia((prev) => prev.filter((m) => m._id !== _id));
      toast({ title: "Deleted" });
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Copied!", description: "URL copied to clipboard" });
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Media Library</h1>
          <p className="text-sm text-muted-foreground">Cloudinary-backed media — changes sync live across the website</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleUpload("image")} disabled={uploading} className="gradient-bg flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload Image"}
          </button>
          <button onClick={() => handleUpload("video")} disabled={uploading} className="border border-border flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-60">
            <Video className="h-4 w-4" /> Upload Video
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by public ID..."
            className="w-full rounded-lg border border-border bg-muted/50 pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        {(["all", "image", "video"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize transition-colors ${filter === f ? "gradient-bg text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {f}
          </button>
        ))}
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} assets</span>
      </div>

      {/* Grid */}
      {media.length === 0 ? (
        <div className="py-20 text-center rounded-xl border border-dashed border-border">
          <Image className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-1">No media uploaded yet</p>
          <p className="text-xs text-muted-foreground/60">Upload images or videos to see them here</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div key={item._id} className="rounded-xl border border-border bg-card overflow-hidden group">
              <div className="aspect-video bg-muted/50 relative overflow-hidden cursor-pointer" onClick={() => setPreviewUrl(item.secureUrl || item.url)}>
                {item.resourceType === "image" ? (
                  <img src={item.secureUrl || item.url} alt={item.publicId} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); copyUrl(item.secureUrl || item.url); }}
                    className="h-8 w-8 rounded-lg bg-muted text-foreground flex items-center justify-center hover:bg-muted/80">
                    <Copy className="h-4 w-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(item.publicId, item._id); }}
                    className="h-8 w-8 rounded-lg bg-destructive/20 text-destructive flex items-center justify-center hover:bg-destructive/30">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <span className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-md px-1.5 py-0.5 text-[10px] font-mono text-foreground uppercase">
                  {item.format || item.resourceType}
                </span>
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold text-foreground truncate">{item.publicId.split("/").pop()}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-[10px] text-muted-foreground">{formatBytes(item.bytes)}</p>
                  {item.width && <p className="text-[10px] text-muted-foreground">{item.width}×{item.height}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm" onClick={() => setPreviewUrl(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full mx-4">
            <button onClick={() => setPreviewUrl(null)} className="absolute -top-10 right-0 text-muted-foreground hover:text-foreground">
              <X className="h-6 w-6" />
            </button>
            <img src={previewUrl} alt="Preview" className="w-full max-h-[85vh] object-contain rounded-xl" />
            <button onClick={() => copyUrl(previewUrl)} className="absolute bottom-4 right-4 flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-muted">
              <CheckCircle className="h-3.5 w-3.5 text-primary" /> Copy URL
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMedia;
