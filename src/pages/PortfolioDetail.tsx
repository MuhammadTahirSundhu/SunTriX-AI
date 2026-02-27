import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, CheckCircle, ArrowRight, X } from "lucide-react";
import Layout from "@/components/Layout";
import { portfolioStore, caseStudyStore, type PortfolioProject, type CaseStudy } from "@/lib/cms-store";

const PortfolioDetail = () => {
  const { slug } = useParams();
  const [project, setProject] = useState<PortfolioProject | null>(null);
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [related, setRelated] = useState<PortfolioProject[]>([]);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const p = portfolioStore.getBySlug(slug);
    if (p) {
      setProject(p);
      const cs = caseStudyStore.getByProjectId(p.id);
      if (cs) setCaseStudy(cs);
      setRelated(
        portfolioStore.getPublished()
          .filter((r) => r.category === p.category && r.id !== p.id)
          .slice(0, 3)
      );
    }
  }, [slug]);

  if (!project) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Project Not Found</h1>
            <Link to="/work" className="text-primary hover:underline">← Back to Portfolio</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-28 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <Link to="/work" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft className="h-3 w-3" /> Back to Portfolio
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
            <span className="inline-block rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-[10px] font-medium text-primary mb-4">
              {project.category}
            </span>
            <h1 className="text-3xl lg:text-5xl font-display font-extrabold mb-4">{project.title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{project.description}</p>

            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-2xl font-extrabold gradient-text">{project.metric}</p>
                <p className="text-[10px] text-muted-foreground">{project.metricLabel}</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <p className="text-sm font-medium text-foreground">{project.clientName}</p>
                <p className="text-xs text-muted-foreground">{project.industry}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cover Image / Video */}
      <section className="pb-8">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border overflow-hidden bg-card relative group cursor-pointer"
            onClick={() => project.videoUrl && setShowVideo(true)}
          >
            {project.coverImage ? (
              <img src={project.coverImage} alt={project.title} className="w-full aspect-video object-cover" />
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent flex items-center justify-center">
                <span className="text-4xl font-extrabold gradient-text">{project.metric}</span>
              </div>
            )}
            {project.videoUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/20 group-hover:bg-background/10 transition-colors">
                <motion.div
                  className="h-16 w-16 rounded-full gradient-bg flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1 }}
                >
                  <Play className="h-7 w-7 text-primary-foreground ml-1" />
                </motion.div>
                <span className="absolute bottom-4 left-4 text-xs font-medium text-foreground bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  ▶ Watch Project Demo
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideo && project.videoUrl && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowVideo(false)}
          >
            <motion.div
              className="relative w-full max-w-5xl mx-4 aspect-video rounded-2xl overflow-hidden border border-border shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <iframe src={project.videoUrl} className="w-full h-full" allow="autoplay; fullscreen" allowFullScreen />
              <button onClick={() => setShowVideo(false)} className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Highlights & Tools */}
      <section className="pb-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-xl font-display font-bold mb-4">Key <span className="gradient-text">Highlights</span></h2>
              <div className="space-y-2">
                {project.highlights.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <p className="text-xs text-foreground">{h}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-xl font-display font-bold mb-4">Tools & <span className="gradient-text">Stack</span></h2>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {project.tools.map((tool) => (
                  <div key={tool.name} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:border-primary/30 transition-all">
                    <span className="text-xl">{tool.icon}</span>
                    <span className="text-xs font-medium text-foreground">{tool.name}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-mono rounded-lg border border-border bg-muted px-2 py-1 text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Case Study */}
      {caseStudy && (
        <section className="py-12 bg-card/30">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-display font-extrabold mb-8 text-center">
                Case <span className="gradient-text">Study</span>
              </h2>

              <div className="space-y-4">
                {[
                  { label: "Challenge", color: "destructive", content: caseStudy.challenge },
                  { label: "Solution", color: "primary", content: caseStudy.solution },
                  { label: "Results", color: "success", content: caseStudy.results },
                ].map((section) => (
                  <div key={section.label} className="rounded-xl border border-border bg-card p-6">
                    <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                      <span className={`h-6 w-6 rounded-lg bg-${section.color}/10 flex items-center justify-center text-${section.color} text-[10px] font-bold`}>
                        {section.label[0]}
                      </span>
                      {section.label}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{section.content}</p>
                  </div>
                ))}

                {caseStudy.keyMetrics.length > 0 && (
                  <div className="grid sm:grid-cols-3 gap-3">
                    {caseStudy.keyMetrics.map((m, i) => (
                      <div key={i} className="rounded-xl border border-border bg-card p-4 text-center">
                        <p className="text-xl font-extrabold gradient-text mb-0.5">{m.value}</p>
                        <p className="text-xs font-medium text-foreground">{m.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{m.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Related Projects */}
      {related.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-xl font-display font-bold mb-6">
              Related <span className="gradient-text">Projects</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/work/${r.slug}`}
                  className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all"
                >
                  <div className="h-28 bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center">
                    <span className="text-xl font-extrabold gradient-text">{r.metric}</span>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] text-primary font-medium mb-1">{r.category}</p>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{r.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-xl font-display font-bold mb-3">
            Want Similar <span className="gradient-text">Results</span>?
          </h2>
          <p className="text-xs text-muted-foreground mb-6">Let's build something exceptional for your team.</p>
          <Link
            to="/request-task"
            className="gradient-bg inline-flex items-center gap-2 rounded-lg px-7 py-3.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all"
          >
            Request a Task <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default PortfolioDetail;
