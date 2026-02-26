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
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
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
                initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.15 + j * 0.05 }}
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
    <section ref={ref} className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
      {/* Parallax background */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <img src={heroBanner} alt="SunTriX AI Hero" className="w-full h-[120%] object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        <div className="absolute inset-0 bg-background/40" />
      </motion.div>

      {/* Animated grid overlay */}
      <div className="absolute inset-0 bg-neural-grid opacity-20" />

      {/* Floating orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-[20%] left-[15%] h-80 w-80 rounded-full bg-primary/8 blur-[100px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3], x: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-[20%] right-[15%] h-64 w-64 rounded-full bg-secondary/8 blur-[80px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        />
        <motion.div
          className="absolute top-[40%] right-[30%] h-48 w-48 rounded-full bg-gold/5 blur-[60px]"
          animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, delay: 4 }}
        />
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${5 + i * 8}%`,
              top: `${10 + (i % 4) * 22}%`,
              width: i % 3 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 3 : 2,
              background: i % 3 === 0
                ? "hsl(var(--primary))"
                : i % 3 === 1
                ? "hsl(var(--secondary))"
                : "hsl(var(--accent-gold))",
            }}
            animate={{
              y: [0, -60, 0],
              x: [0, i % 2 === 0 ? 20 : -20, 0],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
      </div>

      {/* Content — centered */}
      <motion.div className="container mx-auto px-4 lg:px-8 pt-24 pb-32 relative z-10" style={{ opacity }}>
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm px-5 py-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold tracking-wide text-primary">{content.badge}</span>
          </motion.div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-extrabold leading-[1.05] tracking-tight">
            {renderHeadline()}
          </h1>

          {/* Subheadline */}
          <motion.p
            className="max-w-2xl mx-auto text-lg lg:text-xl text-muted-foreground leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {content.subheadline}
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <Link
              to={content.ctaPrimary.link}
              className="group gradient-bg inline-flex items-center gap-2.5 rounded-xl px-8 py-4 text-sm font-bold text-primary-foreground hover:shadow-[0_0_40px_hsl(24_100%_50%/0.35)] transition-all duration-300"
            >
              {content.ctaPrimary.text}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/work"
              className="inline-flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/30 backdrop-blur-md px-7 py-4 text-sm font-semibold text-foreground hover:bg-card/60 hover:border-primary/30 transition-all duration-300"
            >
              View Our Work
            </Link>
          </motion.div>

          {/* Trust pills */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            {content.trustPills.map((pill) => (
              <div key={pill} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>{pill}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Scroll</span>
          <div className="h-10 w-6 rounded-full border-2 border-primary/30 flex justify-center pt-2">
            <motion.div
              className="h-2 w-1 rounded-full bg-primary"
              animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
