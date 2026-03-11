import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Search as SearchIcon, Globe } from "lucide-react";
import { seoStore, type SEOSettings } from "@/lib/cms-store";
import { toast } from "@/hooks/use-toast";

const PAGES = [
  { slug: "home", label: "Home" },
  { slug: "services", label: "Services Overview" },
  { slug: "agentic-ai", label: "Agentic AI" },
  { slug: "ai-ml", label: "AI & ML" },
  { slug: "computer-vision", label: "Computer Vision" },
  { slug: "saas-platform", label: "SaaS Platform" },
  { slug: "portfolio", label: "Portfolio" },
  { slug: "about", label: "About" },
  { slug: "contact", label: "Contact" },
  { slug: "how-we-work", label: "How We Work" },
  { slug: "technologies", label: "Technologies" },
  { slug: "testimonials", label: "Testimonials" },
];

const AdminSEO = () => {
  const [activePage, setActivePage] = useState("home");
  const [form, setForm] = useState({ title: "", description: "", keywords: "", ogImage: "" });

  useEffect(() => {
    const seo = seoStore.getByPage(activePage);
    setForm({
      title: seo?.title || "",
      description: seo?.description || "",
      keywords: seo?.keywords || "",
      ogImage: seo?.ogImage || "",
    });
  }, [activePage]);

  const save = () => {
    seoStore.upsert(activePage, form);
    toast({ title: `SEO saved for ${PAGES.find((p) => p.slug === activePage)?.label}` });
  };

  const inputCls = "w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">SEO Settings</h1>
        <p className="text-sm text-muted-foreground">Manage meta tags for each page</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Page list */}
        <div className="space-y-1">
          {PAGES.map((page) => (
            <button
              key={page.slug}
              onClick={() => setActivePage(page.slug)}
              className={`w-full text-left rounded-lg px-4 py-2.5 text-sm transition-colors ${
                activePage === page.slug
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {page.label}
            </button>
          ))}
        </div>

        {/* SEO form */}
        <motion.div key={activePage} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">{PAGES.find((p) => p.slug === activePage)?.label}</h2>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Meta Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="Page title for search engines" />
            <p className="text-[10px] text-muted-foreground mt-1">{form.title.length}/60 characters</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Meta Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inputCls + " resize-none"} placeholder="Page description for search results" />
            <p className="text-[10px] text-muted-foreground mt-1">{form.description.length}/160 characters</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Keywords</label>
            <input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} className={inputCls} placeholder="keyword1, keyword2, keyword3" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">OG Image URL</label>
            <input value={form.ogImage} onChange={(e) => setForm({ ...form, ogImage: e.target.value })} className={inputCls} placeholder="https://..." />
          </div>

          {/* Preview */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider">Search Preview</p>
            <p className="text-sm font-medium text-primary truncate">{form.title || "Page Title"}</p>
            <p className="text-xs text-success truncate">suntrix.com/{activePage === "home" ? "" : activePage}</p>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{form.description || "Page description will appear here..."}</p>
          </div>

          <div className="flex justify-end">
            <button onClick={save} className="gradient-bg inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              <Save className="h-4 w-4" /> Save SEO Settings
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminSEO;
