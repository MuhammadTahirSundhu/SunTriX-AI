import { ArrowDownAZ, CalendarDays, GripVertical } from "lucide-react";

export type SortOption = "custom" | "date-desc" | "date-asc" | "az" | "za";

interface SortControlProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
  hideCustom?: boolean;
}

export function SortControl({ value, onChange, className = "", hideCustom = false }: SortControlProps) {
  return (
    <div className={`flex items-center gap-2 bg-muted/30 p-1 rounded-lg border border-border w-fit ${className}`}>
      {!hideCustom && (
        <button
          onClick={() => onChange("custom")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            value === "custom" 
              ? "bg-background shadow-sm text-foreground" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <GripVertical className="h-3.5 w-3.5" />
          Custom
        </button>
      )}
      <button
        onClick={() => onChange(value === "date-desc" ? "date-asc" : "date-desc")}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          value.startsWith("date") 
            ? "bg-background shadow-sm text-foreground" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }`}
      >
        <CalendarDays className="h-3.5 w-3.5" />
        Date {value === "date-asc" ? "↑" : "↓"}
      </button>
      <button
        onClick={() => onChange(value === "az" ? "za" : "az")}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          value === "az" || value === "za"
            ? "bg-background shadow-sm text-foreground" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }`}
      >
        <ArrowDownAZ className="h-3.5 w-3.5" />
        {value === "za" ? "Z-A" : "A-Z"}
      </button>
    </div>
  );
}
