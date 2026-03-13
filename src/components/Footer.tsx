import { Link } from "react-router-dom";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { newsletterStore } from "@/lib/store";
import { toast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { useMedia } from "@/hooks/use-media";

const Footer = () => {
  const [email, setEmail] = useState("");
  const { t } = useI18n();
  const suntrixLogo = useMedia("suntrix-logo");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const success = newsletterStore.subscribe(email);
    if (success) {
      toast({ title: "Subscribed!", description: "You'll receive our AI insights newsletter." });
      setEmail("");
    } else {
      toast({ title: "Already subscribed", description: "This email is already on our list." });
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
            <form onSubmit={handleSubscribe} className="flex gap-2 mt-4">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder={t("footer.subscribe")}
                className="flex-1 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary" />
              <button type="submit" className="gradient-bg rounded-lg px-3 py-2 text-primary-foreground hover:opacity-90 transition-opacity">
                <ArrowRight className="h-4 w-4" />
              </button>
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
            <h4 className="text-sm font-bold text-foreground mb-4">{t("footer.company")}</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("nav.about")}</Link></li>
              <li><Link to="/work" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("nav.work")}</Link></li>
              <li><Link to="/how-we-work" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("nav.howWeWork")}</Link></li>
              <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("nav.contact")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-foreground mb-4">{t("footer.legal")}</h4>
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
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">LinkedIn</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Twitter</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
