import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  ClipboardList, MessageSquare, DollarSign, TrendingUp, TrendingDown,
  Clock, CheckCircle, AlertCircle, Users, BarChart3, Zap, Globe,
  FileText, Image, Mail, Briefcase, Star, Activity, ArrowRight,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────
interface DashboardStats {
  totalTasks: number; pendingTasks: number; completedTasks: number;
  totalContacts: number; unreadContacts: number; revenue: number;
  totalPortfolio: number; publishedPortfolio: number;
  totalTestimonials: number; totalSubscribers: number;
}
interface TrendPoint { date: string; tasks: number; messages: number; subscribers: number; }
interface FeedItem { type: string; title: string; subtitle: string; status: string; at: string; }
interface FunnelStage { stage: string; count: number; }
interface PipelineItem { status: string; count: number; }
interface ServiceItem { service: string; count: number; }
interface GrowthMetric { current: number; previous: number; pct: number; }
interface ContentHealth {
  publishedPosts: number; draftPosts: number; publishedPortfolio: number;
  totalPortfolio: number; totalTestimonials: number; totalSubscribers: number; unreadMessages: number;
}
interface ActivityData {
  trendChart: TrendPoint[]; taskPipeline: PipelineItem[]; topServices: ServiceItem[];
  growth: { tasks: GrowthMetric; messages: GrowthMetric; subscribers: GrowthMetric };
  contentHealth: ContentHealth; feed: FeedItem[]; funnel: FunnelStage[];
}

// ── Constants ────────────────────────────────────────────────────
const PIPE_COLORS: Record<string, string> = {
  new: "#6366f1", in_review: "#f59e0b", proposal_sent: "#8b5cf6",
  contract_sent: "#d946ef", contract_signed: "#3b82f6",
  in_progress: "#f97316", completed: "#10b981", cancelled: "#ef4444",
};
const FEED_COLORS: Record<string, { bg: string; icon: React.ReactNode }> = {
  task: { bg: "bg-primary/15 text-primary", icon: <ClipboardList className="h-3.5 w-3.5" /> },
  message: { bg: "bg-secondary/15 text-secondary", icon: <MessageSquare className="h-3.5 w-3.5" /> },
  subscriber: { bg: "bg-emerald-500/15 text-emerald-400", icon: <Users className="h-3.5 w-3.5" /> },
};

