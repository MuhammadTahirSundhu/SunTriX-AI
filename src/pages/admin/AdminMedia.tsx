import { useState, useEffect } from "react";
import { Image, Video, Upload, Trash2, Copy, Search, X, Link2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { mediaStore, type MediaEntry } from "@/lib/cms-store";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: "image" | "video";
  usedIn: string;
  mediaKey: string; // links to mediaStore registry
  uploadedAt: string;
}

const MEDIA_KEY = "suntrix_media";

function getMedia(): MediaItem[] {
  try { return JSON.parse(localStorage.getItem(MEDIA_KEY) || "[]"); } catch { return []; }
}
function setMedia(items: MediaItem[]) { localStorage.setItem(MEDIA_KEY, JSON.stringify(items)); }

const SEED_MEDIA: Omit<MediaItem, "id" | "uploadedAt">[] = [
  { name: "Hero Banner", url: "/src/assets/hero-banner.png", type: "image", usedIn: "Homepage Hero", mediaKey: "hero-banner" },
  { name: "CEO Portrait", url: "/src/assets/ceo-portrait.png", type: "image", usedIn: "About Page", mediaKey: "ceo-portrait" },
  { name: "SunTriX Logo", url: "/src/assets/suntrix-logo.png", type: "image", usedIn: "Navbar & Footer", mediaKey: "suntrix-logo" },
  { name: "Workflow Pipeline", url: "/src/assets/workflow-pipeline.png", type: "image", usedIn: "How We Work", mediaKey: "workflow-pipeline" },
  { name: "Video Demo Thumbnail", url: "/src/assets/video-demo-thumb.png", type: "image", usedIn: "Video Demos", mediaKey: "video-demo-thumb" },
  { name: "About Hero", url: "/src/assets/about-hero.png", type: "image", usedIn: "About Page", mediaKey: "about-hero" },
  { name: "Services Hero", url: "/src/assets/services-hero.png", type: "image", usedIn: "Services Page", mediaKey: "services-hero" },
  { name: "Workflow Hero", url: "/src/assets/workflow-hero.png", type: "image", usedIn: "How We Work", mediaKey: "workflow-hero" },
  { name: "Dept Agents", url: "/src/assets/dept-agents.png", type: "image", usedIn: "Departments Section", mediaKey: "dept-agents" },
  { name: "Dept Intelligence", url: "/src/assets/dept-intelligence.png", type: "image", usedIn: "Departments Section", mediaKey: "dept-intelligence" },
  { name: "Dept Vision", url: "/src/assets/dept-vision.png", type: "image", usedIn: "Departments Section", mediaKey: "dept-vision" },
  { name: "Dept Platform", url: "/src/assets/dept-platform.png", type: "image", usedIn: "Departments Section", mediaKey: "dept-platform" },
  { name: "Portfolio Agents", url: "/src/assets/portfolio-agents.png", type: "image", usedIn: "Portfolio", mediaKey: "portfolio-agents" },
  { name: "Portfolio ML", url: "/src/assets/portfolio-ml.png", type: "image", usedIn: "Portfolio", mediaKey: "portfolio-ml" },
  { name: "Portfolio Vision", url: "/src/assets/portfolio-vision.png", type: "image", usedIn: "Portfolio", mediaKey: "portfolio-vision" },
  { name: "Portfolio SaaS", url: "/src/assets/portfolio-saas.png", type: "image", usedIn: "Portfolio", mediaKey: "portfolio-saas" },
  { name: "Portfolio Support", url: "/src/assets/portfolio-support.png", type: "image", usedIn: "Portfolio", mediaKey: "portfolio-support" },
  { name: "Portfolio Surveillance", url: "/src/assets/portfolio-surveillance.png", type: "image", usedIn: "Portfolio", mediaKey: "portfolio-surveillance" },
];

