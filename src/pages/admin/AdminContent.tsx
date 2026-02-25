import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { heroStore, announcementStore, companyStore, testimonialStore, type HeroContent, type AnnouncementBar, type CompanyInfo, type TestimonialItem } from "@/lib/cms-store";
import { toast } from "@/hooks/use-toast";
import { Save, Globe, Megaphone, Building2, MessageSquareQuote, Plus, Trash2, Eye, EyeOff, ToggleLeft, ToggleRight } from "lucide-react";

type Tab = "hero" | "announcement" | "company" | "testimonials";

const AdminContent = () => {
  const [tab, setTab] = useState<Tab>("hero");
  const [hero, setHero] = useState<HeroContent>(heroStore.get());
  const [announcement, setAnnouncement] = useState<AnnouncementBar>(announcementStore.get());
  const [company, setCompany] = useState<CompanyInfo>(companyStore.get());
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);

  useEffect(() => { setTestimonials(testimonialStore.getAll()); }, []);

  const tabs: { key: Tab; label: string; icon: typeof Globe }[] = [
    { key: "hero", label: "Hero Section", icon: Globe },
    { key: "announcement", label: "Announcement Bar", icon: Megaphone },
    { key: "company", label: "Company Info", icon: Building2 },
    { key: "testimonials", label: "Testimonials", icon: MessageSquareQuote },
  ];

  const saveHero = () => { heroStore.update(hero); toast({ title: "Hero content saved" }); };
  const saveAnnouncement = () => { announcementStore.update(announcement); toast({ title: "Announcement saved" }); };
  const saveCompany = () => { companyStore.update(company); toast({ title: "Company info saved" }); };

  const deleteTestimonial = (id: string) => {
    testimonialStore.delete(id);
    setTestimonials(testimonialStore.getAll());
    toast({ title: "Testimonial deleted" });
  };

  const toggleTestimonialStatus = (t: TestimonialItem) => {
    testimonialStore.update(t.id, { status: t.status === "published" ? "draft" : "published" });
    setTestimonials(testimonialStore.getAll());
  };

  const addTestimonial = () => {
    testimonialStore.create({
      quote: "New testimonial...", name: "Client Name", role: "Role", company: "Company",
      avatar: "", rating: 5, featured: false, status: "draft",
    });
    setTestimonials(testimonialStore.getAll());
    toast({ title: "Testimonial added" });
  };

  const inputCls = "w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">Content Manager</h1>
        <p className="text-sm text-muted-foreground">Edit website content dynamically</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.key ? "gradient-bg text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Hero Section Editor */}
      {tab === "hero" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Badge Text</label>
            <input value={hero.badge} onChange={(e) => setHero({ ...hero, badge: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Headline Lines (one per line)</label>
            <textarea
              value={hero.headline.join("\n")}
              onChange={(e) => setHero({ ...hero, headline: e.target.value.split("\n") })}
              rows={4}
              className={inputCls + " resize-none"}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Gradient Words (comma separated)</label>
            <input value={hero.gradientWords.join(", ")} onChange={(e) => setHero({ ...hero, gradientWords: e.target.value.split(",").map((w) => w.trim()) })} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Subheadline</label>
            <textarea value={hero.subheadline} onChange={(e) => setHero({ ...hero, subheadline: e.target.value })} rows={2} className={inputCls + " resize-none"} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Primary CTA Text</label>
              <input value={hero.ctaPrimary.text} onChange={(e) => setHero({ ...hero, ctaPrimary: { ...hero.ctaPrimary, text: e.target.value } })} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Primary CTA Link</label>
              <input value={hero.ctaPrimary.link} onChange={(e) => setHero({ ...hero, ctaPrimary: { ...hero.ctaPrimary, link: e.target.value } })} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Trust Pills (comma separated)</label>
            <input value={hero.trustPills.join(", ")} onChange={(e) => setHero({ ...hero, trustPills: e.target.value.split(",").map((p) => p.trim()) })} className={inputCls} />
          </div>
          <div className="flex justify-end">
            <button onClick={saveHero} className="gradient-bg inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              <Save className="h-4 w-4" /> Save Hero
            </button>
          </div>
        </motion.div>
      )}

      {/* Announcement Bar Editor */}
      {tab === "announcement" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Announcement Bar</p>
            <button
              onClick={() => { const updated = announcementStore.toggle(); setAnnouncement(updated); toast({ title: updated.enabled ? "Enabled" : "Disabled" }); }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${announcement.enabled ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}
            >
              {announcement.enabled ? <><ToggleRight className="h-4 w-4" /> Enabled</> : <><ToggleLeft className="h-4 w-4" /> Disabled</>}
            </button>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Banner Text</label>
            <input value={announcement.text} onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Link URL</label>
              <input value={announcement.link} onChange={(e) => setAnnouncement({ ...announcement, link: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Link Text</label>
              <input value={announcement.linkText} onChange={(e) => setAnnouncement({ ...announcement, linkText: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={saveAnnouncement} className="gradient-bg inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              <Save className="h-4 w-4" /> Save Announcement
            </button>
          </div>
        </motion.div>
      )}

      {/* Company Info Editor */}
      {tab === "company" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Company Name</label>
              <input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
              <input value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Tagline</label>
            <input value={company.tagline} onChange={(e) => setCompany({ ...company, tagline: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
            <textarea value={company.description} onChange={(e) => setCompany({ ...company, description: e.target.value })} rows={3} className={inputCls + " resize-none"} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Phone</label>
              <input value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Address</label>
              <input value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={saveCompany} className="gradient-bg inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              <Save className="h-4 w-4" /> Save Company Info
            </button>
          </div>
        </motion.div>
      )}

      {/* Testimonials Manager */}
      {tab === "testimonials" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex justify-end">
            <button onClick={addTestimonial} className="gradient-bg inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4" /> Add Testimonial
            </button>
          </div>
          {testimonials.map((t) => (
            <div key={t.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 space-y-3">
                  <textarea
                    value={t.quote}
                    onChange={(e) => { testimonialStore.update(t.id, { quote: e.target.value }); setTestimonials(testimonialStore.getAll()); }}
                    rows={2}
                    className={inputCls + " resize-none"}
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      value={t.name}
                      onChange={(e) => { testimonialStore.update(t.id, { name: e.target.value }); setTestimonials(testimonialStore.getAll()); }}
                      placeholder="Name"
                      className={inputCls}
                    />
                    <input
                      value={t.role}
                      onChange={(e) => { testimonialStore.update(t.id, { role: e.target.value }); setTestimonials(testimonialStore.getAll()); }}
                      placeholder="Role"
                      className={inputCls}
                    />
                    <input
                      value={t.company}
                      onChange={(e) => { testimonialStore.update(t.id, { company: e.target.value }); setTestimonials(testimonialStore.getAll()); }}
                      placeholder="Company"
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <button onClick={() => toggleTestimonialStatus(t)} className={`p-1.5 rounded-lg transition-colors ${t.status === "published" ? "text-success" : "text-muted-foreground"}`}>
                    {t.status === "published" ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => deleteTestimonial(t.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default AdminContent;
