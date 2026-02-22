const logos = [
  "Google", "Microsoft", "AWS", "Meta", "Tesla", "OpenAI", "NVIDIA", "Stripe"
];

const SocialProofBar = () => {
  return (
    <section className="border-y border-border bg-card/50 py-8 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
          Trusted by engineering teams at
        </p>
      </div>
      <div className="relative">
        <div className="flex animate-marquee gap-16 whitespace-nowrap">
          {[...logos, ...logos].map((logo, i) => (
            <span
              key={i}
              className="text-lg font-bold text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors cursor-default select-none"
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
