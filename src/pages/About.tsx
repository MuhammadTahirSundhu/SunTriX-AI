import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Target, Lightbulb, Users, Globe, Award, Shield } from "lucide-react";
import Layout from "@/components/Layout";
import aboutHero from "@/assets/about-hero.png";
import ceoPortrait from "@/assets/ceo-portrait.png";
import { useI18n } from "@/lib/i18n";

const values = [
  { icon: Target, title: "Outcome-Driven", desc: "Every project is measured by business impact, not just technical delivery." },
  { icon: Lightbulb, title: "Innovation First", desc: "We push the boundaries of what's possible with AI while staying grounded in pragmatism." },
  { icon: Users, title: "Partnership Model", desc: "We embed in your team, not just deliver code. Long-term success is our metric." },
  { icon: Globe, title: "Global Reach", desc: "Distributed team across time zones, delivering for clients worldwide." },
  { icon: Award, title: "Excellence", desc: "Every line of code, every architecture decision — built to enterprise standards." },
  { icon: Shield, title: "Trust & Security", desc: "SOC 2 compliant practices, encrypted communications, and NDA-first engagements." },
];

const team = [
  { name: "Alex Chen", role: "CEO & Co-Founder", area: "AI Strategy & Business" },
  { name: "Sarah Mitchell", role: "CTO", area: "ML Architecture & Engineering" },
  { name: "David Park", role: "Head of AI", area: "NLP & Agentic Systems" },
  { name: "Priya Sharma", role: "Head of CV", area: "Computer Vision & Edge AI" },
  { name: "Marcus Johnson", role: "VP Engineering", area: "Platform & Infrastructure" },
  { name: "Elena Rodriguez", role: "Head of Design", area: "UX & Product Design" },
];

const About = () => {
  const { t } = useI18n();

  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={aboutHero} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-block text-xs font-mono text-primary uppercase tracking-widest mb-4">{t("about.title")}</span>
              <h1 className="text-4xl lg:text-6xl font-extrabold mb-6">
                {t("about.hero.headline")}{" "}
                <span className="gradient-text">{t("about.hero.gradient")}</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                SunTriX is an AI-first technology partner helping enterprises design, build, and scale intelligent systems. We combine deep technical expertise with a relentless focus on business outcomes.
              </p>
            </motion.div>
            {/* CEO Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex justify-center lg:justify-end"
            >
              <div className="relative">
                {/* Glow ring behind */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-secondary/10 to-gold/10 blur-2xl scale-110" />
                <div className="relative h-72 w-72 lg:h-96 lg:w-96 rounded-full overflow-hidden border-4 border-primary/20 shadow-2xl">
                  <img src={ceoPortrait} alt="CEO - Alex Chen" className="w-full h-full object-cover object-top" />
                </div>
                {/* Name tag */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm border border-border rounded-xl px-5 py-2.5 text-center shadow-lg"
                >
                  <p className="text-sm font-bold text-foreground">Alex Chen</p>
                  <p className="text-xs text-primary">CEO & Co-Founder</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="rounded-xl border border-border bg-card p-8 lg:p-10">
              <span className="text-xs font-mono text-primary uppercase tracking-widest">{t("about.mission")}</span>
              <h2 className="text-2xl font-bold mt-3 mb-4">Democratize AI for Enterprise</h2>
              <p className="text-muted-foreground leading-relaxed">We believe every organization should have access to world-class AI capabilities. Our mission is to make cutting-edge AI accessible, practical, and impactful for businesses of all sizes.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="rounded-xl border border-border bg-card p-8 lg:p-10">
              <span className="text-xs font-mono text-primary uppercase tracking-widest">{t("about.vision")}</span>
              <h2 className="text-2xl font-bold mt-3 mb-4">AI-Powered Organizations</h2>
              <p className="text-muted-foreground leading-relaxed">We envision a world where AI is seamlessly woven into every business process — augmenting human capabilities, driving efficiency, and unlocking new possibilities.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-card/30 border-t border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-3xl font-extrabold mb-12 text-center">{t("about.values").replace("Our ", "Our ")} <span className="gradient-text">Values</span></h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card p-6">
                <v.icon className="h-6 w-6 text-primary mb-4" />
                <h3 className="font-bold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-3xl font-extrabold mb-12 text-center">{t("about.team").split(" ")[0]} <span className="gradient-text">{t("about.team").split(" ").slice(1).join(" ")}</span></h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member, i) => (
              <motion.div key={member.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card p-6 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground">{member.name.split(" ").map(n => n[0]).join("")}</span>
                </div>
                <h3 className="font-bold text-foreground">{member.name}</h3>
                <p className="text-sm text-primary">{member.role}</p>
                <p className="text-xs text-muted-foreground mt-1">{member.area}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-card/30 border-t border-border text-center">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-3xl font-extrabold mb-4">Join Us in <span className="gradient-text">Building the Future</span></h2>
          <p className="text-muted-foreground mb-8">Let's discuss how SunTriX can accelerate your AI journey.</p>
          <Link to="/contact" className="gradient-bg inline-flex items-center gap-2 rounded-lg px-8 py-4 text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
            {t("cta.getInTouch")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default About;
