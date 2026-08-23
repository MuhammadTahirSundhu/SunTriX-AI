import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, LayoutDashboard, ClipboardList, MessageSquare, CreditCard,
  Layers, Image, Users, Settings, Shield, X, ArrowRight
} from "lucide-react";

interface CommandItem {
  id: string;
  title: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const COMMANDS: CommandItem[] = [
  { id: "dash", title: "Overview Dashboard", category: "Navigation", icon: LayoutDashboard, href: "/admin" },
  { id: "tasks", title: "Requests & Client Engagements", category: "Navigation", icon: ClipboardList, href: "/admin/tasks" },
  { id: "msgs", title: "Client Inquiry Messages", category: "Navigation", icon: MessageSquare, href: "/admin/messages" },
  { id: "payments", title: "Finance & Invoices", category: "Navigation", icon: CreditCard, href: "/admin/payments" },
  { id: "content", title: "Content Hub (CMS)", category: "Navigation", icon: Layers, href: "/admin/content" },
  { id: "media", title: "Media Library", category: "Navigation", icon: Image, href: "/admin/media" },
  { id: "newsletter", title: "Newsletter Campaigns", category: "Navigation", icon: Users, href: "/admin/newsletter" },
  { id: "settings", title: "System & AI Settings", category: "Navigation", icon: Settings, href: "/admin/settings" },
  { id: "audit", title: "Security Audit Log", category: "Navigation", icon: Shield, href: "/admin/audit" },
];

export const AdminCommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const filteredCommands = COMMANDS.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (href: string) => {
    navigate(href);
    setIsOpen(false);
    setSearch("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-card border border-border/60 rounded-xl shadow-xl overflow-hidden flex flex-col">
        {/* Search Bar */}
        <div className="flex items-center px-4 py-3 border-b border-border/40 gap-2">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or jump to workspace..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded text-muted-foreground hover:text-foreground text-xs font-mono"
          >
            ESC
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-72 overflow-y-auto p-2 divide-y divide-border/20">
          {filteredCommands.length === 0 ? (
            <p className="p-4 text-center text-xs text-muted-foreground font-mono">
              No matching workspace commands found.
            </p>
          ) : (
            filteredCommands.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <div
                  key={cmd.id}
                  onClick={() => handleSelect(cmd.href)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer group text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    <div>
                      <span className="font-semibold text-foreground block">{cmd.title}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{cmd.category}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
