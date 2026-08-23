import React from "react";
import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
}) => {
  const location = useLocation();

  // Auto-generate breadcrumbs if not provided
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const defaultBreadcrumbs = [
    { label: "Admin", href: "/admin" },
    ...pathSegments.slice(1).map((seg, idx) => ({
      label: seg.charAt(0).toUpperCase() + seg.slice(1).replace("-", " "),
      href: `/admin/${pathSegments.slice(1, idx + 2).join("/")}`,
    })),
  ];

  const activeBreadcrumbs = breadcrumbs || defaultBreadcrumbs;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/40">
      <div className="space-y-1">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
          {activeBreadcrumbs.map((b, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />}
              {b.href && idx < activeBreadcrumbs.length - 1 ? (
                <Link to={b.href} className="hover:text-foreground transition-colors">
                  {b.label}
                </Link>
              ) : (
                <span className="text-foreground font-semibold">{b.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Page Title & Description */}
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Action Buttons Slot */}
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
};
