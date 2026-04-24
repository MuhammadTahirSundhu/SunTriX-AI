import { useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, ClipboardList, MessageSquare, Users, Settings,
  LogOut, Menu, X, ChevronRight, Briefcase, FileText, Megaphone, Layers, Image, Bell,
  Shield, Building2, DollarSign, BookOpen, UserSquare2
} from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const notifications = useNotifications();

  const token = localStorage.getItem("auth_token");
  const userRaw = localStorage.getItem("suntrix_admin_session");
  const user = userRaw ? JSON.parse(userRaw) as { name: string; email: string } : null;

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("suntrix_admin_session");
    window.location.href = "/admin/login";
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: ClipboardList, label: "Task Requests", href: "/admin/tasks", badge: notifications.newTasks },
    { icon: MessageSquare, label: "Messages", href: "/admin/messages", badge: notifications.unreadMessages },
    { icon: Briefcase, label: "Portfolio", href: "/admin/portfolio" },
    { icon: BookOpen, label: "Blog", href: "/admin/blog" },
    { icon: UserSquare2, label: "Team", href: "/admin/team" },
    { icon: Building2, label: "Clients", href: "/admin/clients" },
    { icon: DollarSign, label: "Pricing", href: "/admin/pricing" },
    { icon: Layers, label: "Departments", href: "/admin/departments" },
    { icon: FileText, label: "Content", href: "/admin/content" },
    { icon: Image, label: "Media Library", href: "/admin/media" },
    { icon: Users, label: "Newsletter", href: "/admin/newsletter", badge: notifications.newSubscribers },
    { icon: Shield, label: "Audit Log", href: "/admin/audit" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} border-r border-border bg-card transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          {sidebarOpen && (
            <Link to="/admin" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gradient-bg flex items-center justify-center">
                <span className="text-primary-foreground font-extrabold text-xs">S</span>
              </div>
              <span className="text-sm font-bold text-foreground">SunTriX CMS</span>
            </Link>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-muted transition-colors relative">
            {sidebarOpen ? <X className="h-4 w-4 text-muted-foreground" /> : <Menu className="h-4 w-4 text-muted-foreground" />}
            {!sidebarOpen && notifications.total > 0 && (
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive border border-card" />
            )}
          </button>
        </div>

        {sidebarOpen && (
           <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notifications</span>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                {notifications.total > 0 && (
                  <span className="bg-destructive/10 text-destructive text-xs font-medium px-2 py-0.5 rounded-full">
                    {notifications.total} New
                  </span>
                )}
              </div>
           </div>
        )}

        <nav className="flex-1 p-2 space-y-1 mt-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {sidebarOpen && <span className="flex-1">{item.label}</span>}
                {sidebarOpen && item.badge > 0 && (
                   <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                     {item.badge}
                   </span>
                )}
                {sidebarOpen && isActive && !item.badge && <ChevronRight className="ml-auto h-3 w-3" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          {sidebarOpen && (
            <Link to="/" target="_blank" className="flex items-center gap-2 mb-3 px-2 text-xs text-muted-foreground hover:text-primary transition-colors">
              <Megaphone className="h-3.5 w-3.5" /> View Live Site →
            </Link>
          )}
          {sidebarOpen && user && (
            <div className="flex items-center gap-2 mb-3 px-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{user.name[0]}</span>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
            <LogOut className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
