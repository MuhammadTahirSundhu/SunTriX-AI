import { useState, useEffect } from "react";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Shield, User, Clock, Terminal } from "lucide-react";

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

export const AdminAuditLog = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await apiRequest<{ logs: AuditLog[] }>(ENDPOINTS.AUDIT_LIST);
    if (data?.logs) setLogs(data.logs);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter((l) => {
    const matchesTab = activeTab === "all" ? true : l.action === activeTab;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      l.action.toLowerCase().includes(q) ||
      l.entity.toLowerCase().includes(q) ||
      (l.performedBy?.name || "").toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const tabsWithCounts = [
    { id: "all", label: "All Events", count: logs.length },
    { id: "update", label: "Updates", count: logs.filter((l) => l.action === "update").length },
    { id: "create", label: "Creations", count: logs.filter((l) => l.action === "create").length },
    { id: "delete", label: "Deletions", count: logs.filter((l) => l.action === "delete").length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Audit Trail & Security Logs"
        description="Immutable system event logs, administrator actions, and setting updates."
      />

      {/* Main Table */}
      <AdminDataTable
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter audit records by entity, action, or admin name…"
        tabs={tabsWithCounts}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        loading={loading}
        isEmpty={filtered.length === 0}
        emptyTitle="No audit log records"
        emptyDescription="System actions and setting changes will appear here automatically."
        onRefresh={fetchLogs}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action / Event</th>
                <th className="px-4 py-3">Target Entity</th>
                <th className="px-4 py-3">Performed By</th>
                <th className="px-4 py-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-mono">
              {filtered.map((l) => (
                <tr key={l._id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {new Date(l.createdAt).toLocaleString()}
                  </td>

                  <td className="px-4 py-3.5">
                    <AdminStatusBadge status={l.action} size="sm" />
                  </td>

                  <td className="px-4 py-3.5 font-bold text-foreground">
                    {l.entity} {l.entityId ? `(#${l.entityId.slice(-6)})` : ""}
                  </td>

                  <td className="px-4 py-3.5 text-foreground">
                    {l.performedBy?.name || "System"} ({l.performedBy?.email || "internal"})
                  </td>

                  <td className="px-4 py-3.5 text-muted-foreground">{l.ip || "127.0.0.1"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminDataTable>
    </div>
  );
};

export default AdminAuditLog;
