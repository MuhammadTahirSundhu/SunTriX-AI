import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import deptAgents from "@/assets/dept-agents.png";
import deptAutomate from "@/assets/dept-automate.png";
import deptVision from "@/assets/dept-vision.png";
import deptIntelligence from "@/assets/dept-intelligence.png";

const departments = [
  {
    image: deptAgents,
    name: "SunTriX Agents",
    subtitle: "Agentic AI & Automation",
    description: "Deploy autonomous agents that reason, plan, and execute complex tasks — from customer support to multi-agent orchestration.",
    href: "/services/agentic-ai",
  },
  {
    image: deptAutomate,
    name: "SunTriX Automate",
    subtitle: "AI Workflow Automation",
    description: "Intelligent automation systems that streamline operations, reduce manual effort, and boost efficiency across your organization.",
    href: "/services/ai-ml",
  },
  {
    image: deptVision,
    name: "SunTriX Vision",
    subtitle: "Computer Vision",
    description: "Object detection, image classification, video analytics, OCR, anomaly detection with real-time edge inference.",
    href: "/services/computer-vision",
  },
  {
    image: deptIntelligence,
    name: "SunTriX Intelligence",
    subtitle: "AI & Machine Learning",
    description: "Custom models, predictive analytics, NLP, recommendation systems, and full MLOps lifecycle management.",
    href: "/services/saas-platform",
  },
];

const DepartmentsSection = () => {
  return (
    <section className="py-24 lg:py-32 relative">
      <div className="absolute inset-0 bg-neural-grid opacity-30" />
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-display font-extrabold mb-4">
            What We <span className="gradient-text">Build</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Four specialized departments, one integrated delivery team.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {departments.map((dept, i) => (
            <motion.div
              key={dept.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={dept.href}
                className="group block rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-all duration-500 hover:shadow-[0_0_40px_hsl(24_100%_50%/0.1)]"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={dept.image}
                    alt={dept.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                  <p className="absolute bottom-3 left-4 text-lg font-display font-bold text-foreground">
                    {dept.name}
                  </p>
                </div>
                <div className="p-5">
                  <p className="text-xs font-medium text-primary mb-2">{dept.subtitle}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                    {dept.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                    Explore <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
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
