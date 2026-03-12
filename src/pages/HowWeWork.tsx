import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Search, Cpu, Code2, Rocket, BarChart3, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import VideoDemoSection from "@/components/VideoDemoSection";
import workflowHero from "@/assets/workflow-hero.png";
import { useI18n } from "@/lib/i18n";

const steps = [
  { icon: FileText, num: "01", title: "Discovery & Brief", desc: "We start by understanding your business goals, technical requirements, and success metrics. Submit your project brief and we respond within 24 hours.", duration: "1-2 days" },
  { icon: Search, num: "02", title: "Research & Strategy", desc: "Deep technical research, feasibility analysis, competitor review, and strategic recommendations tailored to your domain.", duration: "2-3 days" },
  { icon: Cpu, num: "03", title: "Architecture & Design", desc: "System architecture, data flow diagrams, API design, infrastructure planning, and UI/UX wireframes — all reviewed with you.", duration: "3-5 days" },
  { icon: Code2, num: "04", title: "Agile Development", desc: "Two-week sprint cycles with daily standups, continuous integration, and bi-weekly demos. Full transparency at every step.", duration: "4-12 weeks" },
  { icon: Rocket, num: "05", title: "Testing & Launch", desc: "Rigorous QA, performance testing, security audit, and staged deployment. We handle the launch so you can focus on growth.", duration: "1-2 weeks" },
  { icon: BarChart3, num: "06", title: "Monitor & Optimize", desc: "Post-launch monitoring, performance optimization, and ongoing support. SLA-backed maintenance retainers available.", duration: "Ongoing" },
];

const HowWeWork = () => {
  const { t } = useI18n();

  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={workflowHero} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <span className="inline-block text-xs font-mono text-primary uppercase tracking-widest mb-4">{t("work.process")}</span>
            <h1 className="text-4xl lg:text-6xl font-extrabold mb-6">
              {t("work.title").split(" ").slice(0, -1).join(" ")} <span className="gradient-text">{t("work.title").split(" ").pop()}</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              A structured, transparent process designed for speed, quality, and trust. From brief to production in weeks, not months.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="space-y-8">
            {steps.map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="grid md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-1 flex md:justify-center">
                  <span className="text-3xl font-mono font-bold gradient-text">{step.num}</span>
                </div>
                <div className="md:col-span-8 rounded-xl border border-border bg-card p-6 lg:p-8 hover:border-primary/30 glow-hover transition-all">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-muted p-2.5 mt-1">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-foreground">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-3 text-center md:text-left">
                  <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                    {step.duration}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Demos */}
      <VideoDemoSection />

      {/* Scrum Methodology */}
      <section className="py-24 bg-card/30 border-t border-border">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold mb-6">{t("work.scrum").split(" ").slice(0, -1).join(" ")} <span className="gradient-text">{t("work.scrum").split(" ").pop()}</span></h2>
          <p className="text-muted-foreground mb-12">Every project follows agile methodology with full visibility into progress.</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { title: "Sprint Planning", desc: "Bi-weekly sprints with clear deliverables and priorities." },
              { title: "Daily Standups", desc: "15-minute syncs to surface blockers and align the team." },
              { title: "Sprint Reviews", desc: "Live demos of completed work with stakeholder feedback." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-card p-6">
                <CheckCircle className="h-5 w-5 text-success mb-3" />
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border text-center">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">{t("work.ready").split(" ").slice(0, -1).join(" ")} <span className="gradient-text">{t("work.ready").split(" ").pop()}</span></h2>
          <p className="text-muted-foreground mb-8">Submit your project brief and receive a proposal within 24 hours.</p>
          <Link to="/request-task" className="gradient-bg inline-flex items-center gap-2 rounded-lg px-8 py-4 text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
            {t("nav.requestTask")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default HowWeWork;
