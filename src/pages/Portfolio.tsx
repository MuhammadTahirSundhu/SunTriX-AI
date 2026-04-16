import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Filter, Play } from "lucide-react";
import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import { apiRequest, ENDPOINTS } from "@/lib/api";


interface PortfolioProject { _id: string; title: string; slug: string; category: string; shortDescription: string; metric: string; metricLabel: string; thumbnailImage: string; coverImage: string; videoUrl: string; tools: { name: string; icon: string }[]; }

const categories = ["All", "Agentic AI", "AI & ML", "Computer Vision", "SaaS Platform"];

const Portfolio = () => {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    apiRequest<PortfolioProject[]>(ENDPOINTS.PORTFOLIO_LIST).then(({ data }) => {
      if (data) setProjects(data);
    });
  }, []);

  const getCover = (project: PortfolioProject) => project.thumbnailImage || project.coverImage || "";

  const filtered = activeCategory === "All" ? projects : projects.filter((p) => p.category === activeCategory);


  return (
    <Layout>
      <PageTransition>
        <section className="pt-32 pb-20 relative">
          <div className="absolute inset-0 bg-neural-grid opacity-15" />
          <div className="container mx-auto px-4 lg:px-8 pt-16 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-block text-xs font-mono text-primary uppercase tracking-widest mb-4">Portfolio</span>
              <h1 className="text-4xl lg:text-6xl font-display font-extrabold mb-6">
                Proven <span className="gradient-text">Results</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Real projects, measurable outcomes. See how we've helped teams build and scale intelligent systems.
              </p>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                    activeCategory === cat
                      ? "gradient-bg text-primary-foreground shadow-lg"
                      : "border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filtered.map((project, i) => {
                  const cover = getCover(project);
                  return (
                    <motion.div
                      key={project._id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                    >
                      <Link
                        to={`/work/${project.slug}`}
                        className="group block rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all duration-500 hover:shadow-[0_0_40px_hsl(24_100%_50%/0.1)] hover:-translate-y-1"
                      >
                        <div className="h-52 relative overflow-hidden">
                          {cover ? (
                            <motion.img
                              src={cover}
                              alt={project.title}
                              className="w-full h-full object-cover"
                              whileHover={{ scale: 1.06 }}
                              transition={{ duration: 0.5 }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent flex items-center justify-center">
                              <span className="text-3xl font-extrabold gradient-text">{project.metric}</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                          {project.videoUrl && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="h-12 w-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                                <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
                              </div>
                            </div>
                          )}
                          <div className="absolute bottom-3 left-4">
                            <span className="text-xl font-extrabold gradient-text">{project.metric}</span>
                            <p className="text-[10px] text-muted-foreground">{project.metricLabel}</p>
                          </div>
                        </div>
                        <div className="p-5">
                          <span className="inline-block rounded-full bg-secondary/15 border border-secondary/20 px-3 py-0.5 text-[10px] font-bold text-secondary uppercase tracking-wider mb-3">{project.category}</span>
                          <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.shortDescription}</p>
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {project.tools.slice(0, 4).map((tool) => (
                              <span key={tool.name} className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground bg-muted rounded-md px-2 py-1">
                                <span>{tool.icon}</span> {tool.name}
                              </span>
                            ))}
                          </div>
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-3 transition-all duration-300">
                            View Case Study <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <Filter className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground">No projects in this category yet.</p>
              </div>
            )}
          </div>
        </section>
      </PageTransition>
    </Layout>
  );
};

export default Portfolio;
