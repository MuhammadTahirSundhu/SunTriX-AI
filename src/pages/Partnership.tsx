import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Users, Clock, Target, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";

const models = [
  { title: "Full-Time Dedicated Team", desc: "A complete engineering team working exclusively on your project. Ideal for large-scale, ongoing initiatives.", features: ["Dedicated PM & Tech Lead", "2-8 Engineers", "Daily standups", "Monthly reporting"], icon: Users },
  { title: "Part-Time Engagement", desc: "Flexible allocation for projects that need expert AI support without a full-time commitment.", features: ["Shared PM", "1-4 Engineers", "Weekly syncs", "Sprint-based billing"], icon: Clock },
  { title: "Outcome-Based", desc: "Fixed-scope engagement tied to deliverables and milestones. Pay for results, not hours.", features: ["Defined milestones", "Fixed pricing", "Risk-shared model", "SLA guarantees"], icon: Target },
];

const Partnership = () => {
  return (
    <Layout>
      <section className="pt-32 pb-20 bg-grid-pattern">
        <div className="container mx-auto px-4 lg:px-8 pt-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-xs font-mono text-primary uppercase tracking-widest mb-4">Partnership</span>
            <h1 className="text-4xl lg:text-6xl font-extrabold mb-6">
              Need a Dedicated <span className="gradient-text">AI Team</span>?
            </h1>
            <p className="text-lg text-muted-foreground">
              Flexible engagement models designed to scale with your needs — from embedded teams to outcome-based delivery.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {models.map((model, i) => (
              <motion.div key={model.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-8 hover:border-primary/30 glow-hover transition-all flex flex-col">
                <div className="mb-4 inline-flex rounded-lg gradient-bg p-3 self-start">
                  <model.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{model.title}</h3>
                <p className="text-sm text-muted-foreground mb-6 flex-1">{model.desc}</p>
                <ul className="space-y-2 mb-6">
                  {model.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-success" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-5 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
                  Get Started <ArrowRight className="h-3 w-3" />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-24 text-center">
            <h2 className="text-3xl font-extrabold mb-4">Not sure which model <span className="gradient-text">fits</span>?</h2>
            <p className="text-muted-foreground mb-8">Book a discovery call and we'll recommend the best approach for your project.</p>
            <Link to="/contact" className="gradient-bg inline-flex items-center gap-2 rounded-lg px-8 py-4 text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              Book a Discovery Call <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Partnership;
