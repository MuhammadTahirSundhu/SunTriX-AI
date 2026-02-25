import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { portfolioStore, type PortfolioProject } from "@/lib/cms-store";
import { toast } from "@/hooks/use-toast";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Star, StarOff, X, Save,
  GripVertical, ExternalLink, Image as ImageIcon
} from "lucide-react";

const CATEGORIES = ["Agentic AI", "AI & ML", "Computer Vision", "SaaS Platform"];

const AdminPortfolio = () => {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [editing, setEditing] = useState<PortfolioProject | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [filter, setFilter] = useState("all");

  const reload = () => setProjects(portfolioStore.getAll());
  useEffect(reload, []);

  const filtered = filter === "all" ? projects : projects.filter((p) =>
    filter === "published" ? p.status === "published" :
    filter === "draft" ? p.status === "draft" :
    filter === "featured" ? p.featured : true
  );

  const handleNew = () => {
    setIsNew(true);
    setEditing({
      id: "", title: "", slug: "", category: CATEGORIES[0],
      description: "", shortDescription: "", metric: "", metricLabel: "",
      coverImage: "", images: [], videoUrl: "", tags: [], tools: [],
      clientLogo: "", clientName: "", industry: "", highlights: [],
      status: "draft", featured: false, order: projects.length + 1,
      createdAt: "", updatedAt: "",
    });
  };

  const handleSave = () => {
    if (!editing) return;
    if (!editing.title) { toast({ title: "Title required" }); return; }

    const slug = editing.slug || editing.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (isNew) {
      portfolioStore.create({ ...editing, slug });
      toast({ title: "Project created" });
    } else {
      portfolioStore.update(editing.id, { ...editing, slug });
      toast({ title: "Project updated" });
    }
    setEditing(null);
    setIsNew(false);
    reload();
  };

  const handleDelete = (id: string) => {
    portfolioStore.delete(id);
    toast({ title: "Project deleted" });
    reload();
  };

  const toggleStatus = (p: PortfolioProject) => {
    portfolioStore.update(p.id, { status: p.status === "published" ? "draft" : "published" });
    reload();
  };

  const toggleFeatured = (p: PortfolioProject) => {
    portfolioStore.update(p.id, { featured: !p.featured });
    reload();
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
            {f.charAt(0).toUpperCase() + f.slice(1)} {f !== "all" && `(${projects.filter((p) =>
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
            key={project.id}
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
                }`}>
                  {project.status}
                </span>
                {project.featured && (
                  <span className="text-xs rounded-full bg-gold/20 text-gold px-2 py-0.5 font-medium">★</span>
                )}
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
                <button onClick={() => { setEditing(project); setIsNew(false); }} className="flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                <button onClick={() => toggleStatus(project)} className="flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                  {project.status === "published" ? <><EyeOff className="h-3 w-3" /> Unpublish</> : <><Eye className="h-3 w-3" /> Publish</>}
                </button>
                <button onClick={() => toggleFeatured(project)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                  {project.featured ? <Star className="h-3.5 w-3.5 fill-gold text-gold" /> : <StarOff className="h-3.5 w-3.5" />}
                </button>
                <button onClick={() => handleDelete(project.id)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
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
                    <input
                      value={editing.title}
                      onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                      className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Slug</label>
                    <input
                      value={editing.slug}
                      onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                      placeholder="auto-generated"
                      className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
                    <select
                      value={editing.category}
                      onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                      className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Industry</label>
                    <input
                      value={editing.industry}
                      onChange={(e) => setEditing({ ...editing, industry: e.target.value })}
                      className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Metric Value</label>
                    <input
                      value={editing.metric}
                      onChange={(e) => setEditing({ ...editing, metric: e.target.value })}
                      placeholder="e.g. 10x"
                      className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Metric Label</label>
                    <input
                      value={editing.metricLabel}
                      onChange={(e) => setEditing({ ...editing, metricLabel: e.target.value })}
                      placeholder="e.g. Faster Processing"
                      className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Client Name</label>
                    <input
                      value={editing.clientName}
                      onChange={(e) => setEditing({ ...editing, clientName: e.target.value })}
                      className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Short Description</label>
                  <input
                    value={editing.shortDescription}
                    onChange={(e) => setEditing({ ...editing, shortDescription: e.target.value })}
                    className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Full Description</label>
                  <textarea
                    value={editing.description}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    rows={4}
                    className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Cover Image URL</label>
                    <input
                      value={editing.coverImage}
                      onChange={(e) => setEditing({ ...editing, coverImage: e.target.value })}
                      placeholder="Cloudinary URL or path"
                      className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Video URL</label>
                    <input
                      value={editing.videoUrl}
                      onChange={(e) => setEditing({ ...editing, videoUrl: e.target.value })}
                      placeholder="YouTube or Cloudinary URL"
                      className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Tags (comma separated)</label>
                  <input
                    value={editing.tags.join(", ")}
                    onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                    placeholder="React, Python, AWS"
                    className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Highlights (comma separated)</label>
                  <input
                    value={editing.highlights.join(", ")}
                    onChange={(e) => setEditing({ ...editing, highlights: e.target.value.split(",").map((h) => h.trim()).filter(Boolean) })}
                    placeholder="99% accuracy, 50K users"
                    className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
                    <select
                      value={editing.status}
                      onChange={(e) => setEditing({ ...editing, status: e.target.value as "published" | "draft" })}
                      className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editing.featured}
                        onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                        className="rounded border-border"
                      />
                      <span className="text-sm text-foreground">Featured Project</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                <button onClick={() => { setEditing(null); setIsNew(false); }} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} className="gradient-bg inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                  <Save className="h-4 w-4" /> {isNew ? "Create" : "Save Changes"}
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
