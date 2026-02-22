import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const CTASection = () => {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />

      <motion.div
        className="container mx-auto px-4 lg:px-8 text-center relative z-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl lg:text-5xl font-extrabold mb-6">
          Ready to <span className="gradient-text">Build</span>?
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          24-hour proposal. No commitment. Let's discuss your AI project.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/request-task"
            className="gradient-bg inline-flex items-center gap-2 rounded-lg px-8 py-4 text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Request a Custom Task <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/contact"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Or email us at hello@suntrix.com
          </Link>
        </div>
        <p className="mt-8 text-sm text-muted-foreground/60">
          50+ teams currently building with us
        </p>
      </motion.div>
    </section>
  );
};

export default CTASection;
