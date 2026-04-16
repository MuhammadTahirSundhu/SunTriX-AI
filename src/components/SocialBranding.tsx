import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { apiRequest, ENDPOINTS } from "@/lib/api";

interface SocialLink {
  platform: string;
  url: string;
  enabled: boolean;
}

interface SocialLinksResponse {
  links: SocialLink[];
}

const PLATFORM_ICONS: Record<string, string> = {
  LinkedIn: "💼",
  Twitter: "𝕏",
  GitHub: "🐙",
  YouTube: "▶️",
  Instagram: "📸",
  Upwork: "🟢",
  Fiverr: "🟩",
};

const PLATFORM_COLORS: Record<string, string> = {
  LinkedIn: "hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/5",
  Twitter: "hover:border-foreground/30 hover:bg-foreground/5",
  GitHub: "hover:border-foreground/30 hover:bg-foreground/5",
  YouTube: "hover:border-[#FF0000]/50 hover:bg-[#FF0000]/5",
  Instagram: "hover:border-[#E1306C]/50 hover:bg-[#E1306C]/5",
  Upwork: "hover:border-[#14A800]/50 hover:bg-[#14A800]/5",
  Fiverr: "hover:border-[#1DBF73]/50 hover:bg-[#1DBF73]/5",
};

const SocialBranding = () => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    apiRequest<SocialLinksResponse>(ENDPOINTS.CMS_SOCIAL_LINKS).then(({ data }) => {
      if (data && data.links) setSocialLinks(data.links);
    });
  }, []);

  const activeLinks = socialLinks.filter((l) => l.enabled && l.url && l.url !== "#");

  if (activeLinks.length === 0) return null;

  return (
    <section className="py-16 border-t border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <span className="text-xs font-mono text-primary uppercase tracking-widest">Find Us On</span>
        </motion.div>
        <div className="flex flex-wrap justify-center gap-4">
          {activeLinks.map((link, i) => (
            <motion.a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`inline-flex items-center gap-3 rounded-xl border border-border bg-card px-6 py-4 text-sm font-medium text-foreground transition-all duration-300 ${PLATFORM_COLORS[link.platform] || "hover:border-primary/30"}`}
            >
              <span className="text-lg">{PLATFORM_ICONS[link.platform] || "🔗"}</span>
              {link.platform}
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialBranding;
