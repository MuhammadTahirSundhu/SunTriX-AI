import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, ENDPOINTS } from "@/lib/api";

interface AnnouncementBarData { text: string; link: string; linkText: string; enabled: boolean; }

const AnnouncementBar = () => {
  const [announcement, setAnnouncement] = useState<AnnouncementBarData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    apiRequest<AnnouncementBarData>(ENDPOINTS.CMS_ANNOUNCEMENT).then(({ data }) => {
      if (data?.enabled) setAnnouncement(data);
    });
  }, []);

  if (!announcement || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="gradient-bg relative z-[60]"
      >
        <div className="container mx-auto flex items-center justify-center gap-3 px-4 py-2.5 text-sm">
          <span className="text-primary-foreground font-medium">{announcement.text}</span>
          {announcement.link && (
            <Link
              to={announcement.link}
              className="inline-flex items-center rounded-full bg-background/20 px-3 py-0.5 text-xs font-semibold text-primary-foreground hover:bg-background/30 transition-colors"
            >
              {announcement.linkText || "Learn More"}
            </Link>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="absolute right-4 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnnouncementBar;