// ── Sub-components ───────────────────────────────────────────────
const GrowthBadge = ({ pct }: { pct: number }) => (
  <span className={`inline-flex items-center gap-0.5 text-xs font-semibold rounded-full px-1.5 py-0.5 ${pct >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
    {pct >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
    {Math.abs(pct)}%
  </span>
);

const StatCard = ({ icon: Icon, label, value, color, prefix = "", growth }: {
  icon: React.ElementType; label: string; value: number; color: string; prefix?: string; growth?: GrowthMetric;
}) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    className="rounded-xl border border-border bg-card p-5">
    <div className="flex items-center justify-between mb-3">
      <Icon className={`h-5 w-5 ${color}`} />
      {growth ? <GrowthBadge pct={growth.pct} /> : <TrendingUp className="h-3 w-3 text-emerald-400" />}
    </div>
    <p className="text-2xl font-bold text-foreground">{prefix}{value.toLocaleString()}</p>
    <p className="text-xs text-muted-foreground mt-1">{label}</p>
  </motion.div>
);

const SectionCard = ({ title, icon: Icon, iconColor = "text-primary", children, className = "" }: {
  title: string; icon: React.ElementType; iconColor?: string; children: React.ReactNode; className?: string;
}) => (
  <div className={`rounded-xl border border-border bg-card ${className}`}>
    <div className="flex items-center gap-2 p-5 border-b border-border">
      <Icon className={`h-4 w-4 ${iconColor}`} />
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card shadow-xl p-3 text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────
const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0, pendingTasks: 0, completedTasks: 0, totalContacts: 0,
    unreadContacts: 0, revenue: 0, totalPortfolio: 0, publishedPortfolio: 0,
    totalTestimonials: 0, totalSubscribers: 0,
  });
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<DashboardStats>(ENDPOINTS.ADMIN_DASHBOARD_STATS).then(({ data }) => {
      if (data) setStats(data);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    apiRequest<ActivityData>(ENDPOINTS.ADMIN_ACTIVITY(days)).then(({ data }) => {
      if (data) setActivity(data);
      setLoading(false);
    });
  }, [days]);

  const statCards = [
    { key: "totalTasks", label: "Total Tasks", icon: ClipboardList, color: "text-primary", growth: activity?.growth.tasks },
    { key: "pendingTasks", label: "Pending Tasks", icon: Clock, color: "text-amber-400" },
    { key: "completedTasks", label: "Completed", icon: CheckCircle, color: "text-emerald-400" },
    { key: "unreadContacts", label: "Unread Messages", icon: MessageSquare, color: "text-violet-400", growth: activity?.growth.messages },
    { key: "totalSubscribers", label: "Subscribers", icon: Users, color: "text-sky-400", growth: activity?.growth.subscribers },
    { key: "revenue", label: "Est. Revenue", icon: DollarSign, color: "text-amber-300", prefix: "$" },
  ] as const;

  // Trend chart: show only every Nth label for readability
  const trendData = (activity?.trendChart ?? []).map(d => ({
    ...d,
    label: d.date.slice(5), // "MM-DD"
  }));

  // Funnel bar widths
  const funnelMax = activity?.funnel[0]?.count || 1;

  // Content health items
  const ch = activity?.contentHealth;
  const healthItems = ch ? [
    { label: "Published Posts", value: ch.publishedPosts, sub: `${ch.draftPosts} drafts`, icon: FileText, color: "text-sky-400" },
    { label: "Portfolio Items", value: ch.publishedPortfolio, sub: `of ${ch.totalPortfolio} total`, icon: Image, color: "text-violet-400" },
    { label: "Testimonials", value: ch.totalTestimonials, sub: "approved", icon: Star, color: "text-amber-400" },
    { label: "Subscribers", value: ch.totalSubscribers, sub: "active", icon: Mail, color: "text-emerald-400" },
    { label: "Unread Messages", value: ch.unreadMessages, sub: "need attention", icon: MessageSquare, color: ch.unreadMessages > 0 ? "text-red-400" : "text-muted-foreground" },
  ] : [];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Complete overview of your SunTriX workspace</p>
        </div>
        {/* Day range selector */}
        <div className="flex bg-muted/50 p-1 rounded-lg border border-border gap-0.5">
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${days === d ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={card.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <StatCard
              icon={card.icon}
              label={card.label}
              value={stats[card.key] as number}
              color={card.color}
              prefix={"prefix" in card ? card.prefix : ""}
              growth={"growth" in card ? card.growth : undefined}
            />
          </motion.div>
        ))}
      </div>

      {/* Activity Trend Chart */}
      <SectionCard title={`Activity Trends — Last ${days} Days`} icon={Activity} className="">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gTasks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gMsgs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gSubs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={days === 7 ? 0 : days === 30 ? 4 : 13} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="tasks" name="Tasks" stroke="#6366f1" strokeWidth={2} fill="url(#gTasks)" dot={false} activeDot={{ r: 4 }} />
              <Area type="monotone" dataKey="messages" name="Messages" stroke="#8b5cf6" strokeWidth={2} fill="url(#gMsgs)" dot={false} activeDot={{ r: 4 }} />
              <Area type="monotone" dataKey="subscribers" name="Subscribers" stroke="#10b981" strokeWidth={2} fill="url(#gSubs)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </SectionCard>

      {/* Row: Pipeline + Activity Feed */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Task Pipeline Donut */}
        <SectionCard title="Task Pipeline" icon={Briefcase} iconColor="text-amber-400">
          {loading || !activity?.taskPipeline?.length ? (
            <div className="h-48 flex items-center justify-center">
              {loading ? <div className="h-6 w-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /> : <p className="text-xs text-muted-foreground">No tasks yet</p>}
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={activity.taskPipeline} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                    {activity.taskPipeline.map((entry) => (
                      <Cell key={entry.status} fill={PIPE_COLORS[entry.status] || "#6b7280"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, String(n).replace("_", " ")]} contentStyle={{ fontSize: 11, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {activity.taskPipeline.map(p => (
                  <div key={p.status} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground capitalize">
                      <span className="h-2 w-2 rounded-full" style={{ background: PIPE_COLORS[p.status] || "#6b7280" }} />
                      {p.status.replace("_", " ")}
                    </span>
                    <span className="font-semibold text-foreground">{p.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </SectionCard>

        {/* Live Activity Feed */}
        <SectionCard title="Live Activity Feed" icon={Zap} iconColor="text-yellow-400" className="lg:col-span-2">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-muted/40 rounded-lg animate-pulse" />)}
            </div>
          ) : !activity?.feed?.length ? (
            <div className="h-48 flex flex-col items-center justify-center gap-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No activity yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {activity.feed.map((item, i) => {
                const fc = FEED_COLORS[item.type] ?? { bg: "bg-muted text-muted-foreground", icon: <Activity className="h-3.5 w-3.5" /> };
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                    <span className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${fc.bg}`}>
                      {fc.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap shrink-0">{formatDate(item.at)}</span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Row: Top Services + Funnel */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Services Bar Chart */}
        <SectionCard title="Top Requested Services" icon={BarChart3} iconColor="text-violet-400">
          {loading || !activity?.topServices?.length ? (
            <div className="h-48 flex items-center justify-center">
              {loading ? <div className="h-6 w-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /> : <p className="text-xs text-muted-foreground">No data yet</p>}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={activity.topServices} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="service" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={110} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Requests" fill="#8b5cf6" radius={[0, 4, 4, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        {/* Conversion Funnel */}
        <SectionCard title="Client Conversion Funnel" icon={ArrowRight} iconColor="text-sky-400">
          {loading || !activity?.funnel ? (
            <div className="h-48 flex items-center justify-center">
              {loading ? <div className="h-6 w-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /> : null}
            </div>
          ) : (
            <div className="space-y-3">
              {activity.funnel.map((stage, i) => {
                const pct = funnelMax > 0 ? Math.max(8, Math.round((stage.count / funnelMax) * 100)) : 8;
                const colors = ["#6366f1", "#8b5cf6", "#f59e0b", "#f97316", "#10b981"];
                return (
                  <div key={stage.stage}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground font-medium">{stage.stage}</span>
                      <span className="font-bold text-foreground">{stage.count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="h-full rounded-full" style={{ background: colors[i] }} />
                    </div>
                  </div>
                );
              })}
              {funnelMax > 0 && (
                <p className="text-xs text-muted-foreground pt-1">
                  Conversion rate: <span className="font-semibold text-foreground">
                    {activity.funnel[4]?.count > 0 ? Math.round((activity.funnel[4].count / funnelMax) * 100) : 0}%
                  </span> inquiries → completed
                </p>
              )}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Content Health */}
      <SectionCard title="Content Health" icon={Globe} iconColor="text-emerald-400">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {healthItems.map((item) => (
            <div key={item.label} className="flex flex-col items-center text-center p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-colors">
              <item.icon className={`h-6 w-6 mb-2 ${item.color}`} />
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.sub}</p>
            </div>
          ))}
          {loading && [...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-muted/40 rounded-xl animate-pulse" />
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

export default AdminDashboard;
