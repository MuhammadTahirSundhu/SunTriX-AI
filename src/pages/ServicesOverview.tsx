import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Brain, Eye, Layers, Zap, Shield, Clock, Users, Sparkles } from "lucide-react";
import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import servicesHero from "@/assets/services-hero.png";

interface Department {
  _id: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  href: string;
  capabilities: string[];
}

const ICON_MAP: Record<string, any> = {
  "Agentic AI": Bot,
  "AI & ML": Brain,
  "Computer Vision": Eye,
  "SaaS Platform": Layers,
  "Default": Sparkles
};

const ServicesOverview = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<Department[]>(ENDPOINTS.DEPARTMENTS_LIST).then(({ data }) => {
      if (data) setDepartments(data);
      setLoading(false);
    });
  }, []);

  const getIcon = (name: string) => {
    for (const key in ICON_MAP) {
      if (name.includes(key)) return ICON_MAP[key];
    }
    return ICON_MAP.Default;
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-grid-white/[0.02]">
        <div className="absolute inset-0 z-0">
          <img src={servicesHero} alt="" className="w-full h-full object-cover opacity-20 scale-105" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        </div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-16">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-8">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-[10px] font-mono text-primary uppercase tracking-[0.2em] font-bold">Comprehensive Intelligence</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-display font-black mb-8 leading-tight tracking-tight">
              Modular <span className="gradient-text">AI Ecosystem</span>
            </h1>
            <p className="text-xl text-muted-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              We operate through four specialized domains, working in concert to deliver integrated, high-performance AI solutions for the modern enterprise.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/request-task" className="gradient-bg inline-flex items-center gap-2 rounded-xl px-8 py-4 text-sm font-bold text-primary-foreground hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95">
                Initiate Custom Project <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/work" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-8 py-4 text-sm font-bold text-foreground hover:bg-white/10 transition-all">
                Explore Our Portfolio
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust/Capabilities Bar */}
      <section className="relative z-10 -mt-8 mb-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="rounded-2xl border border-white/5 bg-card/50 backdrop-blur-xl p-8 lg:p-12 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Zap, label: "50+ Projects", sub: "Production Ready" },
                { icon: Shield, label: "Secure AI", sub: "Enterprise Grade" },
                { icon: Clock, label: "Fast Pivot", sub: "24h Response" },
                { icon: Users, label: "Specialists", sub: "Domain Experts" },
              ].map((item, i) => (
                <motion.div 
                  key={item.label} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center gap-3 text-center group"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{item.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Department Grid */}
      <section className="py-12 pb-32 relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10">
            {loading ? (
               // Simple loading skeleton
               [1,2,3,4].map(i => <div key={i} className="h-[400px] rounded-2xl bg-card animate-pulse border border-border" />)
            ) : (
              departments.map((dept, i) => {
                const Icon = getIcon(dept.name);
                return (
                  <motion.div 
                    key={dept._id} 
                    initial={{ opacity: 0, y: 30 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true }} 
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                  >
                    <Link to={dept.href} className="group flex flex-col h-full rounded-2xl border border-white/5 bg-card/40 overflow-hidden hover:border-primary/40 hover:bg-card/60 transition-all duration-500 hover:shadow-[0_0_80px_-20px_hsl(var(--primary)/0.15)] relative">
                      {/* Media Header */}
                      <div className="relative h-64 overflow-hidden">
                        <img 
                          src={dept.image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"} 
                          alt={dept.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                        <div className="absolute top-6 left-6 inline-flex rounded-xl gradient-bg p-3 shadow-xl shadow-black/20">
                          <Icon className="h-6 w-6 text-primary-foreground" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-8 flex-1 flex flex-col">
                        <h3 className="text-2xl font-display font-black mb-3 text-foreground group-hover:text-primary transition-colors">{dept.name}</h3>
                        <p className="text-sm text-muted-foreground mb-8 leading-relaxed line-clamp-2">{dept.description}</p>
                        
                        {dept.capabilities && dept.capabilities.length > 0 && (
                          <div className="space-y-3 mb-10 flex-1">
                            {dept.capabilities.map((cap) => (
                              <div key={cap} className="flex items-center gap-3 text-xs text-muted-foreground/90 group-hover:text-foreground transition-colors">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                {cap}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                          <span className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-[0.2em]">
                            View Domain <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            )}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-24 text-center p-12 rounded-3xl border border-dashed border-primary/20 bg-primary/[0.02]"
          >
            <h3 className="text-xl font-bold mb-3">Complex Requirements?</h3>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Our teams collaborate on multi-disciplinary projects that span multiple domains.</p>
            <Link to="/request-task" className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-8 py-3.5 text-sm font-bold hover:opacity-90 transition-all">
              Request a Custom Synergy Task <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ServicesOverview;
