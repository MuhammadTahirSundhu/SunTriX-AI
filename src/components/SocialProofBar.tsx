import { motion } from "framer-motion";

const logos = [
  { name: "Google", icon: "https://cdn.simpleicons.org/google/ffffff" },
  { name: "Microsoft", icon: "https://cdn.simpleicons.org/microsoft/ffffff" },
  { name: "AWS", icon: "https://cdn.simpleicons.org/amazonaws/ffffff" },
  { name: "Meta", icon: "https://cdn.simpleicons.org/meta/ffffff" },
  { name: "Tesla", icon: "https://cdn.simpleicons.org/tesla/ffffff" },
  { name: "OpenAI", icon: "https://cdn.simpleicons.org/openai/ffffff" },
  { name: "NVIDIA", icon: "https://cdn.simpleicons.org/nvidia/ffffff" },
  { name: "Stripe", icon: "https://cdn.simpleicons.org/stripe/ffffff" },
  { name: "Anthropic", icon: "https://cdn.simpleicons.org/anthropic/ffffff" },
  { name: "Vercel", icon: "https://cdn.simpleicons.org/vercel/ffffff" },
];

const SocialProofBar = () => {
  return (
    <section className="border-y border-border/50 bg-card/30 backdrop-blur-sm py-6 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.p
          className="text-center text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60 mb-5"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Trusted by Leading Companies
        </motion.p>
      </div>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex animate-marquee gap-16 whitespace-nowrap items-center">
          {[...logos, ...logos, ...logos].map((logo, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2 opacity-20 hover:opacity-50 transition-opacity duration-500 cursor-default select-none shrink-0"
              whileHover={{ scale: 1.05 }}
            >
              <img src={logo.icon} alt={logo.name} className="h-5 w-5" loading="lazy" />
              <span className="text-sm font-semibold text-foreground">{logo.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofBar;
