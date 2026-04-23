import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Star, StarOff, X, Save, Video, Image,
} from "lucide-react";

const CATEGORIES = ["Agentic AI", "AI & ML", "Computer Vision", "SaaS Platform"];

interface PortfolioProject {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  shortDescription: string;
  metric: string;
  metricLabel: string;
  coverImage: string;
  thumbnailImage: string;
  videoUrl: string;
  tags: string[];
  highlights: string[];
  tools: { name: string; icon: string }[];
  clientName: string;
  clientLogo: string;
  industry: string;
  displayType: "video" | "images";
  liveUrl: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

type EditState = Omit<PortfolioProject, "_id"> & { _id?: string };

const EMPTY_PROJECT: EditState = {
  title: "", slug: "", category: CATEGORIES[0],
  description: "", shortDescription: "", metric: "", metricLabel: "",
  coverImage: "", thumbnailImage: "", videoUrl: "", tags: [], tools: [],
  clientLogo: "", clientName: "", industry: "", highlights: [],
  status: "draft", featured: false, liveUrl: "", displayType: "video", order: 1,
  createdAt: "", updatedAt: "",
};

const AdminPortfolio = () => {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [filter, setFilter] = useState("all");
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    const { data } = await apiRequest<PortfolioProject[]>(ENDPOINTS.PORTFOLIO_LIST + "?all=true");
    if (data) setProjects(data);
  };

  useEffect(() => { reload(); }, []);

  const filtered = filter === "all" ? projects : projects.filter((p) =>
    filter === "published" ? p.status === "published" :
    filter === "draft" ? p.status === "draft" :
    filter === "featured" ? p.featured : true
  );

