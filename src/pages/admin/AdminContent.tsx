import { useState, useEffect, useCallback } from "react";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import {
  Save, Globe, Megaphone, Building2, MessageSquareQuote,
  Plus, Trash2, Eye, EyeOff, ToggleLeft, ToggleRight, Video, Share2, Layers
} from "lucide-react";

type Tab = "hero" | "announcement" | "company" | "social" | "testimonials";

interface HeroContent {
  badge: string;
  headline: string[];
  gradientWords: string[];
  subheadline: string;
  ctaPrimary: { text: string; link: string };
  ctaSecondary: { text: string; link: string };
  trustPills: string[];
}

interface Announcement {
  text: string;
  link: string;
  linkText: string;
  enabled: boolean;
}

interface SocialLink {
  platform: string;
  url: string;
  enabled: boolean;
}

interface CompanyInfo {
  name: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  introVideoUrl: string;
  introVideoEnabled: boolean;
}

interface Testimonial {
  _id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  rating: number;
  status: "published" | "draft";
}

const DEFAULT_HERO: HeroContent = {
  badge: "Accepting new AI & SaaS project briefs",
  headline: ["Engineering", "Intelligence That", "Perceives, Reasons,", "and Acts"],
  gradientWords: ["Intelligence", "Acts"],
  subheadline: "From agentic AI workflows to production-grade SaaS platforms — SunTriX delivers end-to-end AI engineering.",
  ctaPrimary: { text: "Request a Demo", link: "/request-task" },
  ctaSecondary: { text: "Watch Overview", link: "#" },
  trustPills: ["50+ Projects Delivered", "Fortune 500 Clients", "24hr Response SLA"],
};

const DEFAULT_ANNOUNCEMENT: Announcement = {
  text: "🚀 Now accepting AI project briefs — 24hr proposal guarantee",
  link: "/request-task",
  linkText: "Submit Brief →",
  enabled: true,
};

const DEFAULT_COMPANY: CompanyInfo = {
  name: "SunTriX",
  tagline: "",
  description: "",
  email: "",
  phone: "",
  address: "",
  introVideoUrl: "",
  introVideoEnabled: false,
};

const DEFAULT_SOCIAL: SocialLink[] = [
  { platform: "LinkedIn", url: "#", enabled: true },
  { platform: "Twitter", url: "#", enabled: true },
  { platform: "GitHub", url: "#", enabled: true },
  { platform: "Upwork", url: "#", enabled: true },
  { platform: "Fiverr", url: "#", enabled: true },
  { platform: "YouTube", url: "#", enabled: false },
];

export const AdminContent = () => {
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

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

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
    setTestimonials((prev) => prev.map((x) => (x._id === t._id ? { ...x, status: newStatus } : x)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Content Hub (CMS)"
        description="Public website copy, marketing banners, company identity, and client testimonials."
      />

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        {[
          { id: "hero", label: "Hero Banner", icon: Globe },
          { id: "announcement", label: "Announcement Bar", icon: Megaphone },
          { id: "company", label: "Company Identity", icon: Building2 },
          { id: "social", label: "Social Channels", icon: Share2 },
          { id: "testimonials", label: "Testimonials", icon: MessageSquareQuote },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        {tab === "hero" && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1">Hero Badge Text</label>
              <input
                type="text"
                value={hero.badge}
                onChange={(e) => setHero({ ...hero, badge: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1">Subheadline Copy</label>
              <textarea
                rows={3}
                value={hero.subheadline}
                onChange={(e) => setHero({ ...hero, subheadline: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary resize-y"
              />
            </div>
            <button
              onClick={() => save(ENDPOINTS.CMS_HERO, hero, "Hero Content")}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-md"
            >
              <Save className="h-4 w-4" /> Save Hero Section
            </button>
          </div>
        )}

        {tab === "announcement" && (
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/40">
              <span className="text-xs font-semibold text-foreground">Enable Announcement Bar</span>
              <button
                type="button"
                onClick={() => setAnnouncement({ ...announcement, enabled: !announcement.enabled })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${
                  announcement.enabled
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400"
                }`}
              >
                {announcement.enabled ? "Enabled" : "Disabled"}
              </button>
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1">Banner Announcement Text</label>
              <input
                type="text"
                value={announcement.text}
                onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <button
              onClick={() => save(ENDPOINTS.CMS_ANNOUNCEMENT, announcement, "Announcement Bar")}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-md"
            >
              <Save className="h-4 w-4" /> Save Announcement Bar
            </button>
          </div>
        )}

        {tab === "company" && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1">Company Name</label>
              <input
                type="text"
                value={company.name}
                onChange={(e) => setCompany({ ...company, name: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1">Support Email</label>
              <input
                type="email"
                value={company.email}
                onChange={(e) => setCompany({ ...company, email: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <button
              onClick={() => save(ENDPOINTS.CMS_COMPANY, company, "Company Identity")}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-md"
            >
              <Save className="h-4 w-4" /> Save Company Profile
            </button>
          </div>
        )}

        {tab === "testimonials" && (
          <div className="space-y-4">
            <div className="divide-y divide-border/60">
              {testimonials.map((t) => (
                <div key={t._id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-foreground">"{t.quote}"</p>
                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      {t.name} — {t.role}, {t.company}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <AdminStatusBadge status={t.status} size="sm" />
                    <button
                      onClick={() => toggleTestimonialStatus(t)}
                      className="px-2.5 py-1 rounded bg-muted text-xs font-semibold text-foreground border border-border"
                    >
                      Toggle Status
                    </button>
                    <button
                      onClick={() => deleteTestimonial(t._id)}
                      className="p-1.5 rounded bg-destructive/10 text-destructive border border-destructive/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContent;
