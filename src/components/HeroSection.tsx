import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Play, CheckCircle } from "lucide-react";
import heroOrb from "@/assets/hero-orb.png";

const trustPills = [
  "50+ Projects Delivered",
  "Fortune 500 Clients",
  "24hr Response SLA",
];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-grid-pattern">
      {/* Gradient blobs */}
      <div className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-0 h-80 w-80 rounded-full bg-secondary/5 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      <div className="container mx-auto px-4 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          {/* Left content - 60% */}
          <motion.div
            className="lg:col-span-3 space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground">Accepting new AI & SaaS project briefs</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1]">
              We Build{" "}
              <span className="gradient-text">Intelligent</span>
              <br />
              Systems That{" "}
              <span className="gradient-text">Scale</span>
            </h1>

            <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
              From agentic AI workflows to production-grade SaaS platforms — SunTriX delivers end-to-end AI engineering with a 24-hour proposal guarantee.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/request-task"
                className="gradient-bg inline-flex items-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Request a Custom Task <ArrowRight className="h-4 w-4" />
              </Link>
              <button className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                <Play className="h-4 w-4 text-primary" /> Watch Overview
              </button>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              {trustPills.map((pill) => (
                <div key={pill} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-success" />
                  {pill}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right visual - 40% */}
          <motion.div
            className="lg:col-span-2 flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              <img
                src={heroOrb}
                alt="AI Neural Network Visualization"
                className="w-full max-w-md animate-float"
              />
              <div className="absolute inset-0 rounded-full bg-primary/5 blur-3xl -z-10" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="h-10 w-6 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
          <div className="h-2 w-1 rounded-full bg-primary" />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
