import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { heroStore, type HeroContent } from "@/lib/cms-store";
import { useMedia } from "@/hooks/use-media";

const HeroSection = () => {
  const [content, setContent] = useState<HeroContent>(heroStore.get());
  const heroBanner = useMedia("hero-banner");
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
                <span className={isGradient ? "gradient-text" : "text-foreground"}>
                  {word}
                </span>
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
      {/* Background */}
      <motion.div className="absolute inset-0 z-0" style={{ y: bgY }}>
        <img src={heroBanner} alt="SunTriX AI Hero" className="w-full h-[120%] object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        <div className="absolute inset-0 bg-background/40" />
      </motion.div>

      <div className="absolute inset-0 bg-neural-grid opacity-20" />

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
                : "hsl(var(--gold))",
            }}
            animate={{
              y: [0, -60, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      <motion.div className="container mx-auto px-4 lg:px-8 relative z-10 text-center" style={{ opacity }}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-8"
        >
          <Sparkles className="h-3 w-3 text-primary" />
          <span className="text-xs font-mono text-primary">{content.badge}</span>
        </motion.div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-extrabold leading-[0.95] tracking-tight mb-8">
          {renderHeadline()}
        </h1>

        <motion.p
          className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {content.subheadline}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <Link
            to={content.ctaPrimary.link}
            className="gradient-bg inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-primary-foreground shadow-[0_0_30px_hsl(24_100%_50%/0.3)] hover:shadow-[0_0_50px_hsl(24_100%_50%/0.5)] transition-all duration-300 hover:-translate-y-0.5"
          >
            {content.ctaPrimary.text} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to={content.ctaSecondary.link}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card/50 backdrop-blur-sm px-8 py-4 text-base font-semibold text-foreground hover:bg-card hover:border-primary/30 transition-all duration-300"
          >
            {content.ctaSecondary.text}
          </Link>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          {content.trustPills.map((pill, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 text-primary" />
              {pill}
            </div>
          ))}
        </motion.div>
      </motion.div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-8 w-5 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1"
        >
          <motion.div
            animate={{ opacity: [0, 1, 0], y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-1.5 w-1.5 rounded-full bg-primary"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
