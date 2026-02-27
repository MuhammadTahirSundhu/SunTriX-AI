import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Play, CheckCircle, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import { portfolioStore, caseStudyStore, type PortfolioProject, type CaseStudy } from "@/lib/cms-store";

const PortfolioDetail = () => {
  const { slug } = useParams();
  const [project, setProject] = useState<PortfolioProject | null>(null);
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [related, setRelated] = useState<PortfolioProject[]>([]);

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
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <Link to="/work" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to Portfolio
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
            <span className="inline-block rounded-full bg-primary/10 border border-primary/30 px-4 py-1 text-xs font-medium text-primary mb-6">
              {project.category}
            </span>
            <h1 className="text-3xl lg:text-5xl font-display font-extrabold mb-6">{project.title}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">{project.description}</p>

            <div className="flex flex-wrap gap-6">
              <div className="text-center">
                <p className="text-3xl font-extrabold gradient-text">{project.metric}</p>
                <p className="text-xs text-muted-foreground mt-1">{project.metricLabel}</p>
              </div>
              <div className="h-16 w-px bg-border" />
              <div>
                <p className="text-sm font-medium text-foreground">{project.clientName}</p>
                <p className="text-xs text-muted-foreground">{project.industry}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cover Image / Video */}
      {(project.coverImage || project.videoUrl) && (
        <section className="pb-16">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-border overflow-hidden bg-card"
            >
              {project.videoUrl ? (
                <div className="aspect-video relative">
                  <iframe
                    src={project.videoUrl}
                    className="w-full h-full"
                    allow="autoplay; fullscreen"
                    title={project.title}
                  />
                </div>
              ) : project.coverImage ? (
                <img src={project.coverImage} alt={project.title} className="w-full aspect-video object-cover" />
              ) : null}
            </motion.div>
          </div>
        </section>
      )}

      {/* Highlights & Tools */}
      <section className="pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Highlights */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl font-display font-bold mb-6">Key <span className="gradient-text">Highlights</span></h2>
              <div className="space-y-4">
                {project.highlights.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
                  >
                    <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">{h}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Tools & Tags */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl font-display font-bold mb-6">Tools & <span className="gradient-text">Stack</span></h2>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {project.tools.map((tool) => (
                  <div key={tool.name} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30 glow-hover transition-all">
                    <span className="text-2xl">{tool.icon}</span>
                    <span className="text-sm font-medium text-foreground">{tool.name}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="text-xs font-mono rounded-lg border border-border bg-muted px-3 py-1.5 text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Case Study Section */}
      {caseStudy && (
        <section className="py-20 bg-card/30">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-display font-extrabold mb-12 text-center">
                Case <span className="gradient-text">Study</span>
              </h2>

              <div className="space-y-12">
                <div className="rounded-xl border border-border bg-card p-8">
                  <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <span className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive text-sm font-bold">C</span>
                    Challenge
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{caseStudy.challenge}</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-8">
                  <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <span className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">S</span>
                    Solution
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{caseStudy.solution}</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-8">
                  <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <span className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center text-success text-sm font-bold">R</span>
                    Results
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{caseStudy.results}</p>
                </div>

                {caseStudy.keyMetrics.length > 0 && (
                  <div className="grid sm:grid-cols-3 gap-4">
                    {caseStudy.keyMetrics.map((m, i) => (
                      <div key={i} className="rounded-xl border border-border bg-card p-6 text-center">
                        <p className="text-2xl font-extrabold gradient-text mb-1">{m.value}</p>
                        <p className="text-sm font-medium text-foreground">{m.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
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
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-2xl font-display font-bold mb-8">
              Related <span className="gradient-text">Projects</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/work/${r.slug}`}
                  className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 glow-hover transition-all"
                >
                  <div className="h-36 bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center">
                    <span className="text-2xl font-extrabold gradient-text">{r.metric}</span>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-primary font-medium mb-1">{r.category}</p>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{r.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-2xl font-display font-bold mb-4">
            Want Similar <span className="gradient-text">Results</span>?
          </h2>
          <p className="text-muted-foreground mb-8">Let's discuss how we can build something exceptional for your team.</p>
          <Link
            to="/request-task"
            className="gradient-bg inline-flex items-center gap-2 rounded-lg px-8 py-4 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all hover:shadow-[0_0_30px_hsl(24_100%_50%/0.3)]"
          >
            Request a Task <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default PortfolioDetail;
