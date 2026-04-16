import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import { Search, Filter, Trash2, Eye, ChevronDown } from "lucide-react";

type TaskStatus = "new" | "in_review" | "proposal_sent" | "in_progress" | "completed" | "cancelled";

interface TaskRequest {
  _id: string;
  id?: string;
  name: string;
  email: string;
  company: string;
  service: string;
  budget: string;
  timeline: string;
  description: string;
  priority: string;
  status: TaskStatus;
  createdAt: string;
}

const statusOptions: TaskStatus[] = ["new", "in_review", "proposal_sent", "in_progress", "completed", "cancelled"];

const statusColors: Record<string, string> = {
  new: "bg-primary/10 text-primary",
  in_review: "bg-warning/10 text-warning",
  proposal_sent: "bg-secondary/10 text-secondary",
  in_progress: "bg-gold/10 text-gold",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const AdminTasks = () => {
  const [tasks, setTasks] = useState<TaskRequest[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<TaskRequest | null>(null);

  const fetchTasks = async () => {
    const { data } = await apiRequest<{ tasks: TaskRequest[] }>(ENDPOINTS.TASK_REQUEST_LIST);
    if (data?.tasks) setTasks(data.tasks);
  };

  useEffect(() => { fetchTasks(); }, []);

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase()) || (t.company || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (id: string, status: TaskStatus) => {
    await apiRequest(ENDPOINTS.TASK_REQUEST_UPDATE(id), { method: "PUT", body: { status } });
    fetchTasks();
    if (selectedTask && (selectedTask._id === id)) setSelectedTask({ ...selectedTask, status });
  };

  const deleteTask = async (id: string) => {
    await apiRequest(ENDPOINTS.TASK_REQUEST_BY_ID(id), { method: "DELETE" });
    fetchTasks();
    if (selectedTask && selectedTask._id === id) setSelectedTask(null);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Task Requests</h1>
        <p className="text-sm text-muted-foreground">Manage incoming project briefs</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
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
            <option value="all">All Status</option>
            {statusOptions.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Table */}
        <div className="flex-1 rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Service</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No tasks found</td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr key={task._id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{task.name}</p>
                        <p className="text-xs text-muted-foreground">{task.email}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{task.service}</td>
                      <td className="px-4 py-3">
                        <select
                          value={task.status}
                          onChange={(e) => updateStatus(task._id, e.target.value as TaskStatus)}
                          className={`text-xs rounded-full px-2 py-1 border-0 ${statusColors[task.status]} cursor-pointer`}
                        >
                          {statusOptions.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(task.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setSelectedTask(task)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          <button onClick={() => deleteTask(task._id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
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

        {/* Detail Panel */}
        {selectedTask && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-80 rounded-xl border border-border bg-card p-5 shrink-0 self-start">
            <h3 className="text-sm font-semibold text-foreground mb-4">Task Details</h3>
            <div className="space-y-3 text-sm">
              {Object.entries({ Name: selectedTask.name, Email: selectedTask.email, Company: selectedTask.company, Service: selectedTask.service, Budget: selectedTask.budget, Timeline: selectedTask.timeline, Priority: selectedTask.priority }).map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs text-muted-foreground">{k}</p>
                  <p className="text-foreground">{v || "—"}</p>
                </div>
              ))}
              <div>
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="text-foreground text-xs leading-relaxed">{selectedTask.description || "—"}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminTasks;
