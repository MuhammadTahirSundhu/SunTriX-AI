import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { apiRequest, ENDPOINTS } from "@/lib/api";

interface Department { _id: string; name: string; subtitle: string; description: string; image: string; href: string; }

const DepartmentsSection = () => {
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    apiRequest<Department[]>(ENDPOINTS.DEPARTMENTS_LIST).then(({ data }) => {
      if (data) setDepartments(data);
    });
  }, []);

  const getImage = (dept: Department) => dept.image || "";


  return (
    <section className="py-24 lg:py-32 relative">
      <div className="absolute inset-0 bg-neural-grid opacity-20" />
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block text-xs font-mono text-secondary uppercase tracking-widest mb-4">Departments</span>
          <h2 className="text-3xl lg:text-5xl font-display font-extrabold mb-4">
            What We <span className="gradient-text">Build</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Four specialized departments, one integrated delivery team.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {departments.map((dept, i) => {
            const imgSrc = getImage(dept);
            return (
              <motion.div
                key={dept._id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link
                  to={dept.href}
                  className="group block rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-all duration-500 hover:shadow-[0_0_40px_hsl(24_100%_50%/0.12)] hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden">
                    <motion.img
                      src={imgSrc}
                      alt={dept.name}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                    <p className="absolute bottom-3 left-4 text-lg font-display font-bold text-foreground">
                      {dept.name}
                    </p>
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-semibold text-primary mb-2">{dept.subtitle}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                      {dept.description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-3 transition-all duration-300">
                      Explore <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link
            to="/request-task"
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-6 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            Need a custom combination? Request a Custom Task <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default DepartmentsSection;
