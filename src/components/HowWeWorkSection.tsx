import { FileText, Cpu, Rocket, ArrowRight, Zap, Shield, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const steps = [
  { icon: FileText, num: "01", title: "Discovery", desc: "Requirements, goals, timeline. 24hr response." },
  { icon: Cpu, num: "02", title: "Architecture", desc: "System design with milestones & blueprint." },
  { icon: Zap, num: "03", title: "Sprint", desc: "Agile dev with weekly demos & feedback." },
  { icon: Shield, num: "04", title: "QA & Security", desc: "Testing, audits, performance tuning." },
  { icon: Rocket, num: "05", title: "Launch", desc: "CI/CD deploy, docs, and training." },
  { icon: BarChart3, num: "06", title: "Scale", desc: "Monitoring, iterations, growth." },
];

const NeuralConnection = ({ from, to, delay }: { from: number; to: number; delay: number }) => (
  <motion.line
    x1={`${(from * 100) / 5}%`}
    y1="50%"
    x2={`${(to * 100) / 5}%`}
    y2="50%"
    stroke="url(#neuralGrad)"
    strokeWidth="2"
    strokeDasharray="6 4"
    initial={{ pathLength: 0, opacity: 0 }}
    whileInView={{ pathLength: 1, opacity: 0.6 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay }}
  />
);

const HowWeWorkSection = () => {
  return (
    <section className="py-16 lg:py-20 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block text-xs font-mono text-primary uppercase tracking-widest mb-3">Our Process</span>
          <h2 className="text-3xl lg:text-5xl font-display font-extrabold mb-3">
            How We <span className="gradient-text">Deliver</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">A neural pipeline for speed, transparency, and production-grade quality.</p>
        </motion.div>

        {/* Neural Network Pipeline */}
        <div className="relative">
          {/* SVG Neural connections */}
          <svg className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="neuralGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(24 100% 50%)" stopOpacity="0.8" />
                <stop offset="50%" stopColor="hsl(161 100% 41%)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(37 100% 68%)" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3, 4].map((i) => (
              <NeuralConnection key={i} from={i} to={i + 1} delay={i * 0.15} />
            ))}
          </svg>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                className="relative"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
              >
                <div className="group rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4 hover:border-primary/40 transition-all duration-500 hover:shadow-[0_0_30px_hsl(24_100%_50%/0.15)] h-full flex flex-col items-center text-center relative">
                  {/* Neural node */}
                  <motion.div
                    className="relative mb-3"
                    whileHover={{ scale: 1.15 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="h-12 w-12 rounded-full border-2 border-primary/30 bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/60 transition-all relative">
                      <step.icon className="h-5 w-5 text-primary" />
                      {/* Pulse ring */}
                      <motion.div
                        className="absolute inset-0 rounded-full border border-primary/20"
                        animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                      />
                    </div>
                    <span className="absolute -top-1 -right-1 text-[9px] font-mono font-bold text-primary bg-background border border-primary/30 rounded-full h-4 w-4 flex items-center justify-center">
                      {step.num}
                    </span>
                  </motion.div>
                  <h3 className="text-xs font-bold mb-1 text-foreground">{step.title}</h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="mt-8 text-center"
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
