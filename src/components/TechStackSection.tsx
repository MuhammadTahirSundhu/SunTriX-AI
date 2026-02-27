import { motion } from "framer-motion";

const techCategories = [
  {
    category: "Agentic AI & Automation",
    items: [
      { name: "LangChain", icon: "https://cdn.simpleicons.org/langchain/ffffff" },
      { name: "OpenAI", icon: "https://cdn.simpleicons.org/openai/ffffff" },
      { name: "Anthropic", icon: "https://cdn.simpleicons.org/anthropic/ffffff" },
      { name: "n8n", icon: "https://cdn.simpleicons.org/n8n/ffffff" },
      { name: "Zapier", icon: "https://cdn.simpleicons.org/zapier/ffffff" },
      { name: "CrewAI", icon: "https://cdn.simpleicons.org/robot/ffffff" },
      { name: "AutoGen", icon: "https://cdn.simpleicons.org/microsoftazure/ffffff" },
    ],
  },
  {
    category: "AI & Machine Learning",
    items: [
      { name: "PyTorch", icon: "https://cdn.simpleicons.org/pytorch/ffffff" },
      { name: "TensorFlow", icon: "https://cdn.simpleicons.org/tensorflow/ffffff" },
      { name: "Hugging Face", icon: "https://cdn.simpleicons.org/huggingface/ffffff" },
      { name: "scikit-learn", icon: "https://cdn.simpleicons.org/scikitlearn/ffffff" },
      { name: "Weights & Biases", icon: "https://cdn.simpleicons.org/weightsandbiases/ffffff" },
      { name: "MLflow", icon: "https://cdn.simpleicons.org/mlflow/ffffff" },
      { name: "ONNX", icon: "https://cdn.simpleicons.org/onnx/ffffff" },
    ],
  },
  {
    category: "Computer Vision",
    items: [
      { name: "OpenCV", icon: "https://cdn.simpleicons.org/opencv/ffffff" },
      { name: "NVIDIA", icon: "https://cdn.simpleicons.org/nvidia/ffffff" },
      { name: "YOLO", icon: "https://cdn.simpleicons.org/darkreader/ffffff" },
      { name: "TensorRT", icon: "https://cdn.simpleicons.org/nvidia/ffffff" },
      { name: "Roboflow", icon: "https://cdn.simpleicons.org/probot/ffffff" },
      { name: "MediaPipe", icon: "https://cdn.simpleicons.org/google/ffffff" },
    ],
  },
  {
    category: "SaaS & Platform",
    items: [
      { name: "Next.js", icon: "https://cdn.simpleicons.org/nextdotjs/ffffff" },
      { name: "React", icon: "https://cdn.simpleicons.org/react/ffffff" },
      { name: "Node.js", icon: "https://cdn.simpleicons.org/nodedotjs/ffffff" },
      { name: "TypeScript", icon: "https://cdn.simpleicons.org/typescript/ffffff" },
      { name: "Stripe", icon: "https://cdn.simpleicons.org/stripe/ffffff" },
      { name: "Vercel", icon: "https://cdn.simpleicons.org/vercel/ffffff" },
    ],
  },
  {
    category: "Data & Infrastructure",
    items: [
      { name: "MongoDB", icon: "https://cdn.simpleicons.org/mongodb/ffffff" },
      { name: "PostgreSQL", icon: "https://cdn.simpleicons.org/postgresql/ffffff" },
      { name: "Redis", icon: "https://cdn.simpleicons.org/redis/ffffff" },
      { name: "AWS", icon: "https://cdn.simpleicons.org/amazonaws/ffffff" },
      { name: "Docker", icon: "https://cdn.simpleicons.org/docker/ffffff" },
      { name: "Kubernetes", icon: "https://cdn.simpleicons.org/kubernetes/ffffff" },
      { name: "GitHub Actions", icon: "https://cdn.simpleicons.org/githubactions/ffffff" },
    ],
  },
];

const TechStackSection = () => {
  return (
    <section className="py-16 lg:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block text-xs font-mono text-secondary uppercase tracking-widest mb-3">Technology</span>
          <h2 className="text-3xl lg:text-5xl font-display font-extrabold mb-3">
            The Stack Behind <span className="gradient-text">Our Work</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm">Cutting-edge tools chosen for each domain to deliver production-grade AI systems.</p>
        </motion.div>

        <div className="space-y-8">
          {techCategories.map((cat, ci) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: ci * 0.08 }}
            >
              <p className="text-xs font-mono text-primary mb-3 uppercase tracking-wider">{cat.category}</p>
              <div className="flex flex-wrap gap-2">
                {cat.items.map((tech) => (
                  <motion.div
                    key={tech.name}
                    whileHover={{ scale: 1.05, y: -3 }}
                    className="group inline-flex items-center gap-2.5 rounded-xl border border-border bg-card/80 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-card transition-all cursor-default"
                  >
                    <img
                      src={tech.icon}
                      alt={tech.name}
                      className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity"
                      loading="lazy"
                    />
                    {tech.name}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-sm text-muted-foreground">
            <span className="text-2xl font-extrabold gradient-text mr-2">60+</span>
            tools & frameworks mastered across our departments
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default TechStackSection;