const AdminMedia = () => {
  const [media, setMediaState] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [editItem, setEditItem] = useState<MediaItem | null>(null);
  const [editUrl, setEditUrl] = useState("");

  useEffect(() => {
    let items = getMedia();
    if (items.length === 0) {
      items = SEED_MEDIA.map((m, i) => ({
        ...m,
        id: `media_${Date.now()}_${i}`,
        uploadedAt: new Date().toISOString(),
      }));
      setMedia(items);
    }
    // Migrate old items without mediaKey
    items = items.map((item) => {
      if (!item.mediaKey) {
        const seed = SEED_MEDIA.find((s) => s.name === item.name);
        return { ...item, mediaKey: seed?.mediaKey || "" };
      }
      return item;
    });
    setMedia(items);
    setMediaState(items);
  }, []);

  const filtered = media.filter((m) => {
    if (filter !== "all" && m.type !== filter) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const newItem: MediaItem = {
          id: `media_${Date.now()}`,
          name: file.name,
          url: reader.result as string,
          type: file.type.startsWith("video") ? "video" : "image",
          usedIn: "Unassigned",
          mediaKey: "",
          uploadedAt: new Date().toISOString(),
        };
        const updated = [...media, newItem];
        setMedia(updated);
        setMediaState(updated);
        toast({ title: "Uploaded", description: `${file.name} added to media library.` });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleDelete = (id: string) => {
    const updated = media.filter((m) => m.id !== id);
    setMedia(updated);
    setMediaState(updated);
    toast({ title: "Deleted", description: "Media item removed." });
  };

  const handleUpdateUrl = () => {
    if (!editItem) return;
    const updated = media.map((m) => m.id === editItem.id ? { ...m, url: editUrl } : m);
    setMedia(updated);
    setMediaState(updated);

    // Sync to mediaStore so all components update live
    if (editItem.mediaKey) {
      mediaStore.update(editItem.mediaKey, editUrl);
    }

    setEditItem(null);
    toast({ title: "Updated", description: editItem.mediaKey ? "Media updated — changes reflected across the website instantly." : "Media URL updated." });
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Copied", description: "URL copied to clipboard." });
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Media Library</h1>
          <p className="text-sm text-muted-foreground">Manage all images and videos — changes sync live across the website</p>
        </div>
        <button onClick={handleUpload} className="gradient-bg flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-primary-foreground">
          <Upload className="h-4 w-4" /> Upload
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search media..."
            className="w-full rounded-lg border border-border bg-muted/50 pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        {(["all", "image", "video"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize transition-colors ${filter === f ? "gradient-bg text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="rounded-xl border border-border bg-card overflow-hidden group">
            <div className="aspect-video bg-muted/50 relative overflow-hidden">
              {item.type === "image" ? (
                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="h-10 w-10 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => { setEditItem(item); setEditUrl(item.url); }}
                  className="h-8 w-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/30">
                  <Image className="h-4 w-4" />
                </button>
                <button onClick={() => copyUrl(item.url)}
                  className="h-8 w-8 rounded-lg bg-muted text-foreground flex items-center justify-center hover:bg-muted/80">
                  <Copy className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(item.id)}
                  className="h-8 w-8 rounded-lg bg-destructive/20 text-destructive flex items-center justify-center hover:bg-destructive/30">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <span className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-md px-1.5 py-0.5 text-[10px] font-mono text-foreground uppercase">
                {item.type}
              </span>
            </div>
            <div className="p-3">
              <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <p className="text-[10px] text-muted-foreground">Used in: {item.usedIn}</p>
                {item.mediaKey && <Link2 className="h-2.5 w-2.5 text-primary" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setEditItem(null)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground">Update Media: {editItem.name}</h3>
              <button onClick={() => setEditItem(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="aspect-video bg-muted/50 rounded-lg overflow-hidden mb-4">
              <img src={editUrl || editItem.url} alt="" className="w-full h-full object-cover" />
            </div>
            {editItem.mediaKey && (
              <div className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-lg bg-primary/5 border border-primary/20">
                <Link2 className="h-3.5 w-3.5 text-primary shrink-0" />
                <p className="text-[11px] text-primary">Connected to <span className="font-bold">{editItem.mediaKey}</span> — changes update live across the website</p>
              </div>
            )}
            <label className="text-xs text-muted-foreground">Image/Video URL</label>
            <input value={editUrl} onChange={(e) => setEditUrl(e.target.value)}
              className="w-full mt-1 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            <p className="text-[10px] text-muted-foreground mt-1 mb-4">Paste an external URL (Cloudinary, Unsplash, etc.)</p>
            <div className="flex gap-2">
              <button onClick={handleUpdateUrl} className="flex-1 gradient-bg rounded-lg py-2 text-sm font-semibold text-primary-foreground">Save & Sync</button>
              <button onClick={() => setEditItem(null)} className="flex-1 border border-border rounded-lg py-2 text-sm text-foreground hover:bg-muted transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMedia;
