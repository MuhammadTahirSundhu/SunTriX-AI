import { FileText, Cpu, Rocket, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const steps = [
  { icon: FileText, num: "01", title: "Brief", desc: "Share your project requirements and goals." },
  { icon: Cpu, num: "02", title: "Architecture", desc: "We design the technical blueprint and proposal." },
  { icon: Rocket, num: "03", title: "Delivery", desc: "Agile sprints with continuous demos and feedback." },
];

const HowWeWorkSection = () => {
  return (
    <section className="py-24 lg:py-32 bg-card/30">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">
            How We <span className="gradient-text">Work</span>
          </h2>
          <p className="text-muted-foreground">A streamlined process designed for speed and transparency.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting lines (desktop) */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40" />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              className="text-center relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-muted relative z-10">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <span className="block text-xs font-mono text-primary mb-2">{step.num}</span>
              <h3 className="text-lg font-bold mb-2 text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
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
