import { motion } from "framer-motion";

const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="relative">
          <motion.div
            className="h-12 w-12 rounded-xl gradient-bg"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-0 h-12 w-12 rounded-xl border-2 border-primary/30"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
        <p className="text-xs text-muted-foreground font-mono tracking-widest uppercase">Loading</p>
      </motion.div>
    </div>
  );
};

export default LoadingSkeleton;