  const handleNew = () => {
    setIsNew(true);
    setEditing({ ...EMPTY_PROJECT, order: projects.length + 1 });
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.title) { toast({ title: "Title required" }); return; }
    setSaving(true);
    const slug = editing.slug || editing.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const body = { ...editing, slug };
    if (isNew) {
      const { error } = await apiRequest(ENDPOINTS.PORTFOLIO_CREATE, { method: "POST", body });
      if (error) { toast({ title: "Error", description: error }); }
      else toast({ title: "Project created ✅" });
    } else if (editing._id) {
      const { error } = await apiRequest(ENDPOINTS.PORTFOLIO_UPDATE(editing._id), { method: "PUT", body });
      if (error) { toast({ title: "Error", description: error }); }
      else toast({ title: "Project updated ✅" });
    }
    setSaving(false);
    setEditing(null);
    setIsNew(false);
    reload();
  };

  const handleDelete = async (id: string) => {
    await apiRequest(ENDPOINTS.PORTFOLIO_DELETE(id), { method: "DELETE" });
    toast({ title: "Project deleted" });
    reload();
  };

  const toggleStatus = async (p: PortfolioProject) => {
    await apiRequest(ENDPOINTS.PORTFOLIO_UPDATE(p._id), {
      method: "PUT",
      body: { status: p.status === "published" ? "draft" : "published" },
    });
    reload();
  };

  const toggleFeatured = async (p: PortfolioProject) => {
    await apiRequest(ENDPOINTS.PORTFOLIO_UPDATE(p._id), { method: "PUT", body: { featured: !p.featured } });
    reload();
  };

  const inp = "w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary";
  const btn = "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all";

  const UploadButton = ({ onUpload, onUploadMultiple, type = "image", multiple = false }: { 
    onUpload?: (url: string) => void, 
    onUploadMultiple?: (urls: string[]) => void,
    type?: "image" | "video",
    multiple?: boolean
  }) => {
    const [up, setUp] = useState(false);
    const handlePick = () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = type === "image" ? "image/*" : "video/*";
      input.multiple = multiple;
      input.onchange = async (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        if (files.length === 0) return;
        setUp(true);
        
        const token = localStorage.getItem("auth_token");
        const endpoint = type === "image" ? ENDPOINTS.UPLOAD_IMAGE : ENDPOINTS.UPLOAD_VIDEO;

        try {
          const uploadPromises = files.map(async (file) => {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch(endpoint, {
              method: "POST",
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              body: formData,
            });
            const data = await res.json();
            return data.secureUrl || data.url;
          });

          const urls = await Promise.all(uploadPromises);
          
          if (multiple && onUploadMultiple) {
            onUploadMultiple(urls);
          } else if (onUpload) {
            onUpload(urls[0]);
          }
          toast({ title: files.length > 1 ? `Uploaded ${files.length} files ✅` : "Uploaded ✅" });
        } catch {
          toast({ title: "Upload failed" });
        } finally { setUp(false); }
      };
      input.click();
    };
    return (
      <button onClick={handlePick} disabled={up} className={`${btn} bg-primary/10 text-primary hover:bg-primary/20 shrink-0`}>
        <Plus className="h-3 w-3" /> {up ? "..." : multiple ? "Upload Multiple" : "Upload"}
      </button>
    );
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Portfolio</h1>
          <p className="text-sm text-muted-foreground">Manage projects and case studies</p>
        </div>
        <button onClick={handleNew} className="gradient-bg inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" /> Add Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {["all", "published", "draft", "featured"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              filter === f ? "gradient-bg text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}{f !== "all" && ` (${projects.filter((p) =>
              f === "published" ? p.status === "published" :
              f === "draft" ? p.status === "draft" : p.featured
            ).length})`}
          </button>
        ))}
      </div>

      {/* Project Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((project) => (
          <motion.div
            key={project._id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-border bg-card overflow-hidden group"
          >
            <div className="h-36 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent flex items-center justify-center relative">
              {project.coverImage ? (
                <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-extrabold gradient-text">{project.metric}</span>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${
                  project.status === "published" ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                }`}>{project.status}</span>
                {project.featured && <span className="text-xs rounded-full bg-gold/20 text-gold px-2 py-0.5 font-medium">★</span>}
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs text-primary font-medium mb-1">{project.category}</p>
              <h3 className="text-sm font-bold text-foreground mb-1 line-clamp-1">{project.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{project.shortDescription}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {project.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-[10px] font-mono text-muted-foreground bg-muted rounded px-1.5 py-0.5">{tag}</span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 border-t border-border pt-3">
                <button onClick={() => { setEditing({ ...project, images: project.images || [] }); setIsNew(false); }} className="flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                <button onClick={() => toggleStatus(project)} className="flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                  {project.status === "published" ? <><EyeOff className="h-3 w-3" /> Unpublish</> : <><Eye className="h-3 w-3" /> Publish</>}
                </button>
                <button onClick={() => toggleFeatured(project)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                  {project.featured ? <Star className="h-3.5 w-3.5 fill-gold text-gold" /> : <StarOff className="h-3.5 w-3.5" />}
                </button>
                <button onClick={() => handleDelete(project._id)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground">
            No projects found. <button onClick={handleNew} className="text-primary underline ml-1">Add one</button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-10 overflow-y-auto"
            onClick={(e) => { if (e.target === e.currentTarget) { setEditing(null); setIsNew(false); } }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 mb-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">{isNew ? "New Project" : "Edit Project"}</h2>
                <button onClick={() => { setEditing(null); setIsNew(false); }} className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Title *</label>
                    <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Slug</label>
                    <input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="auto-generated" className={inp} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
                    <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className={inp}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Industry</label>
                    <input value={editing.industry} onChange={(e) => setEditing({ ...editing, industry: e.target.value })} className={inp} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Metric Value</label>
                    <input value={editing.metric} onChange={(e) => setEditing({ ...editing, metric: e.target.value })} placeholder="e.g. 10x" className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Metric Label</label>
                    <input value={editing.metricLabel} onChange={(e) => setEditing({ ...editing, metricLabel: e.target.value })} placeholder="e.g. Faster Processing" className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Client Name</label>
                    <input value={editing.clientName} onChange={(e) => setEditing({ ...editing, clientName: e.target.value })} className={inp} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Short Description</label>
                  <input value={editing.shortDescription} onChange={(e) => setEditing({ ...editing, shortDescription: e.target.value })} className={inp} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Full Description</label>
                  <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={4} className={inp + " resize-none"} />
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Project Media & Display</label>
                      <div className="flex gap-4 p-4 rounded-xl border border-border bg-muted/30">
                        {(["video", "images"] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => setEditing({ ...editing, displayType: t })}
                            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex flex-center gap-2 font-bold uppercase text-xs ${
                              editing.displayType === t 
                                ? "border-primary bg-primary/10 text-primary shadow-[0_0_20px_rgba(var(--primary),0.1)]" 
                                : "border-border bg-card text-muted-foreground hover:border-primary/50"
                            }`}
                          >
                            {t === "video" ? <Video className="h-4 w-4" /> : <Image className="h-4 w-4" />}
                            {t} Demo
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-1">
                        Cover Image URL
                        <UploadButton onUpload={(url) => setEditing({ ...editing, coverImage: url })} />
                      </label>
                      <input value={editing.coverImage} onChange={(e) => setEditing({ ...editing, coverImage: e.target.value })} placeholder="Cloudinary or external URL" className={inp} />
                    </div>
                    <div>
                      <label className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-1">
                        Thumbnail URL
                        <UploadButton onUpload={(url) => setEditing({ ...editing, thumbnailImage: url })} />
                      </label>
                      <input value={editing.thumbnailImage} onChange={(e) => setEditing({ ...editing, thumbnailImage: e.target.value })} placeholder="Card thumbnail" className={inp} />
                    </div>
                  </div>

                  {editing.displayType === "video" ? (
                    <div>
                      <label className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-1">
                        Demo Video URL
                        <UploadButton type="video" onUpload={(url) => setEditing({ ...editing, videoUrl: url })} />
                      </label>
                      <input value={editing.videoUrl} onChange={(e) => setEditing({ ...editing, videoUrl: e.target.value })} placeholder="YouTube or local video URL" className={inp} />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Project Gallery (Min 3, Max 6 images)</label>
                        <UploadButton 
                          multiple 
                          onUploadMultiple={(urls) => {
                            const newImgs = [...(editing.images || [])];
                            urls.forEach((url, i) => {
                              if (i < 6) newImgs[i] = url;
                            });
                            setEditing({ ...editing, images: newImgs });
                          }} 
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[0, 1, 2, 3, 4, 5].map((idx) => (
                          <div key={idx} className="relative aspect-video rounded-lg border border-border bg-muted/50 overflow-hidden group">
                            {(editing.images || [])[idx] ? (
                              <>
                                <img 
                                  src={editing.images[idx]} 
                                  alt={`Gallery ${idx + 1}`} 
                                  className="w-full h-full object-cover" 
                                />
                                <button
                                  onClick={() => {
                                    const newImgs = [...(editing.images || [])];
                                    newImgs[idx] = "";
                                    setEditing({ ...editing, images: newImgs });
                                  }}
                                  className="absolute top-1 right-1 p-1 rounded-full bg-background/80 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                                <div className="absolute bottom-0 inset-x-0 bg-background/60 backdrop-blur-sm py-1 text-[10px] text-center font-medium text-foreground">
                                  Img {idx + 1}
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px] font-medium">
                                Slot {idx + 1}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Live Project URL (Optional)</label>
                    <input value={editing.liveUrl} onChange={(e) => setEditing({ ...editing, liveUrl: e.target.value })} placeholder="https://external-project-link.com" className={inp} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Tags (comma separated)</label>
                  <input
                    value={editing.tags.join(", ")}
                    onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                    placeholder="React, Python, AWS"
                    className={inp}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Highlights (comma separated)</label>
                  <input
                    value={editing.highlights.join(", ")}
                    onChange={(e) => setEditing({ ...editing, highlights: e.target.value.split(",").map((h) => h.trim()).filter(Boolean) })}
                    placeholder="99% accuracy, 50K users"
                    className={inp}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
                    <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as "published" | "draft" })} className={inp}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} className="rounded border-border" />
                      <span className="text-sm text-foreground">Featured Project</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                <button onClick={() => { setEditing(null); setIsNew(false); }} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="gradient-bg inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
                  <Save className="h-4 w-4" /> {saving ? "Saving..." : isNew ? "Create" : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPortfolio;
