import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { departmentStore, type Department } from "@/lib/cms-store";
import deptAgents from "@/assets/dept-agents.png";
import deptIntelligence from "@/assets/dept-intelligence.png";
import deptVision from "@/assets/dept-vision.png";
import deptPlatform from "@/assets/dept-platform.png";

const defaultImages: Record<string, string> = {
  "SunTriX Agents": deptAgents,
  "SunTriX Intelligence": deptIntelligence,
  "SunTriX Vision": deptVision,
  "SunTriX Platform": deptPlatform,
};

const DepartmentsSection = () => {
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    setDepartments(departmentStore.getEnabled());
  }, []);

  return (
    <section className="py-16 lg:py-20 relative">
      <div className="absolute inset-0 bg-neural-grid opacity-15" />
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block text-xs font-mono text-secondary uppercase tracking-widest mb-3">Departments</span>
          <h2 className="text-3xl lg:text-5xl font-display font-extrabold mb-3">
            What We <span className="gradient-text">Build</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
            Four specialized departments, one integrated delivery team.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map((dept, i) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <Link
                to={dept.href}
                className="group block rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-all duration-500 hover:shadow-[0_0_30px_hsl(24_100%_50%/0.12)] hover:-translate-y-1"
              >
                <div className="relative h-40 overflow-hidden">
                  <motion.img
                    src={dept.image || defaultImages[dept.name] || deptAgents}
                    alt={dept.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 0.5 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                  <p className="absolute bottom-2 left-3 text-base font-display font-bold text-foreground">
                    {dept.name}
                  </p>
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-semibold text-primary mb-1.5 uppercase tracking-wider">{dept.subtitle}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                    {dept.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all duration-300">
                    Explore <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link
            to="/request-task"
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-5 py-2.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            Need a custom combination? Request a Custom Task <ArrowRight className="h-3 w-3" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default DepartmentsSection;
