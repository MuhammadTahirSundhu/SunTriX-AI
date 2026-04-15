import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";
import { companyStore } from "@/lib/cms-store";
import { useMedia } from "@/hooks/use-media";

const AgencyIntroVideo = () => {
  const company = companyStore.get();
  const [playing, setPlaying] = useState(false);
  const videoThumb = useMedia("agency-intro-video");

  if (!company.introVideoEnabled || !company.introVideoUrl) return null;

  const isYouTube = company.introVideoUrl.includes("youtube") || company.introVideoUrl.includes("youtu.be");

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-neural-grid opacity-10" />
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block text-xs font-mono text-primary uppercase tracking-widest mb-4">
            Watch Our Story
          </span>
          <h2 className="text-3xl lg:text-5xl font-display font-extrabold mb-4">
            Meet <span className="gradient-text">SunTriX</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how we engineer intelligence that perceives, reasons, and acts.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-2xl relative group">
            {playing ? (
              <div className="aspect-video">
                <iframe
                  src={company.introVideoUrl + (isYouTube ? "?autoplay=1" : "")}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; encrypted-media"
                  allowFullScreen
                  title="SunTriX Agency Introduction"
                />
              </div>
            ) : (
              <div
                className="aspect-video relative cursor-pointer"
                onClick={() => setPlaying(true)}
              >
                {videoThumb ? (
                  <img src={videoThumb} alt="Agency intro" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 via-background to-secondary/10 flex items-center justify-center" />
                )}
                <div className="absolute inset-0 bg-background/30 flex items-center justify-center group-hover:bg-background/20 transition-colors">
                  <motion.div
                    className="h-20 w-20 rounded-full gradient-bg flex items-center justify-center shadow-2xl"
                    whileHover={{ scale: 1.1 }}
                    animate={{ boxShadow: ["0 0 20px hsl(var(--primary) / 0.3)", "0 0 50px hsl(var(--primary) / 0.5)", "0 0 20px hsl(var(--primary) / 0.3)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Play className="h-8 w-8 text-primary-foreground ml-1" />
                  </motion.div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AgencyIntroVideo;
