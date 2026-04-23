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

const DeptCard = () => (
  <div className="rounded-2xl border border-border bg-card overflow-hidden">
    {/* Image */}
    <Bone className="h-48 rounded-none" />
    <div className="p-5 space-y-3">
      <Bone className="h-3 w-24" />
      <Bone className="h-4 w-full" />
      <Bone className="h-4 w-3/4" />
      <Bone className="h-4 w-20" />
    </div>
  </div>
);

const DepartmentCardSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(count)].map((_, i) => (
      <DeptCard key={i} />
    ))}
  </div>
);

export default DepartmentCardSkeleton;
