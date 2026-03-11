import { useState, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Plus, Trash2, Save, GripVertical, Eye, EyeOff, ChevronDown, ChevronUp, Edit2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PageSection {
  id: string;
  type: "hero" | "text" | "image" | "video" | "cta" | "features" | "gallery" | "custom";
  title: string;
  content: Record<string, string>;
  enabled: boolean;
  order: number;
}

interface PageConfig {
  slug: string;
  label: string;
  sections: PageSection[];
}

const PAGES_KEY = "suntrix_pages";

const DEFAULT_PAGES: PageConfig[] = [
  { slug: "home", label: "Home", sections: [] },
  { slug: "about", label: "About", sections: [] },
  { slug: "contact", label: "Contact", sections: [] },
  { slug: "services", label: "Services Overview", sections: [] },
  { slug: "how-we-work", label: "How We Work", sections: [] },
  { slug: "technologies", label: "Technologies", sections: [] },
];

const pagesStore = {
  getAll(): PageConfig[] {
    try {
      const data = localStorage.getItem(PAGES_KEY);
      return data ? JSON.parse(data) : DEFAULT_PAGES;
    } catch { return DEFAULT_PAGES; }
  },
  save(pages: PageConfig[]) { localStorage.setItem(PAGES_KEY, JSON.stringify(pages)); },
  getPage(slug: string): PageConfig {
    return this.getAll().find((p) => p.slug === slug) || { slug, label: slug, sections: [] };
  },
};

const SECTION_TYPES: { type: PageSection["type"]; label: string }[] = [
  { type: "hero", label: "Hero Banner" },
  { type: "text", label: "Text Block" },
  { type: "image", label: "Image Section" },
  { type: "video", label: "Video Embed" },
  { type: "cta", label: "Call to Action" },
  { type: "features", label: "Features Grid" },
  { type: "gallery", label: "Image Gallery" },
  { type: "custom", label: "Custom HTML" },
];

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const AdminPages = () => {
  const [pages, setPages] = useState<PageConfig[]>(pagesStore.getAll());
  const [activePage, setActivePage] = useState("home");
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const page = pages.find((p) => p.slug === activePage) || pages[0];

  const updatePage = (updatedPage: PageConfig) => {
    const updated = pages.map((p) => (p.slug === updatedPage.slug ? updatedPage : p));
    setPages(updated);
    pagesStore.save(updated);
  };

  const addSection = (type: PageSection["type"]) => {
    const section: PageSection = {
      id: generateId(),
      type,
      title: SECTION_TYPES.find((t) => t.type === type)?.label || "Section",
      content: { heading: "", description: "", imageUrl: "", videoUrl: "", buttonText: "", buttonLink: "" },
      enabled: true,
      order: page.sections.length,
    };
    updatePage({ ...page, sections: [...page.sections, section] });
    setEditingSection(section.id);
    toast({ title: "Section added" });
  };

  const deleteSection = (id: string) => {
    updatePage({ ...page, sections: page.sections.filter((s) => s.id !== id) });
    toast({ title: "Section deleted" });
  };

  const toggleSection = (id: string) => {
    updatePage({
      ...page,
      sections: page.sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    });
  };

  const updateSectionContent = (id: string, key: string, value: string) => {
    updatePage({
      ...page,
      sections: page.sections.map((s) =>
        s.id === id ? { ...s, content: { ...s.content, [key]: value } } : s
      ),
    });
  };

  const updateSectionTitle = (id: string, title: string) => {
    updatePage({
      ...page,
      sections: page.sections.map((s) => (s.id === id ? { ...s, title } : s)),
    });
  };

  const reorderSections = (newOrder: PageSection[]) => {
    updatePage({ ...page, sections: newOrder.map((s, i) => ({ ...s, order: i })) });
  };

  const inputCls = "w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">Page Manager</h1>
        <p className="text-sm text-muted-foreground">Add, edit, delete, and reorder sections for each page</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Page list */}
        <div className="space-y-1">
          {pages.map((p) => (
            <button
              key={p.slug}
              onClick={() => { setActivePage(p.slug); setEditingSection(null); }}
              className={`w-full text-left rounded-lg px-4 py-2.5 text-sm transition-colors ${
                activePage === p.slug
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {p.label}
              <span className="ml-2 text-[10px] text-muted-foreground">({p.sections.length})</span>
            </button>
          ))}
        </div>

        {/* Sections */}
        <div className="lg:col-span-3 space-y-4">
          {/* Add section */}
          <div className="flex flex-wrap gap-2 mb-4">
            {SECTION_TYPES.map((st) => (
              <button
                key={st.type}
                onClick={() => addSection(st.type)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                <Plus className="h-3 w-3" /> {st.label}
              </button>
            ))}
          </div>

          <Reorder.Group axis="y" values={page.sections} onReorder={reorderSections} className="space-y-3">
            {page.sections.map((section) => (
              <Reorder.Item key={section.id} value={section}>
                <motion.div layout className="rounded-xl border border-border bg-card overflow-hidden">
                  {/* Section header */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab" />
                    <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                      section.type === "hero" ? "bg-primary/20 text-primary" :
                      section.type === "cta" ? "bg-secondary/20 text-secondary" :
                      "bg-muted text-muted-foreground"
                    }`}>{section.type}</span>
                    <input
                      value={section.title}
                      onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                      className="flex-1 bg-transparent text-sm font-medium text-foreground focus:outline-none"
                    />
                    <button onClick={() => toggleSection(section.id)} className={section.enabled ? "text-success" : "text-muted-foreground"}>
                      {section.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => setEditingSection(editingSection === section.id ? null : section.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteSection(section.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Section editor */}
                  <AnimatePresence>
                    {editingSection === section.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border px-4 py-4 space-y-3 overflow-hidden"
                      >
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Heading</label>
                          <input value={section.content.heading || ""} onChange={(e) => updateSectionContent(section.id, "heading", e.target.value)} className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                          <textarea value={section.content.description || ""} onChange={(e) => updateSectionContent(section.id, "description", e.target.value)} rows={3} className={inputCls + " resize-none"} />
                        </div>
                        {(section.type === "image" || section.type === "hero" || section.type === "gallery") && (
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Image URL</label>
                            <input value={section.content.imageUrl || ""} onChange={(e) => updateSectionContent(section.id, "imageUrl", e.target.value)} className={inputCls} />
                          </div>
                        )}
                        {section.type === "video" && (
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Video URL (YouTube/Vimeo)</label>
                            <input value={section.content.videoUrl || ""} onChange={(e) => updateSectionContent(section.id, "videoUrl", e.target.value)} className={inputCls} />
                          </div>
                        )}
                        {(section.type === "cta" || section.type === "hero") && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-1">Button Text</label>
                              <input value={section.content.buttonText || ""} onChange={(e) => updateSectionContent(section.id, "buttonText", e.target.value)} className={inputCls} />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-1">Button Link</label>
                              <input value={section.content.buttonLink || ""} onChange={(e) => updateSectionContent(section.id, "buttonLink", e.target.value)} className={inputCls} />
                            </div>
                          </div>
                        )}
                        {section.type === "custom" && (
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Custom HTML</label>
                            <textarea value={section.content.html || ""} onChange={(e) => updateSectionContent(section.id, "html", e.target.value)} rows={6} className={inputCls + " resize-none font-mono text-xs"} />
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          {page.sections.length === 0 && (
            <div className="text-center py-16 rounded-xl border border-dashed border-border">
              <p className="text-muted-foreground text-sm">No sections yet. Add one above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPages;
