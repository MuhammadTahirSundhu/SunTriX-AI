import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import Layout from "@/components/Layout";
import { apiRequest, ENDPOINTS } from "@/lib/api";

interface TestimonialItem {
  _id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  rating: number;
  status: "published" | "draft";
}

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<TestimonialItem[]>(ENDPOINTS.TESTIMONIALS_LIST).then(({ data }) => {
      // Only show published testimonials on the public site
      if (data) setTestimonials(data.filter(t => t.status === "published"));
      setLoading(false);
    });
  }, []);

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
            {loading ? (
              <div className="col-span-full text-center py-20 text-muted-foreground">Loading testimonials...</div>
            ) : testimonials.length === 0 ? (
              <div className="col-span-full text-center py-20 text-muted-foreground">No testimonials found.</div>
            ) : (
              testimonials.map((t, i) => (
                <motion.div key={t._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-border bg-card p-6 flex flex-col">
                  <Quote className="h-6 w-6 text-primary/30 mb-4" />
                  <p className="text-sm text-foreground leading-relaxed italic flex-1 mb-6">"{t.quote}"</p>
                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}, {t.company}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(t.rating || 5)].map((_, j) => (
                        <Star key={j} className="h-3 w-3 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Testimonials;
