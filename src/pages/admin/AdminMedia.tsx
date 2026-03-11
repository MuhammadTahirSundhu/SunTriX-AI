import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Trash2, Copy, Image, Video, Search, Plus, X, Check, Link as LinkIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: "image" | "video";
  size: string;
  assignedTo: string;
  createdAt: string;
}

const MEDIA_KEY = "suntrix_media";

const mediaStore = {
  getAll(): MediaItem[] {
    try { return JSON.parse(localStorage.getItem(MEDIA_KEY) || "[]"); } catch { return []; }
  },
  add(item: MediaItem) {
    const all = this.getAll();
    all.unshift(item);
    localStorage.setItem(MEDIA_KEY, JSON.stringify(all));
  },
  delete(id: string) {
    const all = this.getAll().filter((m) => m.id !== id);
    localStorage.setItem(MEDIA_KEY, JSON.stringify(all));
  },
  update(id: string, updates: Partial<MediaItem>) {
    const all = this.getAll();
    const idx = all.findIndex((m) => m.id === id);
    if (idx !== -1) { all[idx] = { ...all[idx], ...updates }; localStorage.setItem(MEDIA_KEY, JSON.stringify(all)); }
  },
};

const AdminMedia = () => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadName, setUploadName] = useState("");
  const [uploadType, setUploadType] = useState<"image" | "video">("image");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setItems(mediaStore.getAll()); }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 2MB for localStorage. Use URL for larger files.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const item: MediaItem = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: file.name,
        url: reader.result as string,
        type: file.type.startsWith("video") ? "video" : "image",
        size: (file.size / 1024).toFixed(1) + " KB",
        assignedTo: "",
        createdAt: new Date().toISOString(),
      };
      mediaStore.add(item);
      setItems(mediaStore.getAll());
      toast({ title: "File uploaded" });
    };
    reader.readAsDataURL(file);
  };

  const addFromUrl = () => {
    if (!uploadUrl) return;
    const item: MediaItem = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: uploadName || uploadUrl.split("/").pop() || "media",
      url: uploadUrl,
      type: uploadType,
      size: "External",
      assignedTo: "",
      createdAt: new Date().toISOString(),
    };
    mediaStore.add(item);
    setItems(mediaStore.getAll());
    setUploadUrl("");
    setUploadName("");
    setShowUpload(false);
    toast({ title: "Media added" });
  };

  const deleteItem = (id: string) => {
    mediaStore.delete(id);
    setItems(mediaStore.getAll());
    toast({ title: "Media deleted" });
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "URL copied" });
  };

  const filtered = items
    .filter((m) => filter === "all" || m.type === filter)
    .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  const inputCls = "w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Media Library</h1>
          <p className="text-sm text-muted-foreground">Upload and manage images & videos</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
            <Upload className="h-4 w-4" /> Upload File
          </button>
          <button onClick={() => setShowUpload(true)} className="gradient-bg inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
            <Plus className="h-4 w-4" /> Add URL
          </button>
          <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileUpload} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search media..." className={inputCls + " pl-9"} />
        </div>
        {(["all", "image", "video"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === f ? "gradient-bg text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "All" : f === "image" ? "Images" : "Videos"}
          </button>
        ))}
      </div>

      {/* URL Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-border bg-card p-6 mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Add Media from URL</h3>
              <button onClick={() => setShowUpload(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <input value={uploadName} onChange={(e) => setUploadName(e.target.value)} placeholder="Name" className={inputCls} />
            <input value={uploadUrl} onChange={(e) => setUploadUrl(e.target.value)} placeholder="https://..." className={inputCls} />
            <div className="flex gap-2">
              {(["image", "video"] as const).map((t) => (
                <button key={t} onClick={() => setUploadType(t)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${uploadType === t ? "gradient-bg text-primary-foreground" : "border border-border text-muted-foreground"}`}>
                  {t === "image" ? "Image" : "Video"}
                </button>
              ))}
            </div>
            <button onClick={addFromUrl} className="gradient-bg inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-primary-foreground">
              <Check className="h-4 w-4" /> Add Media
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <motion.div key={item.id} layout className="rounded-xl border border-border bg-card overflow-hidden group">
            <div className="h-36 relative bg-muted">
              {item.type === "image" ? (
                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Video className="h-10 w-10 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => copyUrl(item.url)} className="p-1.5 rounded-lg bg-background/80 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Copy className="h-3 w-3" />
                </button>
                <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded-lg bg-background/80 text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <div className="absolute top-2 left-2">
                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${item.type === "image" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}`}>
                  {item.type === "image" ? <Image className="h-2.5 w-2.5" /> : <Video className="h-2.5 w-2.5" />}
                  {item.type}
                </span>
              </div>
            </div>
            <div className="p-3">
              <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
              <p className="text-[10px] text-muted-foreground">{item.size} • {new Date(item.createdAt).toLocaleDateString()}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Image className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground">No media files yet. Upload or add from URL.</p>
        </div>
      )}
    </div>
  );
};

export default AdminMedia;
