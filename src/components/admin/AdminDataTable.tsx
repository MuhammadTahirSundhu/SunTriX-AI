import React from "react";
import { Search, RefreshCw, Inbox, Plus } from "lucide-react";

interface StatusTab {
  id: string;
  label: string;
  count?: number;
}

interface AdminDataTableProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  searchPlaceholder?: string;
  tabs?: StatusTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  actions?: React.ReactNode;
  loading?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onEmptyAction?: () => void;
  emptyActionLabel?: string;
  onRefresh?: () => void;
  children: React.ReactNode;
}

export const AdminDataTable: React.FC<AdminDataTableProps> = ({
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Filter records…",
  tabs,
  activeTab,
  onTabChange,
  actions,
  loading,
  isEmpty,
  emptyTitle = "No records found",
  emptyDescription = "There are no records matching your current filter criteria.",
  onEmptyAction,
  emptyActionLabel = "Create Record",
  onRefresh,
  children,
}) => {
  return (
    <div className="space-y-4">
      {/* Search, Status Tabs, and Actions Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input & Status Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          {onSearchChange && (
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-background border border-border/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
              />
            </div>
          )}

          {tabs && tabs.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange && onTabChange(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      isActive
                        ? "bg-muted text-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                          isActive
                            ? "bg-background text-foreground"
                            : "bg-muted/80 text-muted-foreground"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Custom Actions & Refresh */}
        <div className="flex items-center gap-2 shrink-0">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-1.5 rounded-lg border border-border/60 bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              title="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-primary" : ""}`} />
            </button>
          )}
          {actions}
        </div>
      </div>

      {/* Main Table Content View */}
      {loading ? (
        <div className="py-12 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-12 w-full rounded-lg bg-muted/40 animate-pulse border border-border/30"
            />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="py-16 text-center space-y-3 border border-border/40 rounded-xl bg-card/30">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <Inbox className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">{emptyTitle}</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {emptyDescription}
            </p>
          </div>
          {onEmptyAction && (
            <button
              onClick={onEmptyAction}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-xs hover:bg-primary/90 transition-all mt-2"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{emptyActionLabel}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="border border-border/50 rounded-xl bg-card overflow-hidden shadow-xs">
          {children}
        </div>
      )}
    </div>
  );
};
