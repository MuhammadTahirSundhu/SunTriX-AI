import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import { Search, Filter, Trash2, Eye, ChevronDown, LayoutGrid, List as ListIcon, CheckSquare, Square, Copy, Check, X } from "lucide-react";
import { BulkActionBar } from "@/components/admin/BulkActionBar";

type TaskStatus = "new" | "in_review" | "proposal_sent" | "in_progress" | "completed" | "cancelled";

interface StatusHistory {
  status: TaskStatus;
  note: string;
  updatedAt: string;
}

interface TaskRequest {
  _id: string;
  name: string;
  email: string;
  company: string;
  projectTitle: string;
  service: string;
  budget: string;
  timeline: string;
  description: string;
  priority: string;
  status: TaskStatus;
  statusHistory?: StatusHistory[];
  trackingToken?: string;
  createdAt: string;
}

const statusOptions: { value: TaskStatus; label: string; color: string }[] = [
  { value: "new", label: "New Request", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { value: "in_review", label: "In Review", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  { value: "proposal_sent", label: "Proposal Sent", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  { value: "in_progress", label: "In Progress", color: "bg-primary/10 text-primary border-primary/20" },
  { value: "completed", label: "Completed", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500/10 text-red-500 border-red-500/20" },
];

const AdminTasks = () => {
  const [tasks, setTasks] = useState<TaskRequest[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<TaskRequest | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "board">("board");
  
  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Side panel state
  const [statusNote, setStatusNote] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchTasks = async () => {
    const { data } = await apiRequest<{ tasks: TaskRequest[] }>(ENDPOINTS.TASK_REQUEST_LIST);
    if (data?.tasks) {
      setTasks(data.tasks);
      // Update selected task if open
      if (selectedTask) {
        const updated = data.tasks.find((t) => t._id === selectedTask._id);
        if (updated) setSelectedTask(updated);
      }
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.email.toLowerCase().includes(search.toLowerCase()) || 
                          (t.company || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredTasks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTasks.map((t) => t._id)));
    }
  };

  const updateStatus = async (id: string, status: TaskStatus, note?: string) => {
    setUpdatingStatus(true);
    await apiRequest(ENDPOINTS.TASK_REQUEST_UPDATE_STATUS(id), { 
      method: "PUT", 
      body: { status, note: note || "" } 
    });
    setStatusNote("");
    setUpdatingStatus(false);
    fetchTasks();
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} tasks?`)) return;
    await apiRequest(ENDPOINTS.TASK_REQUEST_BULK_DELETE, {
      method: "DELETE",
      body: { ids: Array.from(selectedIds) }
    });
    setSelectedIds(new Set());
    setSelectedTask(null);
    fetchTasks();
  };

  const copyTrackingLink = (token: string) => {
    const url = `${window.location.origin}/track/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const bulkActions = [
    {
      label: "Delete Selected",
      icon: Trash2,
      variant: "danger" as const,
      onClick: handleBulkDelete
    }
  ];

  return (
    <div className="p-6 lg:p-8 flex h-[calc(100vh-theme(spacing.16))] flex-col">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Task Pipeline</h1>
          <p className="text-sm text-muted-foreground">Manage incoming requests and status</p>
        </div>
        <div className="flex bg-muted/50 p-1 rounded-lg border border-border">
          <button 
            onClick={() => setViewMode("board")} 
            className={`p-2 rounded-md flex items-center justify-center transition-colors ${viewMode === "board" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setViewMode("list")} 
            className={`p-2 rounded-md flex items-center justify-center transition-colors ${viewMode === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <ListIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6 shrink-0">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or company..."
            className="w-full rounded-lg border border-border bg-muted/50 pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none rounded-lg border border-border bg-muted/50 pl-10 pr-8 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Statuses</option>
            {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Main View Area */}
        <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
          {viewMode === "board" ? (
            <div className="flex gap-4 overflow-x-auto h-full pb-4 items-start snap-x">
              {statusOptions.map((status) => {
                const columnTasks = filteredTasks.filter(t => t.status === status.value);
                return (
                  <div key={status.value} className="flex-shrink-0 w-80 bg-muted/30 rounded-xl border border-border p-4 flex flex-col max-h-full snap-start">
                    <div className="flex items-center justify-between mb-4 shrink-0">
                      <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${status.color.split(" ")[0]}`}></span>
                        {status.label}
                      </h3>
                      <span className="text-xs font-medium text-muted-foreground bg-card px-2 py-0.5 rounded-full border border-border">
                        {columnTasks.length}
                      </span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-1">
                      {columnTasks.map(task => {
                        const isSelected = selectedIds.has(task._id);
                        return (
                          <div 
                            key={task._id}
                            onClick={() => setSelectedTask(task)}
                            className={`p-4 rounded-lg bg-card border cursor-pointer hover:border-primary/50 transition-colors relative group
                              ${selectedTask?._id === task._id ? "border-primary shadow-sm" : "border-border shadow-sm"}
                              ${isSelected ? "ring-1 ring-primary" : ""}
                            `}
                          >
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <button 
                                onClick={(e) => { e.stopPropagation(); toggleSelection(task._id); }}
                                className="text-muted-foreground hover:text-primary bg-card rounded"
                              >
                                {isSelected ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                              </button>
                            </div>
                            
                            <h4 className="font-medium text-sm text-foreground pr-6 mb-1 truncate">{task.name}</h4>
                            {task.company && <p className="text-xs text-muted-foreground mb-3 truncate">{task.company}</p>}
                            
                            <div className="flex items-center justify-between text-xs mt-4 pt-3 border-t border-border/50">
                              <span className="text-muted-foreground bg-muted px-2 py-1 rounded-md">{task.service}</span>
                              <span className="text-muted-foreground">{new Date(task.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden flex-1 flex flex-col">
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left w-10">
                        <button onClick={toggleAll} className="text-muted-foreground hover:text-foreground">
                          {selectedIds.size === filteredTasks.length && filteredTasks.length > 0 ? (
                            <CheckSquare className="h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Client</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Service</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Date</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredTasks.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No tasks found</td></tr>
                    ) : (
                      filteredTasks.map((task) => (
                        <tr 
                          key={task._id} 
                          onClick={() => setSelectedTask(task)}
                          className={`hover:bg-muted/30 transition-colors cursor-pointer ${selectedTask?._id === task._id ? 'bg-primary/5' : ''}`}
                        >
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => toggleSelection(task._id)} className="text-muted-foreground hover:text-primary">
                              {selectedIds.has(task._id) ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-foreground">{task.name}</p>
                            <p className="text-xs text-muted-foreground">{task.company || task.email}</p>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{task.service}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full border ${statusOptions.find(s => s.value === task.status)?.color}`}>
                              {statusOptions.find(s => s.value === task.status)?.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(task.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel for Detail */}
        <AnimatePresence>
          {selectedTask && (
            <motion.div 
              initial={{ opacity: 0, x: 20, width: 0 }} 
              animate={{ opacity: 1, x: 0, width: 380 }} 
              exit={{ opacity: 0, x: 20, width: 0 }}
              className="rounded-xl border border-border bg-card shrink-0 self-start flex flex-col h-full overflow-hidden"
            >
              <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
                <h3 className="font-semibold text-foreground">Task Details</h3>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-foreground mb-1">{selectedTask.projectTitle || "New Project"}</h2>
                  <p className="text-sm text-muted-foreground">{selectedTask.name} • {selectedTask.company || selectedTask.email}</p>
                </div>

                {selectedTask.trackingToken && (
                  <div className="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5 flex flex-col gap-2">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Client Portal Link</span>
                    <div className="flex items-center gap-2">
                      <input 
                        readOnly 
                        value={`${window.location.origin}/track/${selectedTask.trackingToken}`}
                        className="flex-1 bg-background border border-border rounded-md px-3 py-1.5 text-xs text-muted-foreground outline-none"
                      />
                      <button 
                        onClick={() => copyTrackingLink(selectedTask.trackingToken!)}
                        className="p-1.5 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                        title="Copy tracking link"
                      >
                        {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-5 mb-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Service</p>
                      <p className="text-sm font-medium text-foreground">{selectedTask.service}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Budget</p>
                      <p className="text-sm font-medium text-foreground">{selectedTask.budget}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Timeline</p>
                      <p className="text-sm font-medium text-foreground">{selectedTask.timeline}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Priority</p>
                      <p className="text-sm font-medium text-foreground">{selectedTask.priority || "Normal"}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap p-3 bg-muted/30 rounded-lg border border-border">
                      {selectedTask.description}
                    </p>
                  </div>
                </div>

                <div className="pt-5 border-t border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-4">Update Status</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">New Status</label>
                      <select
                        value={selectedTask.status}
                        onChange={(e) => updateStatus(selectedTask._id, e.target.value as TaskStatus)}
                        disabled={updatingStatus}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Internal Note (Saved to timeline)</label>
                      <textarea
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        placeholder="Add a note about this status change..."
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-20 resize-none"
                      />
                    </div>
                    <button
                      onClick={() => updateStatus(selectedTask._id, selectedTask.status, statusNote)}
                      disabled={updatingStatus || !statusNote.trim()}
                      className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingStatus ? "Saving..." : "Add Note & Save"}
                    </button>
                  </div>
                </div>

                {selectedTask.statusHistory && selectedTask.statusHistory.length > 0 && (
                  <div className="pt-6 mt-6 border-t border-border">
                    <h4 className="text-sm font-semibold text-foreground mb-4">Timeline</h4>
                    <div className="space-y-4 border-l-2 border-border ml-2 pl-4">
                      {selectedTask.statusHistory.map((h, i) => (
                        <div key={i} className="relative">
                          <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-card ${statusOptions.find(s => s.value === h.status)?.color.split(" ")[0]}`}></span>
                          <p className="text-xs font-medium text-foreground">{statusOptions.find(s => s.value === h.status)?.label}</p>
                          <p className="text-[10px] text-muted-foreground mb-1">{new Date(h.updatedAt).toLocaleString()}</p>
                          {h.note && (
                            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md mt-1 italic border border-border/50">"{h.note}"</p>
                          )}
                        </div>
                      )).reverse()}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BulkActionBar 
        selectedCount={selectedIds.size} 
        onClear={() => setSelectedIds(new Set())} 
        actions={bulkActions} 
      />
    </div>
  );
};

export default AdminTasks;
