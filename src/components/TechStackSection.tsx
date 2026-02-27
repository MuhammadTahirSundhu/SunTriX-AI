import { motion } from "framer-motion";
import deptPlatform from "@/assets/dept-platform.png";

const techCategories = [
  {
    category: "Agentic AI & Automation",
    items: [
      { name: "LangChain", icon: "🔗" },
      { name: "CrewAI", icon: "🤖" },
      { name: "AutoGen", icon: "⚡" },
      { name: "OpenAI GPT-4o", icon: "🧠" },
      { name: "Claude 3.5", icon: "🟣" },
      { name: "n8n", icon: "🔄" },
      { name: "Zapier AI", icon: "⚙️" },
    ],
  },
  {
    category: "AI & Machine Learning",
    items: [
      { name: "PyTorch", icon: "🔥" },
      { name: "TensorFlow", icon: "📐" },
      { name: "Hugging Face", icon: "🤗" },
      { name: "MLflow", icon: "📊" },
      { name: "Vertex AI", icon: "☁️" },
      { name: "scikit-learn", icon: "📈" },
      { name: "ONNX", icon: "🔷" },
    ],
  },
  {
    category: "Computer Vision",
    items: [
      { name: "YOLOv8", icon: "👁️" },
      { name: "OpenCV", icon: "📷" },
      { name: "NVIDIA Triton", icon: "💚" },
      { name: "TensorRT", icon: "🚀" },
      { name: "MediaPipe", icon: "🎯" },
      { name: "Roboflow", icon: "🏷️" },
    ],
  },
  {
    category: "SaaS & Platform",
    items: [
      { name: "Next.js 14", icon: "▲" },
      { name: "React", icon: "⚛️" },
      { name: "Node.js", icon: "💚" },
      { name: "TypeScript", icon: "📘" },
      { name: "Stripe", icon: "💳" },
      { name: "Vercel", icon: "▼" },
    ],
  },
  {
    category: "Data & Infrastructure",
    items: [
      { name: "MongoDB Atlas", icon: "🍃" },
      { name: "PostgreSQL", icon: "🐘" },
      { name: "Redis", icon: "🔴" },
      { name: "AWS", icon: "☁️" },
      { name: "Docker", icon: "🐳" },
      { name: "Kubernetes", icon: "☸️" },
      { name: "Cloudinary", icon: "🌤️" },
    ],
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
            <span className="inline-block text-xs font-mono text-secondary uppercase tracking-widest mb-4">Technology</span>
            <h2 className="text-3xl lg:text-5xl font-display font-extrabold mb-4">
              The Stack Behind <span className="gradient-text">Our Work</span>
            </h2>
            <p className="text-muted-foreground mb-10">Cutting-edge tools chosen for each domain to deliver production-grade AI systems.</p>

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
                      <motion.span
                        key={tech.name}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-mono text-muted-foreground hover:text-primary hover:border-primary/30 glow-hover transition-all cursor-default"
                      >
                        <span>{tech.icon}</span> {tech.name}
                      </motion.span>
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
            <div className="relative rounded-2xl border border-border overflow-hidden">
              <img src={deptPlatform} alt="SunTriX Cloud Platform" className="w-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
            <motion.div
              className="absolute -bottom-4 -left-4 rounded-xl border border-primary/30 bg-card p-4 shadow-xl"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-2xl font-extrabold gradient-text">60+</p>
              <p className="text-[10px] text-muted-foreground">Tools Mastered</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TechStackSection;
