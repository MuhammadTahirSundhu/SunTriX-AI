import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Brain, Eye, Layers, Zap, Shield, Clock, Users } from "lucide-react";
import Layout from "@/components/Layout";
import servicesHero from "@/assets/services-hero.png";

const departments = [
  {
    icon: Bot,
    name: "Agentic AI & Automation",
    href: "/services/agentic-ai",
    capabilities: [
      "Autonomous AI Agents",
      "Workflow Automation",
      "Multi-Agent Systems",
      "API Orchestration",
      "Document Processing",
    ],
  },
  {
    icon: Brain,
    name: "AI & Machine Learning",
    href: "/services/ai-ml",
    capabilities: [
      "Predictive Analytics",
      "NLP & LLMs",
      "Recommendation Systems",
      "MLOps & Lifecycle",
      "Custom Model Training",
    ],
  },
  {
    icon: Eye,
    name: "Computer Vision",
    href: "/services/computer-vision",
    capabilities: [
      "Object Detection",
      "Image Classification",
      "Video Analytics",
      "OCR & Document AI",
      "Anomaly Detection",
    ],
  },
  {
    icon: Layers,
    name: "AI Product / SaaS Platform",
    href: "/services/saas-platform",
    capabilities: [
      "Multi-tenant Architecture",
      "API-first Design",
      "AI Feature Integration",
      "Scalable Infrastructure",
      "Monitoring & Analytics",
    ],
  },
];

const ServicesOverview = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img src={servicesHero} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <span className="inline-block text-xs font-mono text-primary uppercase tracking-widest mb-4">Our Services</span>
            <h1 className="text-4xl lg:text-6xl font-extrabold mb-6">
              Full-Stack <span className="gradient-text">AI Capabilities</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Four specialized departments, one integrated delivery team. We combine disciplines to solve the most complex AI challenges.
            </p>
            <Link to="/request-task" className="gradient-bg inline-flex items-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              Request a Task <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-border py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Zap, label: "50+ Projects", sub: "Delivered" },
              { icon: Shield, label: "Enterprise", sub: "Grade Security" },
              { icon: Clock, label: "24-Hour", sub: "Proposal SLA" },
              { icon: Users, label: "Dedicated", sub: "Teams Available" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <item.icon className="h-5 w-5 text-primary" />
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Department Tiles */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {departments.map((dept, i) => (
              <motion.div key={dept.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link to={dept.href} className="group block rounded-xl border border-border bg-card p-8 lg:p-10 hover:border-primary/30 glow-hover transition-all duration-300 h-full">
                  <div className="mb-6 inline-flex rounded-lg gradient-bg p-3">
                    <dept.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">{dept.name}</h3>
                  <ul className="space-y-2 mb-6">
                    {dept.capabilities.map((cap) => (
                      <li key={cap} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                        {cap}
                      </li>
                    ))}
                  </ul>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Explore Department <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">We combine departments for complex builds</p>
            <Link to="/request-task" className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-6 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
              Request a Custom Task <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ServicesOverview;
