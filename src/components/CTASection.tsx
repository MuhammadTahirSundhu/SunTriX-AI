import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-16 lg:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />

      <motion.div
        className="container mx-auto px-4 lg:px-8 text-center relative z-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <motion.div
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-4"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <Sparkles className="h-3 w-3 text-primary" />
          <span className="text-xs font-semibold text-primary">24-hour Proposal Guarantee</span>
        </motion.div>

        <h2 className="text-3xl lg:text-5xl font-display font-extrabold mb-4">
          Ready to <span className="gradient-text">Build</span>?
        </h2>
        <p className="text-sm text-muted-foreground mb-8 max-w-xl mx-auto">
          No commitment. Let's discuss your AI project and get you a proposal within 24 hours.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/request-task"
            className="group gradient-bg inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold text-primary-foreground hover:shadow-[0_0_30px_hsl(24_100%_50%/0.35)] transition-all duration-300"
          >
            Request a Custom Task
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/contact"
            className="rounded-xl border border-border/60 bg-card/30 backdrop-blur-md px-6 py-3.5 text-sm font-semibold text-foreground hover:border-primary/30 transition-all"
          >
            Book a Call
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
