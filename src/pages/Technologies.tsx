import { motion } from "framer-motion";
import Layout from "@/components/Layout";

const categories = [
  {
    name: "Languages & Frameworks",
    items: [
      { name: "Python", icon: "https://cdn.simpleicons.org/python/ffffff" },
      { name: "TypeScript", icon: "https://cdn.simpleicons.org/typescript/ffffff" },
      { name: "JavaScript", icon: "https://cdn.simpleicons.org/javascript/ffffff" },
      { name: "React", icon: "https://cdn.simpleicons.org/react/ffffff" },
      { name: "Next.js", icon: "https://cdn.simpleicons.org/nextdotjs/ffffff" },
      { name: "Node.js", icon: "https://cdn.simpleicons.org/nodedotjs/ffffff" },
      { name: "FastAPI", icon: "https://cdn.simpleicons.org/fastapi/ffffff" },
      { name: "Django", icon: "https://cdn.simpleicons.org/django/ffffff" },
    ],
  },
  {
    name: "AI & ML",
    items: [
      { name: "TensorFlow", icon: "https://cdn.simpleicons.org/tensorflow/ffffff" },
      { name: "PyTorch", icon: "https://cdn.simpleicons.org/pytorch/ffffff" },
      { name: "scikit-learn", icon: "https://cdn.simpleicons.org/scikitlearn/ffffff" },
      { name: "Hugging Face", icon: "https://cdn.simpleicons.org/huggingface/ffffff" },
      { name: "LangChain", icon: "https://cdn.simpleicons.org/langchain/ffffff" },
      { name: "OpenAI", icon: "https://cdn.simpleicons.org/openai/ffffff" },
      { name: "Anthropic", icon: "https://cdn.simpleicons.org/anthropic/ffffff" },
      { name: "Weights & Biases", icon: "https://cdn.simpleicons.org/weightsandbiases/ffffff" },
    ],
  },
  {
    name: "Computer Vision",
    items: [
      { name: "OpenCV", icon: "https://cdn.simpleicons.org/opencv/ffffff" },
      { name: "NVIDIA", icon: "https://cdn.simpleicons.org/nvidia/ffffff" },
      { name: "ONNX", icon: "https://cdn.simpleicons.org/onnx/ffffff" },
      { name: "TensorRT", icon: "https://cdn.simpleicons.org/nvidia/ffffff" },
    ],
  },
  {
    name: "Data & Databases",
    items: [
      { name: "PostgreSQL", icon: "https://cdn.simpleicons.org/postgresql/ffffff" },
      { name: "MongoDB", icon: "https://cdn.simpleicons.org/mongodb/ffffff" },
      { name: "Redis", icon: "https://cdn.simpleicons.org/redis/ffffff" },
      { name: "Elasticsearch", icon: "https://cdn.simpleicons.org/elasticsearch/ffffff" },
      { name: "Pinecone", icon: "https://cdn.simpleicons.org/pinecone/ffffff" },
      { name: "ClickHouse", icon: "https://cdn.simpleicons.org/clickhouse/ffffff" },
    ],
  },
  {
    name: "Cloud & DevOps",
    items: [
      { name: "AWS", icon: "https://cdn.simpleicons.org/amazonaws/ffffff" },
      { name: "Google Cloud", icon: "https://cdn.simpleicons.org/googlecloud/ffffff" },
      { name: "Azure", icon: "https://cdn.simpleicons.org/microsoftazure/ffffff" },
      { name: "Docker", icon: "https://cdn.simpleicons.org/docker/ffffff" },
      { name: "Kubernetes", icon: "https://cdn.simpleicons.org/kubernetes/ffffff" },
      { name: "Terraform", icon: "https://cdn.simpleicons.org/terraform/ffffff" },
      { name: "GitHub Actions", icon: "https://cdn.simpleicons.org/githubactions/ffffff" },
      { name: "Vercel", icon: "https://cdn.simpleicons.org/vercel/ffffff" },
    ],
  },
  {
    name: "Monitoring & Tools",
    items: [
      { name: "Prometheus", icon: "https://cdn.simpleicons.org/prometheus/ffffff" },
      { name: "Grafana", icon: "https://cdn.simpleicons.org/grafana/ffffff" },
      { name: "Datadog", icon: "https://cdn.simpleicons.org/datadog/ffffff" },
      { name: "MLflow", icon: "https://cdn.simpleicons.org/mlflow/ffffff" },
      { name: "Sentry", icon: "https://cdn.simpleicons.org/sentry/ffffff" },
      { name: "Stripe", icon: "https://cdn.simpleicons.org/stripe/ffffff" },
    ],
  },
];

const Technologies = () => {
  return (
    <Layout>
      <section className="pt-28 pb-14 bg-grid-pattern">
        <div className="container mx-auto px-4 lg:px-8 pt-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-10">
            <span className="inline-block text-xs font-mono text-primary uppercase tracking-widest mb-3">Tech Stack</span>
            <h1 className="text-4xl lg:text-6xl font-extrabold mb-4">
              Tools & <span className="gradient-text">Technologies</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Battle-tested tools and frameworks we use to build production-grade intelligent systems.
            </p>
          </motion.div>

          <div className="space-y-10">
            {categories.map((cat, ci) => (
              <motion.div key={cat.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: ci * 0.05 }}>
                <h2 className="text-sm font-bold mb-4 text-foreground">{cat.name}</h2>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((item) => (
                    <motion.div
                      key={item.name}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="group flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all cursor-default"
                    >
                      <img src={item.icon} alt={item.name} className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" loading="lazy" />
                      {item.name}
                    </motion.div>
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
