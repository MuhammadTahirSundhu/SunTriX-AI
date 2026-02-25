import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Play, Filter } from "lucide-react";
import Layout from "@/components/Layout";
import { portfolioStore, type PortfolioProject } from "@/lib/cms-store";

const categories = ["All", "Agentic AI", "AI & ML", "Computer Vision", "SaaS Platform"];

const Portfolio = () => {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    setProjects(portfolioStore.getPublished());
  }, []);

  const filtered = activeCategory === "All" ? projects : projects.filter((p) => p.category === activeCategory);

  return (
    <Layout>
      <section className="pt-32 pb-20 bg-grid-pattern">
        <div className="container mx-auto px-4 lg:px-8 pt-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-xs font-mono text-primary uppercase tracking-widest mb-4">Portfolio</span>
            <h1 className="text-4xl lg:text-6xl font-extrabold mb-6">
              Proven <span className="gradient-text">Results</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Real projects, measurable outcomes. See how we've helped teams build and scale intelligent systems.
            </p>
          </motion.div>

          {/* Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? "gradient-bg text-primary-foreground shadow-lg"
                    : "border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Projects */}
          <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/work/${project.slug}`}
                  className="group block rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 glow-hover transition-all"
                >
                  <div className="h-48 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent flex items-center justify-center relative overflow-hidden">
                    {project.coverImage ? (
                      <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="text-center">
                        <span className="text-3xl font-extrabold gradient-text">{project.metric}</span>
                        <p className="text-xs text-muted-foreground mt-1">{project.metricLabel}</p>
                      </div>
                    )}
                    {project.videoUrl && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="h-12 w-12 rounded-full bg-primary/90 flex items-center justify-center">
                          <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <span className="inline-block rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold text-secondary mb-3">{project.category}</span>
                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.shortDescription}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tools.slice(0, 4).map((tool) => (
                        <span key={tool.name} className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground bg-muted rounded px-2 py-1">
                          <span>{tool.icon}</span> {tool.name}
                        </span>
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                      View Details <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Filter className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground">No projects in this category yet.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Portfolio;
