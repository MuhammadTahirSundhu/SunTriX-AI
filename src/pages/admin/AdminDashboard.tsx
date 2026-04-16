import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import { BarChart3, ClipboardList, MessageSquare, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface DashboardStats {
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  totalContacts: number;
  unreadContacts: number;
  revenue: number;
}
interface TaskRequest { _id: string; name: string; service: string; company: string; status: string; createdAt: string }
interface ContactMessage { _id: string; name: string; subject: string; message: string; read: boolean; createdAt: string }

const statCards = [
  { key: "totalTasks" as const, label: "Total Tasks", icon: ClipboardList, color: "text-primary" },
  { key: "pendingTasks" as const, label: "Pending", icon: Clock, color: "text-warning" },
  { key: "completedTasks" as const, label: "Completed", icon: CheckCircle, color: "text-success" },
  { key: "unreadContacts" as const, label: "Unread Messages", icon: MessageSquare, color: "text-secondary" },
  { key: "revenue" as const, label: "Revenue", icon: DollarSign, color: "text-gold", prefix: "$" },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({ totalTasks: 0, pendingTasks: 0, completedTasks: 0, totalContacts: 0, unreadContacts: 0, revenue: 0 });
  const [recentTasks, setRecentTasks] = useState<TaskRequest[]>([]);
  const [recentMessages, setRecentMessages] = useState<ContactMessage[]>([]);

  useEffect(() => {
    apiRequest<DashboardStats>(ENDPOINTS.ADMIN_DASHBOARD_STATS).then(({ data }) => { if (data) setStats(data); });
    apiRequest<{ tasks: TaskRequest[] }>(ENDPOINTS.TASK_REQUEST_LIST + "?limit=5").then(({ data }) => { if (data?.tasks) setRecentTasks(data.tasks); });
    apiRequest<ContactMessage[]>(ENDPOINTS.ADMIN_CONTACTS + "?limit=5").then(({ data }) => { if (data) setRecentMessages(data.slice(0, 5)); });
  }, []);

  const statusColors: Record<string, string> = {
    new: "bg-primary/10 text-primary",
    in_review: "bg-warning/10 text-warning",
    proposal_sent: "bg-secondary/10 text-secondary",
    in_progress: "bg-gold/10 text-gold",
    completed: "bg-success/10 text-success",
    cancelled: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your SunTriX workspace</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <card.icon className={`h-5 w-5 ${card.color}`} />
              <TrendingUp className="h-3 w-3 text-success" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {card.prefix || ""}{typeof stats[card.key] === "number" ? stats[card.key].toLocaleString() : stats[card.key]}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="rounded-xl border border-border bg-card">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" /> Recent Task Requests
            </h2>
            <span className="text-xs text-muted-foreground">{recentTasks.length} total</span>
          </div>
          <div className="divide-y divide-border">
            {recentTasks.length === 0 ? (
              <div className="p-8 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No task requests yet</p>
                <p className="text-xs text-muted-foreground/60">They'll appear here when submitted via the website</p>
              </div>
            ) : (
              recentTasks.map((task) => (
                <div key={task._id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground">{task.name}</p>
                    <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${statusColors[task.status] || ""}`}>
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{task.service} · {task.company}</p>
                  <p className="text-xs text-muted-foreground/50 mt-1">{new Date(task.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="rounded-xl border border-border bg-card">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-secondary" /> Recent Messages
            </h2>
            <span className="text-xs text-muted-foreground">{recentMessages.length} total</span>
          </div>
          <div className="divide-y divide-border">
            {recentMessages.length === 0 ? (
              <div className="p-8 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No messages yet</p>
                <p className="text-xs text-muted-foreground/60">Contact form submissions appear here</p>
              </div>
            ) : (
              recentMessages.map((msg) => (
                <div key={msg._id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      {!msg.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                      {msg.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(msg.createdAt).toLocaleDateString()}</p>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">{msg.subject}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1 line-clamp-1">{msg.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Activity Chart Placeholder */}
      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Activity Overview</h2>
        </div>
        <div className="h-48 flex items-center justify-center border border-dashed border-border rounded-lg">
          <div className="text-center">
            <BarChart3 className="h-10 w-10 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Analytics will populate as tasks come in</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
