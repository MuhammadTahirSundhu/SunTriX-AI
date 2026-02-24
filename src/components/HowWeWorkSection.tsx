import { FileText, Cpu, Rocket, ArrowRight, Zap, Shield, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const steps = [
  { icon: FileText, num: "01", title: "Brief", desc: "Share your project requirements, goals, and timeline." },
  { icon: Cpu, num: "02", title: "Architecture", desc: "We design the technical blueprint and deliver a detailed proposal." },
  { icon: Zap, num: "03", title: "Sprint", desc: "Agile development with weekly demos and continuous feedback." },
  { icon: Shield, num: "04", title: "QA & Testing", desc: "Rigorous testing, security audits, and performance optimization." },
  { icon: Rocket, num: "05", title: "Delivery", desc: "Production deployment with documentation and training." },
  { icon: BarChart3, num: "06", title: "Scale", desc: "Ongoing support, monitoring, and feature iterations." },
];

const HowWeWorkSection = () => {
  return (
    <section className="py-24 lg:py-32 bg-card/30 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-display font-extrabold mb-4">
            How We <span className="gradient-text">Work</span>
          </h2>
          <p className="text-muted-foreground">A streamlined process designed for speed and transparency.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              className="text-center relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="rounded-xl border border-border bg-card p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_30px_hsl(24_100%_50%/0.08)]">
                <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 group-hover:animate-icon-glow transition-all">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="block text-xs font-mono text-primary/60 mb-2">{step.num}</span>
                <h3 className="text-base font-bold mb-2 text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/how-we-work" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            See Our Full Process <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowWeWorkSection;
