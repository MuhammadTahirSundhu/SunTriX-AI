import { motion } from "framer-motion";
import Layout from "@/components/Layout";

const categories = [
  { name: "Languages & Frameworks", items: ["Python", "TypeScript", "JavaScript", "React", "Next.js", "Node.js", "FastAPI", "Django"] },
  { name: "AI & ML", items: ["TensorFlow", "PyTorch", "Scikit-learn", "HuggingFace", "LangChain", "AutoGen", "OpenAI", "Anthropic"] },
  { name: "Computer Vision", items: ["OpenCV", "YOLO", "Detectron2", "TensorFlow Lite", "ONNX", "Triton Inference", "NVIDIA CUDA"] },
  { name: "Data & Databases", items: ["PostgreSQL", "MongoDB", "Redis", "Elasticsearch", "Pinecone", "Weaviate", "ClickHouse"] },
  { name: "Cloud & DevOps", items: ["AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "GitHub Actions", "Vercel"] },
  { name: "Monitoring & Tools", items: ["Prometheus", "Grafana", "Datadog", "MLflow", "Weights & Biases", "Sentry", "Stripe"] },
];

const Technologies = () => {
  return (
    <Layout>
      <section className="pt-32 pb-20 bg-grid-pattern">
        <div className="container mx-auto px-4 lg:px-8 pt-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-xs font-mono text-primary uppercase tracking-widest mb-4">Tech Stack</span>
            <h1 className="text-4xl lg:text-6xl font-extrabold mb-6">
              Tools & <span className="gradient-text">Technologies</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Battle-tested tools and frameworks we use to build production-grade intelligent systems.
            </p>
          </motion.div>

          <div className="space-y-16">
            {categories.map((cat, ci) => (
              <motion.div key={cat.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: ci * 0.05 }}>
                <h2 className="text-xl font-bold mb-6 text-foreground">{cat.name}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {cat.items.map((item) => (
                    <div key={item} className="flex items-center justify-center rounded-xl border border-border bg-card px-4 py-4 text-sm font-mono text-muted-foreground hover:text-primary hover:border-primary/30 glow-hover transition-all cursor-default text-center">
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Technologies;
