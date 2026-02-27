import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";
import videoDemoThumb from "@/assets/video-demo-thumb.png";

const demos = [
  {
    id: "1",
    title: "Agentic AI Workflow",
    description: "Autonomous agents handling document processing end-to-end",
    thumbnail: videoDemoThumb,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    duration: "3:24",
    category: "Agents",
  },
  {
    id: "2",
    title: "Computer Vision Pipeline",
    description: "Real-time object detection and quality inspection",
    thumbnail: videoDemoThumb,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    duration: "2:48",
    category: "Vision",
  },
  {
    id: "3",
    title: "SaaS Platform Demo",
    description: "Multi-tenant analytics with embedded ML models",
    thumbnail: videoDemoThumb,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    duration: "4:12",
    category: "Platform",
  },
];

const VideoDemoSection = () => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <section className="py-16 lg:py-20 relative">
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block text-xs font-mono text-secondary uppercase tracking-widest mb-3">See It In Action</span>
          <h2 className="text-3xl lg:text-5xl font-display font-extrabold mb-3">
            Video <span className="gradient-text">Demos</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
            Watch our AI solutions work in real-world production environments.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {demos.map((demo, i) => (
            <motion.div
              key={demo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group cursor-pointer"
              onClick={() => setActiveVideo(demo.videoUrl)}
            >
              <div className="relative rounded-xl overflow-hidden border border-border bg-card hover:border-primary/40 transition-all duration-500 hover:shadow-[0_0_30px_hsl(24_100%_50%/0.12)]">
                <div className="relative aspect-video overflow-hidden">
                  <img src={demo.thumbnail} alt={demo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-background/30 group-hover:bg-background/10 transition-colors" />
                  <motion.div className="absolute inset-0 flex items-center justify-center" whileHover={{ scale: 1.1 }}>
                    <div className="h-14 w-14 rounded-full gradient-bg flex items-center justify-center shadow-lg group-hover:shadow-[0_0_30px_hsl(24_100%_50%/0.4)] transition-shadow">
                      <Play className="h-6 w-6 text-primary-foreground ml-0.5" />
                    </div>
                  </motion.div>
                  <span className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded px-1.5 py-0.5 text-[10px] font-mono text-foreground">{demo.duration}</span>
                  <span className="absolute top-2 left-2 bg-primary/20 backdrop-blur-sm rounded px-1.5 py-0.5 text-[10px] font-mono text-primary">{demo.category}</span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{demo.title}</h3>
                  <p className="text-xs text-muted-foreground">{demo.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeVideo && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              className="relative w-full max-w-4xl mx-4 aspect-video rounded-2xl overflow-hidden border border-border shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <iframe src={activeVideo} className="w-full h-full" allow="autoplay; fullscreen" allowFullScreen />
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default VideoDemoSection;
