import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import { Search, Filter, Trash2, Eye, ChevronDown, LayoutGrid, List as ListIcon, CheckSquare, Square, Copy, Check, X } from "lucide-react";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import { SortControl, SortOption } from "@/components/admin/SortControl";

type TaskStatus = "new" | "in_review" | "proposal_sent" | "contract_sent" | "contract_signed" | "in_progress" | "completed" | "cancelled";

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
  techStack: string;
  status: TaskStatus;
  statusHistory?: StatusHistory[];
  trackingToken?: string;
  selectedPlan?: string;
  planBudget?: number;
  contractToken?: string;
  contractSignedAt?: string;
  contractClientName?: string;
  createdAt: string;
}

const statusOptions: { value: TaskStatus; label: string; color: string }[] = [
  { value: "new",              label: "New Request",     color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { value: "in_review",       label: "In Review",       color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  { value: "proposal_sent",   label: "Proposal Sent",   color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  { value: "contract_sent",   label: "Contract Sent",   color: "bg-violet-500/10 text-violet-500 border-violet-500/20" },
  { value: "contract_signed", label: "Contract Signed", color: "bg-teal-500/10 text-teal-500 border-teal-500/20" },
  { value: "in_progress",     label: "In Progress",     color: "bg-primary/10 text-primary border-primary/20" },
  { value: "completed",       label: "Completed",       color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { value: "cancelled",       label: "Cancelled",       color: "bg-red-500/10 text-red-500 border-red-500/20" },
];

const AdminTasks = () => {
  const [tasks, setTasks] = useState<TaskRequest[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<TaskRequest | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "board">("board");
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Side panel state
  const [statusNote, setStatusNote] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Proposal panel state
  const [showProposalPanel, setShowProposalPanel] = useState(false);
  const [proposalDraft, setProposalDraft] = useState({
    title: "", 
    executiveSummary: "",
    scopeOfWork: "", deliverables: "", timeline: "", pricingBreakdown: "",
    revisionsPolicy: "", clientResponsibilities: "", supportAndWarranty: "", paymentTerms: "", nextSteps: "",
    milestones: [{ title: "Milestone 1", description: "", amount: "", dueWeek: "" }],
  });
  const [aiDrafting, setAiDrafting] = useState(false);
  const [sendingProposal, setSendingProposal] = useState(false);

  // Invoice panel state
  const [showInvoicePanel, setShowInvoicePanel] = useState(false);
  const [invoiceDraft, setInvoiceDraft] = useState({ amountUSD: "", description: "" });
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  const fetchTasks = async (currentTaskId?: string) => {
    const { data } = await apiRequest<{ tasks: TaskRequest[] }>(ENDPOINTS.TASK_REQUEST_LIST);
    if (data?.tasks) {
      setTasks(data.tasks);
      setSelectedTask((prev) => {
        const activeId = currentTaskId || prev?._id;
        if (!activeId) return null;
        const updated = data.tasks.find((t) => t._id === activeId);
        return updated || prev;
      });
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.email.toLowerCase().includes(search.toLowerCase()) || 
                          (t.company || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortOption === "date-desc") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    if (sortOption === "date-asc") return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    if (sortOption === "az") return a.name.localeCompare(b.name);
    if (sortOption === "za") return b.name.localeCompare(a.name);
    return 0;
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
    fetchTasks(id);
  };

  const handleSelectTask = async (task: TaskRequest) => {
    setSelectedTask(task);
    if (task.status === "new") {
      // Automatically transition new tasks to in_review when admin opens them
      await updateStatus(task._id, "in_review", "Admin opened for review");
    }
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

  const handleAiDraftProposal = async () => {
    if (!selectedTask) return;
    setAiDrafting(true);
    const { data, error } = await apiRequest<{ draft: any }>(ENDPOINTS.PROPOSAL_ADMIN_AI_DRAFT, {
      method: "POST",
      body: { taskRequestId: selectedTask._id },
    });
    setAiDrafting(false);
    if (data?.draft) {
      const d = data.draft;
      setProposalDraft({
        title:                     d.title || "",
        executiveSummary:          d.executiveSummary || "",
        scopeOfWork:               d.scopeOfWork || "",
        deliverables:              d.deliverables || "",
        timeline:                  d.timeline || "",
        pricingBreakdown:          d.pricingBreakdown || "",
        revisionsPolicy:           d.revisionsPolicy || "",
        clientResponsibilities:    d.clientResponsibilities || "",
        supportAndWarranty:        d.supportAndWarranty || "",
        paymentTerms:              d.paymentTerms || "",
        nextSteps:                 d.nextSteps || "",
        milestones:   Array.isArray(d.milestones) && d.milestones.length > 0
          ? d.milestones.map((m: any, i: number) => ({
              title:       m.title       || `Milestone ${i + 1}`,
              description: m.description || "",
              amount:      String(m.amount || ""),
              dueWeek:     String(m.dueWeek || ""),
            }))
          : [{ title: "Milestone 1", description: "", amount: "", dueWeek: "" }],
      });
    } else {
      alert(error || "AI draft failed. Please fill in manually.");
    }
  };

  const handleSendProposal = async () => {
    if (!selectedTask || !proposalDraft.title || !proposalDraft.milestones.length) return;
    setSendingProposal(true);
    const { error } = await apiRequest(ENDPOINTS.PROPOSAL_ADMIN_CREATE, {
      method: "POST",
      body: {
        taskRequestId: selectedTask._id,
        clientEmail:   selectedTask.email,
        clientName:    selectedTask.name,
        title:                     proposalDraft.title,
        executiveSummary:          proposalDraft.executiveSummary,
        scopeOfWork:               proposalDraft.scopeOfWork,
        deliverables:              proposalDraft.deliverables,
        timeline:                  proposalDraft.timeline,
        pricingBreakdown:          proposalDraft.pricingBreakdown,
        revisionsPolicy:           proposalDraft.revisionsPolicy,
        clientResponsibilities:    proposalDraft.clientResponsibilities,
        supportAndWarranty:        proposalDraft.supportAndWarranty,
        paymentTerms:              proposalDraft.paymentTerms,
        nextSteps:                 proposalDraft.nextSteps,
        milestones:    proposalDraft.milestones.map((m, i) => ({
          title:       m.title,
          description: m.description,
          amount:      parseFloat(m.amount) || 0,
          dueWeek:     parseInt(m.dueWeek) || 0,
          order:       i,
        })),
        aiDrafted: aiDrafting,
      },
    });
    setSendingProposal(false);
    if (!error) {
      setShowProposalPanel(false);
      setProposalDraft({
        title: "", 
        executiveSummary: "",
        scopeOfWork: "", deliverables: "", timeline: "", pricingBreakdown: "",
        revisionsPolicy: "", clientResponsibilities: "", supportAndWarranty: "", paymentTerms: "", nextSteps: "",
        milestones: [{ title: "Milestone 1", description: "", amount: "", dueWeek: "" }],
      });
      fetchTasks();
    } else {
      alert(error);
    }
  };

  const handleCreateInvoice = async () => {
    if (!selectedTask || !invoiceDraft.amountUSD || !invoiceDraft.description) return;
    setCreatingInvoice(true);
    const { error } = await apiRequest(ENDPOINTS.PAYMENT_ADMIN_CREATE_INVOICE, {
      method: "POST",
      body: {
        taskRequestId: selectedTask._id,
        clientEmail: selectedTask.email,
        clientName: selectedTask.name,
        amountUSD: parseFloat(invoiceDraft.amountUSD) || 0,
        description: invoiceDraft.description,
      },
    });
    setCreatingInvoice(false);
    if (!error) {
      setShowInvoicePanel(false);
      setInvoiceDraft({ amountUSD: "", description: "" });
      fetchTasks();
      alert("Invoice created and sent successfully!");
    } else {
      alert(error);
    }
  };

  const bulkActions = [
    {
      label: "Delete Selected",
      icon: Trash2,
      variant: "danger" as const,
      onClick: handleBulkDelete
    }
  ];

  // ── Import ENDPOINTS for proposal/contract actions ──
  const ENDPOINTS_LOCAL = ENDPOINTS;

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

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 shrink-0">
        <div className="flex flex-wrap gap-3 flex-1 min-w-[200px]">
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
        <SortControl value={sortOption} onChange={setSortOption} hideCustom />
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
                            onClick={() => handleSelectTask(task)}
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
                          onClick={() => handleSelectTask(task)}
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

                <div className="pt-5 border-t border-border mb-8">
                  <h4 className="text-sm font-semibold text-foreground mb-4">Actions</h4>
                  <div className="space-y-3">
                    {selectedTask.status === "in_review" && (
                      <button
                        onClick={() => setShowProposalPanel(true)}
                        className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                      >
                        Draft & Send Proposal
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (selectedTask.status !== "contract_signed" && selectedTask.status !== "in_progress") {
                          alert("Invoice can only be created after the contract is signed.");
                          return;
                        }
                        setShowInvoicePanel(true);
                      }}
                      className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        selectedTask.status === "contract_signed" || selectedTask.status === "in_progress"
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                      }`}
                      title={selectedTask.status === "contract_signed" || selectedTask.status === "in_progress" ? "Create Invoice" : "Contract must be signed first"}
                    >
                      Create Invoice
                    </button>
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

      {/* Proposal Modal */}
      <AnimatePresence>
        {showProposalPanel && selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl bg-card rounded-xl border border-border shadow-xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
                <h3 className="font-bold text-foreground">Draft Proposal</h3>
                <button onClick={() => setShowProposalPanel(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div className="flex justify-end mb-2">
                  <button
                    onClick={handleAiDraftProposal}
                    disabled={aiDrafting}
                    className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {aiDrafting ? "Generating with AI..." : "✨ Generate with AI"}
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Proposal Title</label>
                  <input
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={proposalDraft.title}
                    onChange={(e) => setProposalDraft({ ...proposalDraft, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Executive Summary</label>
                  <textarea
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground h-32 focus:outline-none focus:ring-1 focus:ring-primary"
                    value={proposalDraft.executiveSummary}
                    onChange={(e) => setProposalDraft({ ...proposalDraft, executiveSummary: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Scope of Work</label>
                  <textarea
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground h-32 focus:outline-none focus:ring-1 focus:ring-primary"
                    value={proposalDraft.scopeOfWork}
                    onChange={(e) => setProposalDraft({ ...proposalDraft, scopeOfWork: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Deliverables</label>
                  <textarea
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground h-32 focus:outline-none focus:ring-1 focus:ring-primary"
                    value={proposalDraft.deliverables}
                    onChange={(e) => setProposalDraft({ ...proposalDraft, deliverables: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Timeline</label>
                  <textarea
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground h-24 focus:outline-none focus:ring-1 focus:ring-primary"
                    value={proposalDraft.timeline}
                    onChange={(e) => setProposalDraft({ ...proposalDraft, timeline: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Pricing Breakdown</label>
                  <textarea
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground h-24 focus:outline-none focus:ring-1 focus:ring-primary"
                    value={proposalDraft.pricingBreakdown}
                    onChange={(e) => setProposalDraft({ ...proposalDraft, pricingBreakdown: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Revisions Policy</label>
                  <textarea
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground h-16 focus:outline-none focus:ring-1 focus:ring-primary"
                    value={proposalDraft.revisionsPolicy}
                    onChange={(e) => setProposalDraft({ ...proposalDraft, revisionsPolicy: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Client Responsibilities</label>
                  <textarea
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground h-20 focus:outline-none focus:ring-1 focus:ring-primary"
                    value={proposalDraft.clientResponsibilities}
                    onChange={(e) => setProposalDraft({ ...proposalDraft, clientResponsibilities: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Support & Warranty</label>
                  <textarea
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground h-16 focus:outline-none focus:ring-1 focus:ring-primary"
                    value={proposalDraft.supportAndWarranty}
                    onChange={(e) => setProposalDraft({ ...proposalDraft, supportAndWarranty: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Payment Terms</label>
                  <textarea
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground h-16 focus:outline-none focus:ring-1 focus:ring-primary"
                    value={proposalDraft.paymentTerms}
                    onChange={(e) => setProposalDraft({ ...proposalDraft, paymentTerms: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Next Steps</label>
                  <textarea
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground h-20 focus:outline-none focus:ring-1 focus:ring-primary"
                    value={proposalDraft.nextSteps}
                    onChange={(e) => setProposalDraft({ ...proposalDraft, nextSteps: e.target.value })}
                  />
                </div>
              </div>
              <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/20">
                <button
                  onClick={() => setShowProposalPanel(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendProposal}
                  disabled={sendingProposal || !proposalDraft.title}
                  className="bg-primary px-4 py-2 rounded-lg text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {sendingProposal ? "Sending..." : "Send Proposal"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invoice Modal */}
      <AnimatePresence>
        {showInvoicePanel && selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card rounded-xl border border-border shadow-xl overflow-hidden"
            >
              <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
                <h3 className="font-bold text-foreground">Create Invoice</h3>
                <button onClick={() => setShowInvoicePanel(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Amount (USD)</label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={invoiceDraft.amountUSD}
                    onChange={(e) => setInvoiceDraft({ ...invoiceDraft, amountUSD: e.target.value })}
                    placeholder="e.g. 5000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Description (Milestone Details)</label>
                  <textarea
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground h-24 focus:outline-none focus:ring-1 focus:ring-primary"
                    value={invoiceDraft.description}
                    onChange={(e) => setInvoiceDraft({ ...invoiceDraft, description: e.target.value })}
                    placeholder="e.g. Milestone 1 of 3: UI Design Delivery"
                  />
                </div>
              </div>
              <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/20">
                <button
                  onClick={() => setShowInvoicePanel(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateInvoice}
                  disabled={creatingInvoice || !invoiceDraft.amountUSD || !invoiceDraft.description}
                  className="bg-emerald-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {creatingInvoice ? "Sending..." : "Send Invoice"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTasks;
