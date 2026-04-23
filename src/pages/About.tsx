import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Target, Lightbulb, Users, Globe, Award, Shield } from "lucide-react";
import Layout from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useMedia } from "@/hooks/use-media";
import { useSEO } from "@/hooks/useSEO";
import { apiRequest, ENDPOINTS } from "@/lib/api";

const values = [
  { icon: Target, title: "Outcome-Driven", desc: "Every project is measured by business impact, not just technical delivery." },
  { icon: Lightbulb, title: "Innovation First", desc: "We push the boundaries of what's possible with AI while staying grounded in pragmatism." },
  { icon: Users, title: "Partnership Model", desc: "We embed in your team, not just deliver code. Long-term success is our metric." },
  { icon: Globe, title: "Global Reach", desc: "Distributed team across time zones, delivering for clients worldwide." },
  { icon: Award, title: "Excellence", desc: "Every line of code, every architecture decision — built to enterprise standards." },
  { icon: Shield, title: "Trust & Security", desc: "SOC 2 compliant practices, encrypted communications, and NDA-first engagements." },
];

const About = () => {
  const [team, setTeam] = useState<any[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      const { data } = await apiRequest<any[]>(ENDPOINTS.TEAM_LIST);
      if (data) setTeam(data);
      setLoadingTeam(false);
    };
    fetchTeam();
  }, []);

  useSEO({
    title: "About Us — SunTriX AI Solutions",
    description: "SunTriX is an AI-first technology partner helping enterprises design, build, and scale intelligent systems.",
    canonicalUrl: "https://www.suntrix.ai/about",
  });

  const { t } = useI18n();
  const aboutHero = useMedia("about-hero");
  const ceoPortrait = useMedia("ceo-portrait");

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
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex justify-center lg:justify-end"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-secondary/10 to-gold/10 blur-2xl scale-110" />
                <div className="relative h-72 w-72 lg:h-96 lg:w-96 rounded-full overflow-hidden border-4 border-primary/20 shadow-2xl">
                  <img src={ceoPortrait} alt="CEO - Alex Chen" className="w-full h-full object-cover object-top" />
                </div>
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
          <div className="grid md:grid-cols-2 gap-16">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-xs font-mono text-primary uppercase tracking-widest mb-3 block">Mission</span>
              <h2 className="text-2xl font-bold text-foreground mb-4">Democratize Enterprise AI</h2>
              <p className="text-muted-foreground leading-relaxed">
                We believe every business should have access to world-class AI engineering. Our mission is to remove the complexity barrier between ambitious ideas and production-grade AI systems.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-xs font-mono text-primary uppercase tracking-widest mb-3 block">Vision</span>
              <h2 className="text-2xl font-bold text-foreground mb-4">Intelligence Everywhere</h2>
              <p className="text-muted-foreground leading-relaxed">
                A future where AI is seamlessly woven into every business process — not as a tool, but as a thinking partner that perceives, reasons, and acts alongside human teams.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-extrabold text-foreground mb-4">Our <span className="gradient-text">Values</span></h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-6 hover:border-primary/30 transition-colors">
                <v.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-base font-bold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-extrabold text-foreground mb-4">Leadership <span className="gradient-text">Team</span></h2>
          </motion.div>
          {loadingTeam ? (
            <div className="flex justify-center"><div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div></div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {team.map((member, i) => (
                <motion.div key={member._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="rounded-xl border border-border bg-card p-6 text-center">
                  {member.imageUrl ? (
                    <img src={member.imageUrl} alt={member.name} className="h-16 w-16 rounded-full object-cover mx-auto mb-4 border-2 border-primary/20" />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mx-auto mb-4 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">{member.name.split(" ").map((n: string) => n[0]).join("")}</span>
                    </div>
                  )}
                  <h3 className="text-base font-bold text-foreground">{member.name}</h3>
                  <p className="text-sm text-primary">{member.role}</p>
                  <p className="text-xs text-muted-foreground mt-1">{member.department}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-foreground mb-4">Ready to Build Something <span className="gradient-text">Extraordinary</span>?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Let's discuss how AI can transform your business.</p>
          <Link to="/request-task" className="gradient-bg inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-primary-foreground hover:opacity-90 transition-opacity">
            Start a Conversation <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default About;
