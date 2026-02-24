import { motion } from "framer-motion";
import deptPlatform from "@/assets/dept-platform.png";

const techCategories = [
  {
    category: "AI & ML",
    items: ["TensorFlow", "PyTorch", "LangChain", "OpenAI", "Hugging Face", "scikit-learn"],
  },
  {
    category: "Frontend",
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
  },
  {
    category: "Backend",
    items: ["Node.js", "Python", "FastAPI", "Express", "GraphQL"],
  },
  {
    category: "Data & Cloud",
    items: ["MongoDB", "PostgreSQL", "Redis", "AWS", "Docker", "Kubernetes"],
  },
];

const TechStackSection = () => {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-display font-extrabold mb-4">
              The Stack Behind <span className="gradient-text">Our Work</span>
            </h2>
            <p className="text-muted-foreground mb-10">Battle-tested tools and frameworks for production-grade systems.</p>

            <div className="space-y-6">
              {techCategories.map((cat, ci) => (
                <motion.div
                  key={cat.category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: ci * 0.1 }}
                >
                  <p className="text-xs font-mono text-primary mb-2 uppercase tracking-wider">{cat.category}</p>
                  <div className="flex flex-wrap gap-2">
                    {cat.items.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-mono text-muted-foreground hover:text-primary hover:border-primary/30 glow-hover transition-all cursor-default"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <img
              src={deptPlatform}
              alt="SunTriX Cloud Platform"
              className="w-full rounded-2xl border border-border"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-background/50 to-transparent" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TechStackSection;
