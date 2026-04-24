import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import { Upload, Trash2, Search, Copy, Check, Image, Film, FileText, Grid3X3, List, X, FolderOpen } from "lucide-react";
import { BulkActionBar } from "@/components/admin/BulkActionBar";

type AssetType = "all" | "image" | "video" | "document";

interface Asset {
  _id: string;
  publicId: string;
  url: string;
  thumbnailUrl?: string;
  name: string;
  type: "image" | "video" | "document";
  size: number;
  width?: number;
  height?: number;
  createdAt: string;
  folder?: string;
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const typeIcon = (type: string) => {
  if (type === "video") return <Film className="h-4 w-4 text-purple-400" />;
  if (type === "document") return <FileText className="h-4 w-4 text-blue-400" />;
  return <Image className="h-4 w-4 text-emerald-400" />;
};

const AdminMedia = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<AssetType>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [preview, setPreview] = useState<Asset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetch_ = async () => {
    setLoading(true);
    const { data } = await apiRequest<any[]>(ENDPOINTS.UPLOAD_LIST);
    if (data) {
      setAssets(data.map(d => ({
        ...d,
        name: d.publicId.split("/").pop() || d.publicId,
        type: d.resourceType === "video" ? "video" : "image",
        size: d.bytes || 0
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetch_(); }, []);

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("auth_token");
      await fetch(ENDPOINTS.UPLOAD_IMAGE, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
    }
    setUploading(false);
    fetch_();
  };

  const handleDelete = async (id: string, publicId: string) => {
    if (!window.confirm("Delete this asset?")) return;
    await apiRequest(ENDPOINTS.UPLOAD_DELETE(publicId), { method: "DELETE" });
    fetch_();
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.size} assets?`)) return;
    const ids = Array.from(selectedIds);
    const publicIds = assets.filter(a => ids.includes(a._id)).map(a => a.publicId);
    await apiRequest(ENDPOINTS.UPLOAD_BULK_DELETE, { method: "DELETE", body: { publicIds } });
    setSelectedIds(new Set());
    fetch_();
  };

  const copyUrl = (asset: Asset) => {
    navigator.clipboard.writeText(asset.url);
    setCopiedId(asset._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const filtered = assets.filter(a => {
    const assetName = a.name || a.publicId || "Unknown";
    const matchSearch = assetName.toLowerCase().includes(search.toLowerCase()) || (a.folder || "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || a.type === filterType;
    return matchSearch && matchType;
  });

  const tabs: { key: AssetType; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "All", icon: <FolderOpen className="h-4 w-4" /> },
    { key: "image", label: "Images", icon: <Image className="h-4 w-4" /> },
    { key: "video", label: "Videos", icon: <Film className="h-4 w-4" /> },
    { key: "document", label: "Docs", icon: <FileText className="h-4 w-4" /> },
  ];

  const bulkActions = [{ label: "Delete Selected", icon: Trash2, variant: "danger" as const, onClick: handleBulkDelete }];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Media Library</h1>
          <p className="text-sm text-muted-foreground">{assets.length} assets · Click to copy URL</p>
        </div>
        <div className="flex items-center gap-3">
          <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx" className="hidden" onChange={(e) => e.target.files && handleUpload(e.target.files)} />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
            <Upload className="h-4 w-4" />{uploading ? "Uploading..." : "Upload Files"}
          </button>
        </div>
      </div>

      {/* Type Tabs + Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex bg-muted/50 p-1 rounded-lg border border-border gap-0.5">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setFilterType(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filterType === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assets..." className="rounded-lg border border-border bg-muted/50 pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="flex bg-muted/50 p-1 rounded-lg border border-border">
            <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Upload Drop Zone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); e.dataTransfer.files && handleUpload(e.dataTransfer.files); }}
        className="mb-5 border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary mx-auto mb-2 transition-colors" />
        <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
          Drop files here or <span className="text-primary font-medium">click to browse</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">Images, videos, PDFs supported</p>
      </div>

      {/* Grid View */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No assets found</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map(asset => (
            <motion.div key={asset._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className={`relative group bg-card border rounded-xl overflow-hidden cursor-pointer transition-all hover:border-primary/50 ${selectedIds.has(asset._id) ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
              onClick={() => setPreview(asset)}
            >
              {/* Select */}
              <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => { e.stopPropagation(); toggleSelect(asset._id); }}>
                <div className={`h-5 w-5 rounded border-2 flex items-center justify-center bg-card ${selectedIds.has(asset._id) ? "bg-primary border-primary" : "border-muted-foreground"}`}>
                  {selectedIds.has(asset._id) && <Check className="h-3 w-3 text-white" />}
                </div>
              </div>

              {/* Quick actions */}
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button onClick={e => { e.stopPropagation(); copyUrl(asset); }} className="h-6 w-6 bg-card/90 backdrop-blur-sm rounded border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-colors">
                  {copiedId === asset._id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </button>
                <button onClick={e => { e.stopPropagation(); handleDelete(asset._id, asset.publicId); }} className="h-6 w-6 bg-card/90 backdrop-blur-sm rounded border border-border flex items-center justify-center hover:bg-destructive hover:text-white hover:border-destructive transition-colors">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>

              {/* Thumbnail */}
              <div className="aspect-square bg-muted/50 flex items-center justify-center">
                {asset.type === "image" ? (
                  <img src={asset.thumbnailUrl || asset.url} alt={asset.name} className="w-full h-full object-cover" />
                ) : asset.type === "video" ? (
                  <div className="flex flex-col items-center gap-1 text-purple-400">
                    <Film className="h-8 w-8" />
                    <span className="text-xs">Video</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-blue-400">
                    <FileText className="h-8 w-8" />
                    <span className="text-xs">Doc</span>
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="p-2">
                <p className="text-xs text-foreground font-medium truncate">{asset.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(asset.size)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 w-10" />
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Asset</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Size</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(asset => (
                <tr key={asset._id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <button onClick={() => toggleSelect(asset._id)} className="text-muted-foreground hover:text-primary">
                      <div className={`h-4 w-4 rounded border-2 flex items-center justify-center ${selectedIds.has(asset._id) ? "bg-primary border-primary" : "border-muted-foreground"}`}>
                        {selectedIds.has(asset._id) && <div className="h-2 w-2 bg-white rounded-sm" />}
                      </div>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-14 bg-muted rounded-md overflow-hidden shrink-0 flex items-center justify-center">
                        {asset.type === "image" ? (
                          <img src={asset.thumbnailUrl || asset.url} alt="" className="h-full w-full object-cover" />
                        ) : typeIcon(asset.type)}
                      </div>
                      <p className="font-medium text-foreground text-sm truncate max-w-[200px]">{asset.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      {typeIcon(asset.type)} {asset.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm text-muted-foreground">{formatBytes(asset.size)}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{new Date(asset.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => copyUrl(asset)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Copy URL">
                        {copiedId === asset._id ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                      </button>
                      <button onClick={() => handleDelete(asset._id, asset.publicId)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Lightbox */}
      <AnimatePresence>
        {preview && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreview(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
              <div className="pointer-events-auto max-w-2xl w-full bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    {typeIcon(preview.type)}
                    <span className="font-medium text-foreground text-sm truncate max-w-[300px]">{preview.name}</span>
                  </div>
                  <button onClick={() => setPreview(null)} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {preview.type === "image" && (
                  <div className="bg-muted/20 flex items-center justify-center p-4 max-h-[400px]">
                    <img src={preview.url} alt={preview.name} className="max-h-[360px] max-w-full object-contain rounded-lg" />
                  </div>
                )}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-3">
                    <input readOnly value={preview.url} className="flex-1 bg-transparent text-xs text-muted-foreground outline-none font-mono" />
                    <button onClick={() => copyUrl(preview)} className="shrink-0 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity flex items-center gap-1">
                      {copiedId === preview._id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedId === preview._id ? "Copied!" : "Copy URL"}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
                    <div><span className="font-medium text-foreground block">Size</span>{formatBytes(preview.size)}</div>
                    {preview.width && <div><span className="font-medium text-foreground block">Dimensions</span>{preview.width}×{preview.height}px</div>}
                    <div><span className="font-medium text-foreground block">Uploaded</span>{new Date(preview.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BulkActionBar selectedCount={selectedIds.size} onClear={() => setSelectedIds(new Set())} actions={bulkActions} />
    </div>
  );
};

export default AdminMedia;
