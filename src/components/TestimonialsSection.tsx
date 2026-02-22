import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "SunTriX transformed our data pipeline with an agentic AI system that cut processing time by 10x. Their architectural depth is unmatched.",
    name: "Sarah Chen",
    role: "CTO",
    company: "DataFlow Inc.",
  },
  {
    quote: "We went from concept to production-ready SaaS in 12 weeks. The team's ability to combine ML models with scalable infrastructure is remarkable.",
    name: "Marcus Johnson",
    role: "VP Engineering",
    company: "NeuralPath",
  },
  {
    quote: "Their computer vision solution achieved 94% accuracy on our quality inspection system. SunTriX delivered ahead of schedule with exceptional documentation.",
    name: "Emily Rodriguez",
    role: "Head of Product",
    company: "VisionTech",
  },
];

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 lg:py-32 bg-card/30 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">
            What Our <span className="gradient-text">Clients</span> Say
          </h2>
        </div>

        <div className="relative min-h-[280px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <Quote className="mx-auto mb-6 h-10 w-10 text-primary/30" />
              <blockquote className="text-lg lg:text-xl leading-relaxed text-foreground italic mb-8">
                "{testimonials[current].quote}"
              </blockquote>
              <div>
                <p className="font-semibold text-foreground">{testimonials[current].name}</p>
                <p className="text-sm text-muted-foreground">
                  {testimonials[current].role}, {testimonials[current].company}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)}
            className="rounded-full border border-border p-2 hover:bg-muted transition-colors"
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
            className="rounded-full border border-border p-2 hover:bg-muted transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
