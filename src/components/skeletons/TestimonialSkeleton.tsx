import { motion } from "framer-motion";

const shimmer = {
  initial: { backgroundPosition: "-200% 0" },
  animate: { backgroundPosition: "200% 0" },
  transition: { repeat: Infinity, duration: 1.5, ease: "linear" as const },
};

const Bone = ({ className }: { className: string }) => (
  <motion.div
    className={`rounded-lg bg-muted ${className}`}
    style={{ backgroundSize: "400% 100%", backgroundImage: "linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground)/0.08) 50%, hsl(var(--muted)) 75%)" }}
    {...shimmer}
  />
);

const TestimonialSkeleton = () => (
  <section className="py-24 lg:py-32 bg-card/30 relative overflow-hidden">
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
      {/* Section title */}
      <div className="flex flex-col items-center mb-12 gap-3">
        <Bone className="h-7 w-56" />
      </div>
      {/* Testimonial card */}
      <div className="flex flex-col items-center gap-4 min-h-[300px]">
        {/* Quote icon */}
        <Bone className="h-10 w-10 rounded-full" />
        {/* Stars */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => <Bone key={i} className="h-4 w-4" />)}
        </div>
        {/* Quote lines */}
        <Bone className="h-5 w-full max-w-2xl" />
        <Bone className="h-5 w-5/6 max-w-2xl" />
        <Bone className="h-5 w-4/6 max-w-2xl" />
        <div className="mt-4 flex flex-col items-center gap-2">
          <Bone className="h-4 w-36" />
          <Bone className="h-4 w-48" />
        </div>
      </div>
      {/* Navigation dots */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <Bone className="h-8 w-8 rounded-full" />
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <Bone key={i} className={`h-2 rounded-full ${i === 0 ? "w-8" : "w-2"}`} />
          ))}
        </div>
        <Bone className="h-8 w-8 rounded-full" />
      </div>
    </div>
  </section>
);

export default TestimonialSkeleton;
