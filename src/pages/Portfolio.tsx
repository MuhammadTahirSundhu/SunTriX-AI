import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import Layout from "@/components/Layout";

const projects = [
  { title: "AI-Powered Document Processing", category: "Agentic AI", metric: "10x Faster Processing", desc: "Autonomous pipeline for Fortune 500 company processing 50,000+ documents daily.", tags: ["LangChain", "Python", "AWS"] },
  { title: "Predictive Maintenance Platform", category: "AI & ML", metric: "97.3% Accuracy", desc: "ML-driven maintenance prediction system reducing downtime by 60% in manufacturing.", tags: ["PyTorch", "MLflow", "Docker"] },
  { title: "Quality Inspection System", category: "Computer Vision", metric: "94% Improvement", desc: "Automated PCB defect detection with real-time inference on the production line.", tags: ["YOLO", "OpenCV", "NVIDIA"] },
  { title: "Analytics SaaS Platform", category: "SaaS Platform", metric: "$2M Revenue", desc: "Full-stack analytics platform from 0 to 5,000 users with embedded ML models.", tags: ["Next.js", "PostgreSQL", "Stripe"] },
  { title: "Multi-Agent Customer Service", category: "Agentic AI", metric: "85% Resolution Rate", desc: "AI agents handling tier-1 support with intelligent escalation and learning.", tags: ["AutoGen", "OpenAI", "Redis"] },
  { title: "Real-time Video Surveillance", category: "Computer Vision", metric: "99.1% Detection Rate", desc: "City-scale video analytics for traffic management and public safety.", tags: ["TensorFlow", "Triton", "K8s"] },
];

const categories = ["All", "Agentic AI", "AI & ML", "Computer Vision", "SaaS Platform"];

const Portfolio = () => {
  return (
    <Layout>
      <section className="pt-32 pb-20 bg-grid-pattern">
        <div className="container mx-auto px-4 lg:px-8 pt-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-xs font-mono text-primary uppercase tracking-widest mb-4">Portfolio</span>
            <h1 className="text-4xl lg:text-6xl font-extrabold mb-6">
              Proven <span className="gradient-text">Results</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Real projects, measurable outcomes. See how we've helped teams build and scale intelligent systems.
            </p>
          </motion.div>

          {/* Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat, i) => (
              <button key={cat} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${i === 0 ? "gradient-bg text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"}`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Projects */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, i) => (
              <motion.div key={project.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 glow-hover transition-all">
                <div className="h-48 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent flex items-center justify-center">
                  <span className="text-3xl font-extrabold gradient-text">{project.metric}</span>
                </div>
                <div className="p-6">
                  <span className="inline-block rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold text-secondary mb-3">{project.category}</span>
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{project.desc}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag) => (
                      <span key={tag} className="text-xs font-mono text-muted-foreground bg-muted rounded px-2 py-1">{tag}</span>
                    ))}
                  </div>
                  <Link to="#" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    View Case Study <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Portfolio;
