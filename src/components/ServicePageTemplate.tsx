import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Layout from "@/components/Layout";

interface ServicePageProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  useCases: { title: string; desc: string }[];
  process: { step: string; title: string; desc: string }[];
  techStack: string[];
  caseStudy: { title: string; metric: string; desc: string };
}

const ServicePageTemplate = ({ icon: Icon, title, subtitle, description, useCases, process, techStack, caseStudy }: ServicePageProps) => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-grid-pattern">
        <div className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <div className="inline-flex rounded-lg gradient-bg p-3 mb-6">
              <Icon className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">{title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{subtitle}</p>
            <p className="text-muted-foreground leading-relaxed mb-8">{description}</p>
            <Link to="/request-task" className="gradient-bg inline-flex items-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              Request a Custom Task <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-3xl font-extrabold mb-12">Use <span className="gradient-text">Cases</span></h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((uc, i) => (
              <motion.div key={uc.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card p-6 hover:border-primary/30 glow-hover transition-all">
                <h3 className="text-lg font-bold mb-2 text-foreground">{uc.title}</h3>
                <p className="text-sm text-muted-foreground">{uc.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-card/30 border-t border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-3xl font-extrabold mb-12">How We <span className="gradient-text">Build It</span></h2>
          <div className="grid md:grid-cols-4 gap-6">
            {process.map((p, i) => (
              <motion.div key={p.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-mono font-bold text-primary mb-4">{p.step}</span>
                <h3 className="text-lg font-bold mb-2 text-foreground">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-3xl font-extrabold mb-12">Tech <span className="gradient-text">Stack</span></h2>
          <div className="flex flex-wrap gap-3">
            {techStack.map((tech) => (
              <span key={tech} className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-mono text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">{tech}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study Teaser */}
      <section className="py-24 bg-card/30 border-t border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-xl border border-border bg-card p-8 lg:p-12 max-w-3xl">
            <span className="text-xs font-mono text-primary uppercase tracking-widest mb-2 block">Case Study</span>
            <h3 className="text-2xl font-bold mb-2 text-foreground">{caseStudy.title}</h3>
            <div className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 mb-4">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm font-semibold text-success">{caseStudy.metric}</span>
            </div>
            <p className="text-muted-foreground mb-6">{caseStudy.desc}</p>
            <Link to="/work" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View Full Case Study <ArrowRight className="h-3 w-3" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">Ready to <span className="gradient-text">Start</span>?</h2>
          <p className="text-muted-foreground mb-8">24-hour proposal guarantee. No commitment required.</p>
          <Link to="/request-task" className="gradient-bg inline-flex items-center gap-2 rounded-lg px-8 py-4 text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
            Request a Custom Task <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default ServicePageTemplate;
