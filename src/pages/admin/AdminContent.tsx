import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import {
  Save, Globe, Megaphone, Building2, MessageSquareQuote,
  Plus, Trash2, Eye, EyeOff, ToggleLeft, ToggleRight, Video, Share2
} from "lucide-react";

type Tab = "hero" | "announcement" | "company" | "social" | "intro-video" | "testimonials";

interface HeroContent { badge: string; headline: string[]; gradientWords: string[]; subheadline: string; ctaPrimary: {text:string;link:string}; ctaSecondary: {text:string;link:string}; trustPills: string[] }
interface Announcement { text: string; link: string; linkText: string; enabled: boolean }
interface SocialLink { platform: string; url: string; enabled: boolean }
interface CompanyInfo { name: string; tagline: string; description: string; email: string; phone: string; address: string; introVideoUrl: string; introVideoEnabled: boolean }
interface Testimonial { _id: string; quote: string; name: string; role: string; company: string; rating: number; status: "published" | "draft" }

const DEFAULT_HERO: HeroContent = {
  badge: "Accepting new AI & SaaS project briefs",
  headline: ["Engineering", "Intelligence That", "Perceives, Reasons,", "and Acts"],
  gradientWords: ["Intelligence", "Acts"],
  subheadline: "From agentic AI workflows to production-grade SaaS platforms — SunTriX delivers end-to-end AI engineering.",
  ctaPrimary: { text: "Request a Demo", link: "/request-task" },
  ctaSecondary: { text: "Watch Overview", link: "#" },
  trustPills: ["50+ Projects Delivered", "Fortune 500 Clients", "24hr Response SLA"],
};

const DEFAULT_ANNOUNCEMENT: Announcement = { text: "🚀 Now accepting AI project briefs — 24hr proposal guarantee", link: "/request-task", linkText: "Submit Brief →", enabled: true };
const DEFAULT_COMPANY: CompanyInfo = { name: "SunTriX", tagline: "", description: "", email: "", phone: "", address: "", introVideoUrl: "", introVideoEnabled: false };
const DEFAULT_SOCIAL: SocialLink[] = [
  { platform: "LinkedIn", url: "#", enabled: true }, { platform: "Twitter", url: "#", enabled: true },
  { platform: "GitHub", url: "#", enabled: true }, { platform: "Upwork", url: "#", enabled: true },
  { platform: "Fiverr", url: "#", enabled: true }, { platform: "YouTube", url: "#", enabled: false },
];

