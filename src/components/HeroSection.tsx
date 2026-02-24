import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Play, CheckCircle } from "lucide-react";
import heroBanner from "@/assets/hero-banner.png";

const trustPills = [
  "50+ Projects Delivered",
  "Fortune 500 Clients",
  "24hr Response SLA",
];

const HeroSection = () => {
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
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-primary/60"
            style={{ left: `${15 + i * 15}%`, top: `${20 + i * 10}%` }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
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
            <span className="text-xs font-medium text-primary">Accepting new AI & SaaS project briefs</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-extrabold leading-[1.08]">
            <span className="text-foreground">Engineering</span>
            <br />
            <span className="gradient-text">Intelligence</span>{" "}
            <span className="text-foreground">That</span>
            <br />
            <span className="text-foreground">Perceives, Reasons,</span>
            <br />
            <span className="text-foreground">and </span>
            <span className="gradient-text">Acts</span>
          </h1>

          <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
            From agentic AI workflows to production-grade SaaS platforms — SunTriX delivers end-to-end AI engineering with a 24-hour proposal guarantee.
          </p>

          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              to="/request-task"
              className="gradient-bg inline-flex items-center gap-2 rounded-lg px-7 py-4 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all hover:shadow-[0_0_30px_hsl(24_100%_50%/0.3)] glow-orange"
            >
              Request a Demo <ArrowRight className="h-4 w-4" />
            </Link>
            <button className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-background/30 backdrop-blur-sm px-6 py-4 text-sm font-medium text-foreground hover:bg-muted/50 transition-all">
              <Play className="h-4 w-4 text-primary" /> Watch Overview
            </button>
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-6 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {trustPills.map((pill) => (
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
