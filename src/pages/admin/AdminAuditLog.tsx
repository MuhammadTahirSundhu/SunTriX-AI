import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import { Search, Shield, Filter, ChevronDown, User, RefreshCw } from "lucide-react";

interface AuditLog {
  _id: string;
  action: string;
  entity: string;
  entityId?: string;
  changes?: Record<string, unknown>;
  performedBy?: { name: string; email: string };
  ip?: string;
  createdAt: string;
}

const actionColors: Record<string, string> = {
  create: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  update: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  delete: "bg-red-500/10 text-red-500 border-red-500/20",
  login: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  logout: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  publish: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  status_change: "bg-primary/10 text-primary border-primary/20",
};

const AdminAuditLog = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterEntity, setFilterEntity] = useState("all");

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await apiRequest<{ logs: AuditLog[] }>(ENDPOINTS.AUDIT_LIST);
    if (data?.logs) setLogs(data.logs);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const entities = ["all", ...Array.from(new Set(logs.map((l) => l.entity)))];
  const actions = ["all", ...Array.from(new Set(logs.map((l) => l.action)))];

  const filtered = logs.filter((l) => {
    const matchSearch =
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.entity.toLowerCase().includes(search.toLowerCase()) ||
      (l.performedBy?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.performedBy?.email || "").toLowerCase().includes(search.toLowerCase());
    const matchAction = filterAction === "all" || l.action === filterAction;
    const matchEntity = filterEntity === "all" || l.entity === filterEntity;
    return matchSearch && matchAction && matchEntity;
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Audit Log</h1>
          <p className="text-sm text-muted-foreground">Complete trail of admin actions</p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, entity, or user..."
            className="w-full rounded-lg border border-border bg-muted/50 pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="appearance-none rounded-lg border border-border bg-muted/50 pl-10 pr-8 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary capitalize"
          >
            {actions.map((a) => <option key={a} value={a} className="capitalize">{a === "all" ? "All Actions" : a}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
        </div>

        <div className="relative">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="appearance-none rounded-lg border border-border bg-muted/50 pl-10 pr-8 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary capitalize"
          >
            {entities.map((e) => <option key={e} value={e} className="capitalize">{e === "all" ? "All Entities" : e}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Loading audit logs...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Entity</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Performed By</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">IP</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-muted-foreground">
                      No audit logs found
                    </td>
                  </tr>
                ) : (
                  filtered.map((log, idx) => (
                    <motion.tr
                      key={log._id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${actionColors[log.action] || "bg-muted text-muted-foreground border-border"}`}>
                          {log.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-medium text-foreground capitalize">{log.entity}</span>
                        {log.entityId && (
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">{log.entityId.slice(-8)}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {log.performedBy ? (
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                              <User className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-sm">{log.performedBy.name}</p>
                              <p className="text-xs text-muted-foreground">{log.performedBy.email}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">System</span>
                        )}
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-xs font-mono text-muted-foreground">{log.ip || "—"}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="text-xs text-muted-foreground">
                          <p>{new Date(log.createdAt).toLocaleDateString()}</p>
                          <p>{new Date(log.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLog;