const AdminContent = () => {
  const [tab, setTab] = useState<Tab>("hero");
  const [hero, setHero] = useState<HeroContent>(DEFAULT_HERO);
  const [announcement, setAnnouncement] = useState<Announcement>(DEFAULT_ANNOUNCEMENT);
  const [company, setCompany] = useState<CompanyInfo>(DEFAULT_COMPANY);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(DEFAULT_SOCIAL);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    const [heroRes, annRes, compRes, socialRes, testRes] = await Promise.all([
      apiRequest<HeroContent>(ENDPOINTS.CMS_HERO),
      apiRequest<Announcement>(ENDPOINTS.CMS_ANNOUNCEMENT),
      apiRequest<CompanyInfo>(ENDPOINTS.CMS_COMPANY),
      apiRequest<{ links: SocialLink[] }>(ENDPOINTS.CMS_SOCIAL_LINKS),
      apiRequest<Testimonial[]>(ENDPOINTS.TESTIMONIALS_LIST),
    ]);
    if (heroRes.data) setHero(heroRes.data);
    if (annRes.data) setAnnouncement(annRes.data);
    if (compRes.data) setCompany(compRes.data);
    if (socialRes.data?.links) setSocialLinks(socialRes.data.links);
    if (testRes.data) setTestimonials(testRes.data);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const save = async (endpoint: string, body: unknown, label: string) => {
    setSaving(true);
    const { error } = await apiRequest(endpoint, { method: "PUT", body });
    setSaving(false);
    if (error) toast({ title: "Error", description: error });
    else toast({ title: `${label} saved ✅` });
  };

  const deleteTestimonial = async (id: string) => {
    await apiRequest(ENDPOINTS.TESTIMONIALS_DELETE(id), { method: "DELETE" });
    setTestimonials((prev) => prev.filter((t) => t._id !== id));
    toast({ title: "Testimonial deleted" });
  };

  const toggleTestimonialStatus = async (t: Testimonial) => {
    const newStatus = t.status === "published" ? "draft" : "published";
    await apiRequest(ENDPOINTS.TESTIMONIALS_UPDATE(t._id), { method: "PUT", body: { status: newStatus } });
    setTestimonials((prev) => prev.map((x) => x._id === t._id ? { ...x, status: newStatus } : x));
  };

  const updateTestimonialField = async (id: string, field: string, value: string) => {
    setTestimonials((prev) => prev.map((t) => t._id === id ? { ...t, [field]: value } : t));
  };

  const saveTestimonial = async (t: Testimonial) => {
    await apiRequest(ENDPOINTS.TESTIMONIALS_UPDATE(t._id), { method: "PUT", body: t });
    toast({ title: "Testimonial saved ✅" });
  };

  const addTestimonial = async () => {
    const { error } = await apiRequest(ENDPOINTS.TESTIMONIALS_CREATE, {
      method: "POST",
      body: { quote: "New testimonial...", name: "Client Name", role: "Role", company: "Company", rating: 5, status: "draft" },
    });
    if (error) toast({ title: "Error", description: error });
    else { toast({ title: "Testimonial added" }); fetchAll(); }
  };

  const tabs: { key: Tab; label: string; icon: typeof Globe }[] = [
    { key: "hero", label: "Hero Section", icon: Globe },
    { key: "announcement", label: "Announcement", icon: Megaphone },
    { key: "company", label: "Company Info", icon: Building2 },
    { key: "social", label: "Social & Profiles", icon: Share2 },
    { key: "intro-video", label: "Intro Video", icon: Video },
    { key: "testimonials", label: "Testimonials", icon: MessageSquareQuote },
  ];

  const inp = "w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary";
  const SaveBtn = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <div className="flex justify-end">
      <button onClick={onClick} disabled={saving} className="gradient-bg inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
        <Save className="h-4 w-4" /> {saving ? "Saving..." : label}
      </button>
    </div>
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">Content Manager</h1>
        <p className="text-sm text-muted-foreground">Edit website content — saved directly to database</p>
      </div>

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

      {/* Hero */}
      {tab === "hero" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Badge Text</label>
            <input value={hero.badge} onChange={(e) => setHero({ ...hero, badge: e.target.value })} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Headline Lines (one per line)</label>
            <textarea value={hero.headline.join("\n")} onChange={(e) => setHero({ ...hero, headline: e.target.value.split("\n") })} rows={4} className={inp + " resize-none"} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Gradient Words (comma separated)</label>
            <input value={hero.gradientWords.join(", ")} onChange={(e) => setHero({ ...hero, gradientWords: e.target.value.split(",").map((w) => w.trim()) })} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Subheadline</label>
            <textarea value={hero.subheadline} onChange={(e) => setHero({ ...hero, subheadline: e.target.value })} rows={2} className={inp + " resize-none"} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Primary CTA Text</label>
              <input value={hero.ctaPrimary.text} onChange={(e) => setHero({ ...hero, ctaPrimary: { ...hero.ctaPrimary, text: e.target.value } })} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Primary CTA Link</label>
              <input value={hero.ctaPrimary.link} onChange={(e) => setHero({ ...hero, ctaPrimary: { ...hero.ctaPrimary, link: e.target.value } })} className={inp} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Trust Pills (comma separated)</label>
            <input value={hero.trustPills.join(", ")} onChange={(e) => setHero({ ...hero, trustPills: e.target.value.split(",").map((p) => p.trim()) })} className={inp} />
          </div>
          <SaveBtn label="Save Hero" onClick={() => save(ENDPOINTS.CMS_HERO, hero, "Hero")} />
        </motion.div>
      )}

      {/* Announcement */}
      {tab === "announcement" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Announcement Bar</p>
            <button
              onClick={() => setAnnouncement({ ...announcement, enabled: !announcement.enabled })}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${announcement.enabled ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}
            >
              {announcement.enabled ? <><ToggleRight className="h-4 w-4" /> Enabled</> : <><ToggleLeft className="h-4 w-4" /> Disabled</>}
            </button>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Banner Text</label>
            <input value={announcement.text} onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })} className={inp} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Link URL</label>
              <input value={announcement.link} onChange={(e) => setAnnouncement({ ...announcement, link: e.target.value })} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Link Text</label>
              <input value={announcement.linkText} onChange={(e) => setAnnouncement({ ...announcement, linkText: e.target.value })} className={inp} />
            </div>
          </div>
          <SaveBtn label="Save Announcement" onClick={() => save(ENDPOINTS.CMS_ANNOUNCEMENT, announcement, "Announcement")} />
        </motion.div>
      )}

      {/* Company */}
      {tab === "company" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Company Name</label>
              <input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
              <input value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} className={inp} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Tagline</label>
            <input value={company.tagline} onChange={(e) => setCompany({ ...company, tagline: e.target.value })} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
            <textarea value={company.description} onChange={(e) => setCompany({ ...company, description: e.target.value })} rows={3} className={inp + " resize-none"} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Phone</label>
              <input value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Address</label>
              <input value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} className={inp} />
            </div>
          </div>
          <SaveBtn label="Save Company Info" onClick={() => save(ENDPOINTS.CMS_COMPANY, company, "Company info")} />
        </motion.div>
      )}

      {/* Social Links */}
      {tab === "social" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6 space-y-5">
          <p className="text-sm font-medium text-foreground mb-2">Manage social media and freelance platform links.</p>
          <div className="space-y-3">
            {socialLinks.map((link, i) => (
              <div key={link.platform} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <span className="text-sm font-medium text-foreground w-24">{link.platform}</span>
                <input
                  value={link.url}
                  onChange={(e) => { const l = [...socialLinks]; l[i] = { ...l[i], url: e.target.value }; setSocialLinks(l); }}
                  placeholder={`https://${link.platform.toLowerCase()}.com/...`}
                  className="flex-1 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={() => { const l = [...socialLinks]; l[i] = { ...l[i], enabled: !l[i].enabled }; setSocialLinks(l); }}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${link.enabled ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}
                >
                  {link.enabled ? <><ToggleRight className="h-3.5 w-3.5" /> On</> : <><ToggleLeft className="h-3.5 w-3.5" /> Off</>}
                </button>
              </div>
            ))}
          </div>
          <SaveBtn label="Save Social Links" onClick={() => save(ENDPOINTS.CMS_SOCIAL_LINKS, { links: socialLinks }, "Social links")} />
        </motion.div>
      )}

      {/* Intro Video */}
      {tab === "intro-video" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Agency Introduction Video</p>
            <button
              onClick={() => setCompany({ ...company, introVideoEnabled: !company.introVideoEnabled })}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${company.introVideoEnabled ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}
            >
              {company.introVideoEnabled ? <><ToggleRight className="h-4 w-4" /> Enabled</> : <><ToggleLeft className="h-4 w-4" /> Disabled</>}
            </button>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Video Embed URL</label>
            <input value={company.introVideoUrl} onChange={(e) => setCompany({ ...company, introVideoUrl: e.target.value })} placeholder="https://www.youtube.com/embed/..." className={inp} />
            <p className="text-xs text-muted-foreground mt-1">Use the embed URL format. For YouTube: youtube.com/embed/VIDEO_ID</p>
          </div>
          {company.introVideoUrl && (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="aspect-video">
                <iframe src={company.introVideoUrl} className="w-full h-full" allow="autoplay; fullscreen" title="Preview" />
              </div>
            </div>
          )}
          <SaveBtn label="Save Video Settings" onClick={() => save(ENDPOINTS.CMS_COMPANY, company, "Video settings")} />
        </motion.div>
      )}

      {/* Testimonials */}
      {tab === "testimonials" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex justify-end">
            <button onClick={addTestimonial} className="gradient-bg inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
              <Plus className="h-4 w-4" /> Add Testimonial
            </button>
          </div>
          {testimonials.map((t) => (
            <div key={t._id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 space-y-3">
                  <textarea
                    value={t.quote}
                    onChange={(e) => updateTestimonialField(t._id, "quote", e.target.value)}
                    rows={2}
                    className={inp + " resize-none"}
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input value={t.name} onChange={(e) => updateTestimonialField(t._id, "name", e.target.value)} placeholder="Name" className={inp} />
                    <input value={t.role} onChange={(e) => updateTestimonialField(t._id, "role", e.target.value)} placeholder="Role" className={inp} />
                    <input value={t.company} onChange={(e) => updateTestimonialField(t._id, "company", e.target.value)} placeholder="Company" className={inp} />
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <button onClick={() => saveTestimonial(t)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors" title="Save">
                    <Save className="h-4 w-4 text-primary" />
                  </button>
                  <button onClick={() => toggleTestimonialStatus(t)} className={`p-1.5 rounded-lg transition-colors ${t.status === "published" ? "text-success" : "text-muted-foreground"}`}>
                    {t.status === "published" ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => deleteTestimonial(t._id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <span className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${t.status === "published" ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                {t.status}
              </span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default AdminContent;
