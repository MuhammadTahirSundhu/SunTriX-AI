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

const PortfolioCardSkeleton = () => (
  <div className="rounded-2xl border border-border bg-card overflow-hidden">
    {/* Image area */}
    <Bone className="h-52 rounded-none" />
    <div className="p-5 space-y-3">
      {/* Category badge */}
      <Bone className="h-5 w-20" />
      {/* Title */}
      <Bone className="h-5 w-3/4" />
      {/* Description lines */}
      <Bone className="h-4 w-full" />
      <Bone className="h-4 w-2/3" />
      {/* Tool badges */}
      <div className="flex gap-2 pt-1">
        <Bone className="h-5 w-14" />
        <Bone className="h-5 w-14" />
        <Bone className="h-5 w-10" />
      </div>
      {/* CTA */}
      <Bone className="h-4 w-28 mt-2" />
    </div>
  </div>
);

export default PortfolioCardSkeleton;
