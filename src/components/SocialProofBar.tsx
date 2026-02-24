import { motion } from "framer-motion";

const logos = [
  "Google", "Microsoft", "AWS", "Meta", "Tesla", "OpenAI", "NVIDIA", "Stripe"
];

const SocialProofBar = () => {
  return (
    <section className="border-y border-border bg-card/50 py-10 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.p
          className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Trusted by Leading Companies
        </motion.p>
      </div>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-card/50 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-card/50 to-transparent z-10" />
        <div className="flex animate-marquee gap-20 whitespace-nowrap">
          {[...logos, ...logos, ...logos].map((logo, i) => (
            <span
              key={i}
              className="text-xl font-display font-bold text-muted-foreground/20 hover:text-primary/40 transition-colors duration-500 cursor-default select-none"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofBar;
