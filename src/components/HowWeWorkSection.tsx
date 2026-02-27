import { FileText, Cpu, Rocket, ArrowRight, Zap, Shield, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import workflowPipeline from "@/assets/workflow-pipeline.png";

const steps = [
  { icon: FileText, num: "01", title: "Brief & Discovery", desc: "Share your requirements, goals, and timeline. We respond within 24 hours." },
  { icon: Cpu, num: "02", title: "Architecture & Design", desc: "Technical blueprint, system design, and detailed proposal with milestones." },
  { icon: Zap, num: "03", title: "Agile Sprint", desc: "Iterative development with weekly demos and continuous feedback loops." },
  { icon: Shield, num: "04", title: "QA & Security", desc: "Rigorous testing, security audits, and performance optimization." },
  { icon: Rocket, num: "05", title: "Deploy & Launch", desc: "Production deployment with CI/CD, documentation, and training." },
  { icon: BarChart3, num: "06", title: "Scale & Support", desc: "Ongoing monitoring, feature iterations, and growth optimization." },
];

const HowWeWorkSection = () => {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={workflowPipeline} alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0 bg-background/90" />
      </div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block text-xs font-mono text-primary uppercase tracking-widest mb-4">Our Process</span>
          <h2 className="text-3xl lg:text-5xl font-display font-extrabold mb-4">
            How We <span className="gradient-text">Deliver</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">A streamlined pipeline designed for speed, transparency, and production-grade quality.</p>
        </motion.div>

        {/* Pipeline visualization */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-secondary to-gold"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ transformOrigin: "left" }}
            />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-6 lg:gap-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                className="relative"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
              >
                <div className="group rounded-xl border border-border bg-card/80 backdrop-blur-sm p-5 hover:border-primary/40 transition-all duration-500 hover:shadow-[0_0_30px_hsl(24_100%_50%/0.1)] h-full flex flex-col items-center text-center">
                  {/* Step number glow */}
                  <motion.div
                    className="relative mb-4"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="h-14 w-14 rounded-xl border border-primary/20 bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 text-[10px] font-mono font-bold text-primary bg-background border border-primary/30 rounded-full h-5 w-5 flex items-center justify-center">
                      {step.num}
                    </span>
                  </motion.div>
                  <h3 className="text-sm font-bold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link to="/how-we-work" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            See Our Full Process <ArrowRight className="h-3 w-3" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HowWeWorkSection;
