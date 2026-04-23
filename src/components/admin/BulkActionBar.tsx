import { motion, AnimatePresence } from "framer-motion";
import { Trash2, CheckCircle, XCircle, Star, X } from "lucide-react";

interface BulkAction {
  label: string;
  icon: any;
  onClick: () => void;
  variant?: "danger" | "default" | "success" | "warning";
}

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  actions: BulkAction[];
}

export const BulkActionBar = ({ selectedCount, onClear, actions }: BulkActionBarProps) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-card border border-border shadow-2xl rounded-full px-6 py-3"
        >
          <div className="flex items-center gap-3 border-r border-border pr-4">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              {selectedCount}
            </span>
            <span className="text-sm font-medium text-foreground">Selected</span>
            <button
              onClick={onClear}
              className="p-1 hover:bg-muted rounded-full transition-colors text-muted-foreground"
              title="Clear selection"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {actions.map((action, idx) => {
              const baseClass = "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors";
              let variantClass = "hover:bg-muted text-foreground";
              if (action.variant === "danger") variantClass = "hover:bg-destructive/10 text-destructive";
              if (action.variant === "success") variantClass = "hover:bg-success/10 text-success";
              if (action.variant === "warning") variantClass = "hover:bg-warning/10 text-warning";

              return (
                <button
                  key={idx}
                  onClick={action.onClick}
                  className={`${baseClass} ${variantClass}`}
                >
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
