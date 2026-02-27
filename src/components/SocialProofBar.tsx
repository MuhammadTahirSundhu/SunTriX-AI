import { motion } from "framer-motion";

const logos = [
  "Google", "Microsoft", "AWS", "Meta", "Tesla", "OpenAI", "NVIDIA", "Stripe", "Anthropic", "Vercel"
];

const SocialProofBar = () => {
  return (
    <section className="border-y border-border/50 bg-card/30 backdrop-blur-sm py-10 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.p
          className="text-center text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60 mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Trusted by Leading Companies
        </motion.p>
      </div>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex animate-marquee gap-24 whitespace-nowrap">
          {[...logos, ...logos, ...logos].map((logo, i) => (
            <motion.span
              key={i}
              className="text-xl font-display font-bold text-muted-foreground/15 hover:text-primary/30 transition-colors duration-500 cursor-default select-none"
              whileHover={{ scale: 1.1 }}
            >
              {logo}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofBar;
