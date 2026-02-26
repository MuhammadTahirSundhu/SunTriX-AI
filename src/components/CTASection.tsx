import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-28 lg:py-36 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px] animate-pulse-glow" />
      {/* Decorative rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <motion.div
          className="h-[400px] w-[400px] rounded-full border border-primary/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <motion.div
          className="h-[300px] w-[300px] rounded-full border border-secondary/10"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <motion.div
        className="container mx-auto px-4 lg:px-8 text-center relative z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <motion.div
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <Sparkles className="h-3 w-3 text-primary" />
          <span className="text-xs font-semibold text-primary">24-hour Proposal Guarantee</span>
        </motion.div>

        <motion.h2
          className="text-3xl lg:text-6xl font-display font-extrabold mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Ready to <span className="gradient-text">Build</span>?
        </motion.h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
          No commitment. Let's discuss your AI project and get you a proposal within 24 hours.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/request-task"
            className="group gradient-bg inline-flex items-center gap-2.5 rounded-xl px-8 py-4 text-base font-bold text-primary-foreground hover:shadow-[0_0_40px_hsl(24_100%_50%/0.35)] transition-all duration-300"
          >
            Request a Custom Task
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/contact"
            className="rounded-xl border border-border/60 bg-card/30 backdrop-blur-md px-7 py-4 text-sm font-semibold text-foreground hover:border-primary/30 transition-all"
          >
            Book a Call
          </Link>
        </div>
        <p className="mt-10 text-sm text-muted-foreground/50">
          50+ teams currently building with us
        </p>
      </motion.div>
    </section>
  );
};

export default CTASection;
