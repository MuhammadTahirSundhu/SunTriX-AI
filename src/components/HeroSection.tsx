import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import heroBanner from "@/assets/hero-banner.png";
import { heroStore, type HeroContent } from "@/lib/cms-store";

const HeroSection = () => {
  const [content, setContent] = useState<HeroContent>(heroStore.get());
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => { setContent(heroStore.get()); }, []);

  const renderHeadline = () => {
    return content.headline.map((line, i) => {
      const words = line.split(" ");
      return (
        <span key={i} className="block">
          {words.map((word, j) => {
            const isGradient = content.gradientWords.some((gw) => word.includes(gw));
            return (
              <motion.span
                key={j}
                className="inline-block"
                initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.12 + j * 0.04 }}
              >
                {isGradient ? (
                  <span className="gradient-text">{word}</span>
                ) : (
                  <span className="text-foreground">{word}</span>
                )}
                {j < words.length - 1 && "\u00A0"}
              </motion.span>
            );
          })}
        </span>
      );
    });
  };

  return (
    <section ref={ref} className="relative min-h-[92vh] flex items-center justify-center overflow-hidden -mt-16 pt-16">
      {/* Parallax background */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <img src={heroBanner} alt="SunTriX AI" className="w-full h-[115%] object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        <div className="absolute inset-0 bg-background/40" />
      </motion.div>

      <div className="absolute inset-0 bg-neural-grid opacity-15" />

      {/* Floating orbs — smaller and more subtle */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-[20%] left-[15%] h-60 w-60 rounded-full bg-primary/8 blur-[80px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-[25%] right-[15%] h-48 w-48 rounded-full bg-secondary/8 blur-[60px]"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        />
      </div>

      {/* Content */}
      <motion.div className="container mx-auto px-4 lg:px-8 pt-16 pb-20 relative z-10" style={{ opacity }}>
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm px-4 py-1.5"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: "spring" }}
          >
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-semibold tracking-wide text-primary">{content.badge}</span>
          </motion.div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-extrabold leading-[1.05] tracking-tight">
            {renderHeadline()}
          </h1>

          {/* Subheadline */}
          <motion.p
            className="max-w-2xl mx-auto text-base lg:text-lg text-muted-foreground leading-relaxed"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {content.subheadline}
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
          >
            <Link
              to={content.ctaPrimary.link}
              className="group gradient-bg inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold text-primary-foreground hover:shadow-[0_0_30px_hsl(24_100%_50%/0.35)] transition-all duration-300"
            >
              {content.ctaPrimary.text}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/work"
              className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/30 backdrop-blur-md px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-card/60 hover:border-primary/30 transition-all duration-300"
            >
              View Our Work
            </Link>
          </motion.div>

          {/* Trust pills */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {content.trustPills.map((pill) => (
              <div key={pill} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle className="h-3.5 w-3.5 text-success" />
                <span>{pill}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-1.5"
        >
          <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40">Scroll</span>
          <div className="h-8 w-5 rounded-full border-2 border-primary/25 flex justify-center pt-1.5">
            <motion.div
              className="h-1.5 w-0.5 rounded-full bg-primary"
              animate={{ y: [0, 10, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
