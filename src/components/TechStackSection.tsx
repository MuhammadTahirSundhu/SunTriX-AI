import { motion } from "framer-motion";

const techStack = [
  "Next.js", "Node.js", "Python", "TensorFlow", "PyTorch", "LangChain",
  "OpenAI", "MongoDB", "PostgreSQL", "Docker", "Kubernetes", "AWS",
  "React", "TypeScript", "FastAPI", "Redis",
];

const TechStackSection = () => {
  return (
    <section className="py-24 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">
            The Stack Behind <span className="gradient-text">Our Work</span>
          </h2>
          <p className="text-muted-foreground">Battle-tested tools and frameworks for production-grade systems.</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {techStack.map((tech, i) => (
            <motion.div
              key={tech}
              className="flex items-center justify-center rounded-xl border border-border bg-card px-4 py-5 text-sm font-mono font-medium text-muted-foreground hover:text-primary hover:border-primary/30 glow-hover transition-all cursor-default"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
            >
              {tech}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStackSection;
