import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import Layout from "@/components/Layout";

const testimonials = [
  { quote: "SunTriX transformed our data pipeline with an agentic AI system that cut processing time by 10x. Their architectural depth is unmatched.", name: "Sarah Chen", role: "CTO", company: "DataFlow Inc.", metric: "10x Faster" },
  { quote: "We went from concept to production-ready SaaS in 12 weeks. The team's ability to combine ML models with scalable infrastructure is remarkable.", name: "Marcus Johnson", role: "VP Engineering", company: "NeuralPath", metric: "12-Week Delivery" },
  { quote: "Their computer vision solution achieved 94% accuracy on our quality inspection system. SunTriX delivered ahead of schedule.", name: "Emily Rodriguez", role: "Head of Product", company: "VisionTech", metric: "94% Accuracy" },
  { quote: "The multi-agent customer support system handles 85% of tier-1 tickets autonomously. Game changer for our operations.", name: "James Park", role: "COO", company: "ServiceHub", metric: "85% Auto-Resolution" },
  { quote: "SunTriX's MLOps expertise helped us reduce model deployment time from weeks to hours. Their team became an extension of ours.", name: "Priya Sharma", role: "Head of AI", company: "PredictAI", metric: "95% Faster Deploys" },
  { quote: "Outstanding engineering quality. The SaaS platform they built handles 50,000 concurrent users without breaking a sweat.", name: "Alex Turner", role: "Founder", company: "ScaleUp", metric: "50K Concurrent Users" },
];

const Testimonials = () => {
  return (
    <Layout>
      <section className="pt-32 pb-20 bg-grid-pattern">
        <div className="container mx-auto px-4 lg:px-8 pt-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-xs font-mono text-primary uppercase tracking-widest mb-4">Testimonials</span>
            <h1 className="text-4xl lg:text-6xl font-extrabold mb-6">
              Client <span className="gradient-text">Stories</span>
            </h1>
            <p className="text-lg text-muted-foreground">Real feedback from engineering leaders who've built with SunTriX.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card p-6 flex flex-col">
                <Quote className="h-6 w-6 text-primary/30 mb-4" />
                <p className="text-sm text-foreground leading-relaxed italic flex-1 mb-6">"{t.quote}"</p>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}, {t.company}</p>
                  </div>
                  <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">{t.metric}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Testimonials;
