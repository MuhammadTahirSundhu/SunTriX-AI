import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Play, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import heroBanner from "@/assets/hero-banner.png";
import { heroStore, type HeroContent } from "@/lib/cms-store";

const HeroSection = () => {
  const [content, setContent] = useState<HeroContent>(heroStore.get());

  useEffect(() => {
    setContent(heroStore.get());
  }, []);

  const renderHeadline = () => {
    return content.headline.map((line, i) => {
      const words = line.split(" ");
      return (
        <span key={i}>
          {words.map((word, j) => {
            const isGradient = content.gradientWords.some((gw) => word.includes(gw));
            return (
              <span key={j}>
                {isGradient ? <span className="gradient-text">{word}</span> : <span className="text-foreground">{word}</span>}
                {j < words.length - 1 && " "}
              </span>
            );
          })}
          {i < content.headline.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Full-bleed background image */}
      <div className="absolute inset-0">
        <img src={heroBanner} alt="SunTriX AI Hero" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 3) * 25}%`,
              width: i % 2 === 0 ? 4 : 2,
              height: i % 2 === 0 ? 4 : 2,
              background: i % 3 === 0
                ? "hsl(var(--primary))"
                : i % 3 === 1
                ? "hsl(var(--secondary))"
                : "hsl(var(--accent-gold))",
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 0.9, 0.2],
              scale: [1, 1.8, 1],
            }}
            transition={{ duration: 3 + i * 0.6, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
      </div>

      {/* Floating orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/3 h-48 w-48 rounded-full bg-secondary/5 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 pt-32 pb-24 relative z-10">
        <motion.div
          className="max-w-3xl space-y-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-primary">{content.badge}</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-extrabold leading-[1.08]">
            {renderHeadline()}
          </h1>

          <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
            {content.subheadline}
          </p>

          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              to={content.ctaPrimary.link}
              className="gradient-bg inline-flex items-center gap-2 rounded-lg px-7 py-4 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all hover:shadow-[0_0_30px_hsl(24_100%_50%/0.3)] glow-orange"
            >
              {content.ctaPrimary.text} <ArrowRight className="h-4 w-4" />
            </Link>
            <button className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-background/30 backdrop-blur-sm px-6 py-4 text-sm font-medium text-foreground hover:bg-muted/50 transition-all">
              <Play className="h-4 w-4 text-primary" /> {content.ctaSecondary.text}
            </button>
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-6 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {content.trustPills.map((pill) => (
              <div key={pill} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-success" />
                {pill}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="h-10 w-6 rounded-full border-2 border-primary/30 flex justify-center pt-2">
          <div className="h-2 w-1 rounded-full bg-primary" />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
