import { motion } from "framer-motion";
import Layout from "@/components/Layout";

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

const PortfolioDetailSkeleton = () => (
  <Layout>
    <div className="pt-32 pb-20">
      {/* Hero */}
      <div className="container mx-auto px-4 lg:px-8 pt-16">
        <div className="max-w-4xl mx-auto mb-16 space-y-5">
          <Bone className="h-4 w-24" />
          <Bone className="h-12 w-3/4" />
          <Bone className="h-12 w-1/2" />
          <Bone className="h-5 w-full" />
          <Bone className="h-5 w-5/6" />
          <div className="flex gap-4 pt-2">
            <Bone className="h-10 w-36 rounded-xl" />
            <Bone className="h-10 w-32 rounded-xl" />
          </div>
        </div>

        {/* Media block */}
        <Bone className="w-full aspect-video rounded-2xl mb-16" />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-2">
              <Bone className="h-8 w-20" />
              <Bone className="h-4 w-full" />
            </div>
          ))}
        </div>

        {/* Highlights */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Bone className="h-5 w-5 rounded-full shrink-0 mt-0.5" />
              <Bone className="h-5 flex-1" />
            </div>
          ))}
        </div>

        {/* Tools */}
        <div className="flex flex-wrap gap-2 mb-16">
          {[...Array(6)].map((_, i) => (
            <Bone key={i} className="h-7 w-20" />
          ))}
        </div>
      </div>
    </div>
  </Layout>
);

export default PortfolioDetailSkeleton;
