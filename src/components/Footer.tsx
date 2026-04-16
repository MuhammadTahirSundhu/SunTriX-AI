import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { newsletterStore } from "@/lib/store";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { useMedia } from "@/hooks/use-media";

const PLATFORM_ICONS: Record<string, string> = {
  LinkedIn: "💼", Twitter: "𝕏", GitHub: "🐙", YouTube: "▶️",
  Instagram: "📸", Upwork: "🟢", Fiverr: "🟩",
};

const Footer = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("General News");
  const { t } = useI18n();
  const suntrixLogo = useMedia("suntrix-logo");
  const [socialLinks, setSocialLinks] = useState<{platform: string, url: string, enabled: boolean}[]>([]);

  useEffect(() => {
    apiRequest<{links: {platform: string, url: string, enabled: boolean}[]}>(ENDPOINTS.CMS_SOCIAL_LINKS).then(({ data }) => {
      if (data && data.links) setSocialLinks(data.links);
    });
  }, []);

  const activeLinks = socialLinks.filter((l) => l.enabled && l.url && l.url !== "#");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !interest) return;
    
    try {
      const res = await apiRequest(ENDPOINTS.NEWSLETTER_SUBSCRIBE, {
        method: "POST",
        body: { name, email, interest }
      });
      
      if (res.error) {
        toast({ title: "Already subscribed", description: "This email is already on our list." });
      } else {
        toast({ title: "Subscribed!", description: "You've successfully joined our newsletter." });
        setEmail("");
        setName("");
        setInterest("General News");
      }
    } catch {
      toast({ title: "Error", description: "Failed to connect to the server.", variant: "destructive" });
    }
  };

  return (
    <footer className="border-t border-border bg-card/50 pt-16 pb-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={suntrixLogo} alt="SunTriX" className="h-8 w-8 rounded-lg object-contain" />
              <span className="text-lg font-display font-bold text-foreground">
                Sun<span className="text-primary">Tri</span>X
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("footer.tagline")}
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3 mt-6 bg-muted/20 p-5 rounded-xl border border-border">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Full Name" required
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary" />
              
              <select value={interest} onChange={(e) => setInterest(e.target.value)} required
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="General News">General News</option>
                <option value="Call to Action">Call to Action</option>
                <option value="Platform Updates">Platform Updates</option>
                <option value="All">All Topics</option>
              </select>

              <div className="flex gap-2">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address" required
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary" />
                <button type="submit" className="gradient-bg rounded-lg px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </form>
          </div>

          <div>
            <h4 className="text-sm font-bold text-foreground mb-4">{t("nav.services")}</h4>
            <ul className="space-y-2">
              <li><Link to="/services/agentic-ai" className="text-sm text-muted-foreground hover:text-primary transition-colors">Agentic AI</Link></li>
              <li><Link to="/services/ai-ml" className="text-sm text-muted-foreground hover:text-primary transition-colors">AI & ML</Link></li>
              <li><Link to="/services/computer-vision" className="text-sm text-muted-foreground hover:text-primary transition-colors">Computer Vision</Link></li>
              <li><Link to="/services/saas-platform" className="text-sm text-muted-foreground hover:text-primary transition-colors">SaaS Platform</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("nav.about")}</Link></li>
              <li><Link to="/work" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("nav.portfolio")}</Link></li>
              <li><Link to="/how-we-work" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("nav.howWeWork")}</Link></li>
              <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("nav.contact")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/legal" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/legal" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/partnership" className="text-sm text-muted-foreground hover:text-primary transition-colors">Partnership</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} SunTriX. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {activeLinks.length > 0 ? (
              activeLinks.map((link) => (
                <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <span>{PLATFORM_ICONS[link.platform] || "🔗"}</span> {link.platform}
                </a>
              ))
            ) : (
              <>
                <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">LinkedIn</a>
                <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Twitter</a>
                <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">GitHub</a>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
