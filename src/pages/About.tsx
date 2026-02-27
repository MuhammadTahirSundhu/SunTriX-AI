import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Target, Lightbulb, Users, Globe, Award, Shield, TrendingUp, Clock, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import aboutHero from "@/assets/about-hero.png";

const values = [
  { icon: Target, title: "Outcome-Driven", desc: "Every project is measured by business impact, not just technical delivery." },
  { icon: Lightbulb, title: "Innovation First", desc: "Pushing boundaries of AI while staying grounded in pragmatism." },
  { icon: Users, title: "Partnership Model", desc: "We embed in your team. Long-term success is our metric." },
  { icon: Globe, title: "Global Reach", desc: "Distributed team across time zones, delivering worldwide." },
  { icon: Award, title: "Excellence", desc: "Every architecture decision built to enterprise standards." },
  { icon: Shield, title: "Trust & Security", desc: "SOC 2 compliant, encrypted, NDA-first engagements." },
];

const stats = [
  { value: "50+", label: "Projects Delivered", icon: TrendingUp },
  { value: "98%", label: "Client Retention", icon: Users },
  { value: "24h", label: "Response Time", icon: Clock },
  { value: "4.9/5", label: "Avg Rating", icon: Award },
];

const team = [
  { name: "Alex Chen", role: "CEO & Co-Founder", area: "AI Strategy & Business" },
  { name: "Sarah Mitchell", role: "CTO", area: "ML Architecture & Engineering" },
  { name: "David Park", role: "Head of AI", area: "NLP & Agentic Systems" },
  { name: "Priya Sharma", role: "Head of CV", area: "Computer Vision & Edge AI" },
  { name: "Marcus Johnson", role: "VP Engineering", area: "Platform & Infrastructure" },
  { name: "Elena Rodriguez", role: "Head of Design", area: "UX & Product Design" },
];

const techPartners = [
  { name: "OpenAI", icon: "https://cdn.simpleicons.org/openai/ffffff" },
  { name: "Google Cloud", icon: "https://cdn.simpleicons.org/googlecloud/ffffff" },
  { name: "AWS", icon: "https://cdn.simpleicons.org/amazonaws/ffffff" },
  { name: "Microsoft Azure", icon: "https://cdn.simpleicons.org/microsoftazure/ffffff" },
  { name: "NVIDIA", icon: "https://cdn.simpleicons.org/nvidia/ffffff" },
  { name: "Hugging Face", icon: "https://cdn.simpleicons.org/huggingface/ffffff" },
];

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-28 pb-12 overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img src={aboutHero} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <span className="inline-block text-xs font-mono text-primary uppercase tracking-widest mb-3">About SunTriX</span>
            <h1 className="text-4xl lg:text-6xl font-extrabold mb-4">
              Building the Future of{" "}
              <span className="gradient-text">Intelligent Systems</span>
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              SunTriX is an AI-first technology partner helping enterprises design, build, and scale intelligent systems. Deep expertise meets relentless focus on business outcomes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 border-y border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-extrabold gradient-text">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="rounded-xl border border-border bg-card p-6">
              <span className="text-xs font-mono text-primary uppercase tracking-widest">Mission</span>
              <h2 className="text-xl font-bold mt-2 mb-3">Democratize AI for Enterprise</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">Every organization should have access to world-class AI capabilities. We make cutting-edge AI accessible, practical, and impactful for businesses of all sizes.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="rounded-xl border border-border bg-card p-6">
              <span className="text-xs font-mono text-primary uppercase tracking-widest">Vision</span>
              <h2 className="text-xl font-bold mt-2 mb-3">AI-Powered Organizations</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">AI seamlessly woven into every business process — augmenting human capabilities, driving efficiency, and unlocking new possibilities.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Technology Partners */}
      <section className="py-10 border-b border-border bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest text-center mb-6">Technology Partners & Expertise</h3>
          <div className="flex flex-wrap justify-center gap-6">
            {techPartners.map((partner, i) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-5 py-3 hover:border-primary/30 transition-all"
              >
                <img src={partner.icon} alt={partner.name} className="h-5 w-5 opacity-70" loading="lazy" />
                <span className="text-sm font-medium text-muted-foreground">{partner.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-extrabold mb-8 text-center">Our <span className="gradient-text">Values</span></h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {values.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card p-5 flex gap-4">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <v.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm mb-1">{v.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-extrabold mb-8 text-center">Leadership <span className="gradient-text">Team</span></h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.map((member, i) => (
              <motion.div key={member.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-primary-foreground">{member.name.split(" ").map(n => n[0]).join("")}</span>
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">{member.name}</h3>
                  <p className="text-xs text-primary">{member.role}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{member.area}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 border-b border-border bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-extrabold mb-8 text-center">Why <span className="gradient-text">SunTriX</span></h2>
          <div className="grid md:grid-cols-2 gap-3 max-w-3xl mx-auto">
            {[
              "End-to-end AI solutions — from strategy to production deployment",
              "Dedicated team assigned to your project with weekly sprint demos",
              "Production-grade code with CI/CD, testing, and monitoring built-in",
              "Transparent pricing with milestone-based billing, no surprises",
              "Post-launch support with SLAs, monitoring, and feature iterations",
              "NDA-first, SOC 2 compliant security practices for all engagements",
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card"
              >
                <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <p className="text-xs text-foreground leading-relaxed">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 text-center">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-extrabold mb-3">Join Us in <span className="gradient-text">Building the Future</span></h2>
          <p className="text-sm text-muted-foreground mb-6">Let's discuss how SunTriX can accelerate your AI journey.</p>
          <Link to="/contact" className="gradient-bg inline-flex items-center gap-2 rounded-lg px-7 py-3.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
            Get in Touch <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default About;
