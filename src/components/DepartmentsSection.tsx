import { Bot, Brain, Eye, Layers, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const departments = [
  {
    icon: Bot,
    name: "Agentic AI & Automation",
    description: "Deploy autonomous agents that reason, plan, and execute complex tasks — from customer support to multi-agent orchestration.",
    href: "/services/agentic-ai",
  },
  {
    icon: Brain,
    name: "AI & Machine Learning",
    description: "Custom models, predictive analytics, NLP, recommendation systems, and full MLOps lifecycle management.",
    href: "/services/ai-ml",
  },
  {
    icon: Eye,
    name: "Computer Vision",
    description: "Object detection, image classification, video analytics, OCR, anomaly detection with real-time inference.",
    href: "/services/computer-vision",
  },
  {
    icon: Layers,
    name: "AI Product / SaaS Platform",
    description: "End-to-end SaaS development — multi-tenant architecture, API-first design, AI feature integration, scalable infra.",
    href: "/services/saas-platform",
  },
];

const DepartmentsSection = () => {
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
            What We <span className="gradient-text">Build</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Four specialized departments, one integrated delivery team. We combine disciplines to solve complex AI challenges.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {departments.map((dept, i) => (
            <motion.div
              key={dept.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={dept.href}
                className="group block rounded-xl border border-border bg-card p-8 hover:border-primary/30 glow-hover transition-all duration-300"
              >
                <div className="mb-4 inline-flex rounded-lg gradient-bg p-3">
                  <dept.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                  {dept.name}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {dept.description}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Learn More <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link
            to="/request-task"
            className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-6 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            Need a custom combination? Request a Custom Task <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default DepartmentsSection;
