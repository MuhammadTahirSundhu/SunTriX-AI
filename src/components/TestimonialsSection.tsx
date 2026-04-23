import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import { TestimonialSkeleton } from "@/components/skeletons";

interface TestimonialItem { _id: string; quote: string; name: string; role: string; company: string; rating: number; }

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<TestimonialItem[]>(ENDPOINTS.TESTIMONIALS_LIST).then(({ data }) => {
      if (data) setTestimonials(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  if (loading) return <TestimonialSkeleton />;
  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 lg:py-32 bg-card/30 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-display font-extrabold mb-4">
            Client <span className="gradient-text">Testimonials</span>
          </h2>
        </motion.div>

        <div className="relative min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <Quote className="mx-auto mb-6 h-10 w-10 text-primary/40" />
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(testimonials[current]?.rating || 5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="text-lg lg:text-xl leading-relaxed text-foreground italic mb-8 max-w-2xl mx-auto">
                "{testimonials[current]?.quote}"
              </blockquote>
              <div>
                <p className="font-semibold text-foreground">{testimonials[current]?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {testimonials[current]?.role}, {testimonials[current]?.company}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)}
            className="rounded-full border border-border p-2 hover:bg-primary/10 hover:border-primary/30 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${i === current ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"}`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrent((c) => (c + 1) % testimonials.length)}
            className="rounded-full border border-border p-2 hover:bg-primary/10 hover:border-primary/30 transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
