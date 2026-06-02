import { useState, useEffect, useRef } from "react";
import { apiRequest, ENDPOINTS } from "../lib/api";
import { toast } from "react-hot-toast";
import { 
  CheckCircle2, Clock, Send, Upload, FileText, 
  AlertCircle, Eye, ExternalLink, ClipboardList
} from "lucide-react";

interface AdminProjectHubProps {
  taskId: string;
}

const AdminProjectHub = ({ taskId }: AdminProjectHubProps) => {
  const [tracker, setTracker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "deliverables" | "milestones" | "updates" | "files" | "chat" | "audit">("overview");
  const [newUpdate, setNewUpdate] = useState({ type: "ProgressUpdate", body: "", nextUpdateDue: "" });
  const [chatMessage, setChatMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [markingPayable, setMarkingPayable] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [auditLog, setAuditLog] = useState<any[]>([]);

  const fetchTracker = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await apiRequest<{ trackers: any[] }>(ENDPOINTS.TRACKER_ADMIN_LIST);
      if (data?.trackers) {
        const found = data.trackers.find(
          (t: any) => t.taskRequestId?._id === taskId || t.taskRequestId === taskId
        );
        if (found) {
          const { data: detail } = await apiRequest<{ tracker: any }>(ENDPOINTS.TRACKER_ADMIN_BY_ID(found._id));
          if (detail?.tracker) {
            setTracker(detail.tracker);
          } else {
            setTracker(null);
          }
        } else {
          setTracker(null);
        }
      }
    } catch (err) { console.error(err); }
    finally { if (!silent) setLoading(false); }
  };

  const fetchAuditLog = async () => {
    if (!tracker?._id) return;
    const { data } = await apiRequest<{ auditLog: any[] }>(ENDPOINTS.TRACKER_ADMIN_AUDIT(tracker._id));
    if (data?.auditLog) setAuditLog(data.auditLog.slice().reverse());
  };

  useEffect(() => {
    fetchTracker();
    const interval = setInterval(() => fetchTracker(true), 8000);
    return () => clearInterval(interval);
  }, [taskId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tracker?.messages]);

  useEffect(() => {
    if (activeTab === "audit" && tracker?._id) fetchAuditLog();
  }, [activeTab, tracker?._id]);

  const phases = ["Discovery", "Design", "Development", "Testing", "Delivery"];
  const currentPhaseIdx = phases.indexOf(tracker?.currentPhase || "");

  const handleAdvancePhase = async () => {
    const nextPhase = phases[currentPhaseIdx + 1];
    if (!nextPhase) return;
    const note = prompt(`Optional admin note for advancing to ${nextPhase}:`);
    const { error } = await apiRequest(ENDPOINTS.TRACKER_ADMIN_PHASE_ADVANCE(tracker._id), { method: "POST", body: { nextPhase, adminNote: note || "" } });
    if (error) return toast.error("Failed to advance phase.");
    toast.success(`Moved to ${nextPhase}!`);
    fetchTracker(true);
  };

  const handleCompleteDeliverable = async (dId: string) => {
    const url = prompt("Optional: Paste the URL of the completed work:");
    const { error } = await apiRequest(ENDPOINTS.TRACKER_ADMIN_DELIVERABLE_DONE(tracker._id, dId), { method: "POST", body: { attachedUrl: url || "" } });
    if (error) return toast.error("Failed to update deliverable.");
    toast.success("Client notified to review!");
    fetchTracker(true);
  };

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdate.body.trim()) return;
    setSubmitting(true);
    const { error } = await apiRequest(ENDPOINTS.TRACKER_ADMIN_UPDATE(tracker._id), { method: "POST", body: newUpdate });
    setSubmitting(false);
    if (error) return toast.error("Failed to post update.");
    toast.success("Update posted & client notified!");
    setNewUpdate({ type: "ProgressUpdate", body: "", nextUpdateDue: "" });
    fetchTracker(true);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const msg = chatMessage;
    setChatMessage("");

    setTracker((prev: any) => prev ? {
      ...prev,
      messages: [...(prev.messages || []), { sender: "Admin", text: msg, sentAt: new Date().toISOString() }]
    } : prev);

    const { error } = await apiRequest(ENDPOINTS.TRACKER_ADMIN_CHAT(tracker._id), { method: "POST", body: { text: msg } });
    if (error) { toast.error("Failed to send message."); fetchTracker(true); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(ENDPOINTS.TRACKER_ADMIN_FILE_UPLOAD(tracker._id), {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      toast.success("File uploaded & client notified!");
      fetchTracker(true);
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleMarkPayable = async (mId: string, title: string) => {
    if (!confirm(`Mark "${title}" as due and send payment request to client?`)) return;
    setMarkingPayable(mId);
    const { error } = await apiRequest(ENDPOINTS.TRACKER_ADMIN_MILESTONE_PAYABLE(tracker._id, mId), { method: "POST" });
    setMarkingPayable(null);
    if (error) return toast.error("Failed to mark payable.");
    toast.success("Payment request sent to client!");
    fetchTracker(true);
  };

  const handleCompleteProject = async () => {
    if (!confirm("Are you sure you want to mark this project as completely finished?")) return;
    
    const { error } = await apiRequest(ENDPOINTS.TASK_REQUEST_UPDATE_STATUS(taskId), {
      method: "PUT",
      body: { status: "completed", note: "Project marked as Completed from Project Hub" }
    });

    if (error) {
      toast.error("Failed to complete project.");
      return;
    }

    toast.success("Project marked as completed! Reloading...");
    setTimeout(() => window.location.reload(), 1000);
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full" />
      </div>
    );
  }

  if (!tracker) {
    return (
      <div className="p-6 text-center text-muted-foreground text-sm space-y-2">
        <Clock className="h-12 w-12 mx-auto opacity-20 mb-3" />
        <p className="font-medium">No Project Hub yet</p>
        <p className="text-xs">A tracking hub is created automatically once the contract is signed.</p>
      </div>
    );
  }

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "deliverables", label: "Deliverables" },
    { id: "milestones", label: "Milestones" },
    { id: "updates", label: "Updates" },
    { id: "files", label: "Files" },
    { id: "chat", label: `Chat${tracker.messages?.filter((m:any) => m.sender === "Client" && !m.readByAdmin).length > 0 ? " 🔴" : ""}` },
    { id: "audit", label: "Audit" },
  ];

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden w-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card flex items-center justify-between shrink-0">
        <div>
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Project Hub
          </h2>
          <p className="text-xs text-muted-foreground">Phase: <span className="text-primary font-semibold">{tracker.currentPhase}</span></p>
        </div>
        <a
          href={`/client/project/${tracker.trackerToken}`}
          target="_blank" rel="noreferrer"
          className="text-xs bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
        >
          <ExternalLink className="h-3 w-3" /> Client Portal
        </a>
      </div>

      {/* Phase Progress */}
      <div className="px-4 py-3 border-b border-border bg-muted/20 shrink-0">
        <div className="flex justify-between items-center relative">
          <div className="absolute inset-x-0 top-1/2 h-0.5 bg-muted -translate-y-1/2" />
          {phases.map((p, i) => (
            <div key={p} className="flex flex-col items-center gap-1 z-10 bg-muted/20 px-0.5">
              <div className={`h-5 w-5 rounded-full flex items-center justify-center border text-[9px] font-bold z-10 ${
                i < currentPhaseIdx ? "bg-primary border-primary text-white" :
                i === currentPhaseIdx ? "bg-background border-primary text-primary" :
                "bg-background border-muted text-muted-foreground"
              }`}>
                {i < currentPhaseIdx ? "✓" : i + 1}
              </div>
              <span className="text-[9px] text-muted-foreground hidden sm:block">{p}</span>
            </div>
          ))}
        </div>
        {currentPhaseIdx < phases.length - 1 ? (
          <div className="mt-3 flex justify-end">
            <button onClick={handleAdvancePhase} className="text-xs bg-primary text-white px-3 py-1 rounded-md font-bold hover:opacity-90 transition-opacity">
              → Advance to {phases[currentPhaseIdx + 1]}
            </button>
          </div>
        ) : (
          <div className="mt-3 flex justify-end">
            <button onClick={handleCompleteProject} className="text-xs bg-emerald-600 text-white px-3 py-1 rounded-md font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Mark Project Completed
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-border bg-card shrink-0">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">

        {/* ══ OVERVIEW ══ */}
        {activeTab === "overview" && (
          <div className="p-4 space-y-4">
            {/* Metric cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Deliverables", value: `${tracker.deliverables?.filter((d:any) => d.status === "Approved").length}/${tracker.deliverables?.length || 0} done` },
                { label: "Milestones Paid", value: `${tracker.milestones?.filter((m:any) => m.paidAt).length}/${tracker.milestones?.length || 0}` },
                { label: "Total Revenue", value: `$${((tracker.milestones?.filter((m:any) => m.paidAt).reduce((s:number, m:any) => s + m.amount, 0) || 0) / 100).toFixed(0)}` },
                { label: "Updates", value: tracker.updates?.length || 0 },
              ].map(card => (
                <div key={card.label} className="bg-card border border-border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className="text-lg font-bold text-foreground">{card.value}</p>
                </div>
              ))}
            </div>
            {/* Recent audit entries */}
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Recent Activity</p>
              <div className="space-y-2">
                {tracker.auditLog?.slice(-5).reverse().map((entry: any, i: number) => (
                  <div key={i} className="text-xs border-l-2 border-primary/30 pl-3">
                    <p className="text-foreground font-medium">{entry.action}</p>
                    <p className="text-muted-foreground">{entry.actor} · {new Date(entry.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ DELIVERABLES ══ */}
        {activeTab === "deliverables" && (
          <div className="p-4 space-y-3">
            {tracker.deliverables?.map((d: any) => (
              <div key={d._id} className="bg-card border border-border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{d.title}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    d.status === "Approved"  ? "bg-green-500/10 text-green-500" :
                    d.status === "Rejected"  ? "bg-red-500/10 text-red-500" :
                    d.status === "InReview"  ? "bg-amber-500/10 text-amber-500" :
                                               "bg-muted text-muted-foreground"
                  }`}>{d.status}</span>
                </div>
                {d.clientRejectionNote && (
                  <p className="text-xs text-red-500 bg-red-500/10 p-2 rounded-md">
                    <strong>Client requested:</strong> {d.clientRejectionNote}
                  </p>
                )}
                {d.attachedUrl && (
                  <a href={d.attachedUrl} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <ExternalLink className="h-3 w-3" /> View Attached
                  </a>
                )}
                {(d.status === "Pending" || d.status === "Rejected") && (
                  <button onClick={() => handleCompleteDeliverable(d._id)}
                    className="w-full text-xs bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors py-1.5 rounded-md font-bold flex items-center gap-1 justify-center">
                    <CheckCircle2 className="h-3 w-3" /> Mark Ready for Client Review
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ══ MILESTONES ══ */}
        {activeTab === "milestones" && (
          <div className="p-4 space-y-3">
            {tracker.milestones?.map((m: any) => (
              <div key={m._id} className="bg-card border border-border rounded-lg p-4 flex justify-between items-start gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{m.title}</p>
                  <p className="text-lg font-bold">${(m.amount / 100).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Due: {new Date(m.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right shrink-0">
                  {m.paidAt ? (
                    <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full font-bold">✓ Paid</span>
                  ) : (
                    <button
                      onClick={() => handleMarkPayable(m._id, m.title)}
                      disabled={markingPayable === m._id}
                      className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-bold hover:opacity-90 disabled:opacity-60"
                    >
                      {markingPayable === m._id ? "Sending…" : "Send Payment Request"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ UPDATES ══ */}
        {activeTab === "updates" && (
          <div className="p-4 space-y-4">
            <form onSubmit={handlePostUpdate} className="bg-card border border-border rounded-lg p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Post Project Update</p>
              <select
                value={newUpdate.type}
                onChange={e => setNewUpdate({ ...newUpdate, type: e.target.value })}
                className="w-full text-sm p-2 rounded-lg border border-border bg-background"
              >
                <option value="ProgressUpdate">📊 Progress Update</option>
                <option value="Blocker">🚧 Blocker</option>
                <option value="MilestoneReached">🎯 Milestone Reached</option>
                <option value="ActionRequired">⚠️ Action Required (Client)</option>
              </select>
              <textarea
                value={newUpdate.body}
                onChange={e => setNewUpdate({ ...newUpdate, body: e.target.value })}
                placeholder="Describe the update for the client…"
                rows={3}
                className="w-full text-sm p-2 rounded-lg border border-border bg-background resize-none"
              />
              <input
                type="date"
                value={newUpdate.nextUpdateDue}
                onChange={e => setNewUpdate({ ...newUpdate, nextUpdateDue: e.target.value })}
                className="w-full text-sm p-2 rounded-lg border border-border bg-background"
                placeholder="Next update due (optional)"
              />
              <button type="submit" disabled={submitting || !newUpdate.body.trim()}
                className="w-full bg-primary text-white py-2 rounded-lg text-sm font-bold disabled:opacity-50">
                {submitting ? "Posting…" : "Post Update & Notify Client"}
              </button>
            </form>
            <div className="space-y-3">
              {tracker.updates?.map((u: any) => (
                <div key={u._id} className="border-l-2 border-primary/40 pl-3 py-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">{u.type}</span>
                    {u.clientAcknowledgedAt && <span className="text-[10px] text-green-500">✓ Client acknowledged</span>}
                  </div>
                  <p className="text-sm">{u.body}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(u.postedAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ FILES ══ */}
        {activeTab === "files" && (
          <div className="p-4 space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center space-y-3">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Upload a file to share with the client</p>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload}
                accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip" />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-60"
              >
                {uploadingFile ? "Uploading…" : "Choose File"}
              </button>
            </div>
            <div className="space-y-2">
              {tracker.files?.map((f: any) => (
                <div key={f._id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{f.filename}</p>
                    <p className="text-xs text-muted-foreground">{new Date(f.uploadedAt).toLocaleDateString()}</p>
                    {f.clientComment && <p className="text-xs text-amber-500 mt-1">Client: "{f.clientComment}"</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      f.approvalStatus === "Approved" ? "bg-green-500/10 text-green-500" :
                      f.approvalStatus === "Rejected" ? "bg-red-500/10 text-red-500" :
                                                         "bg-amber-500/10 text-amber-500"
                    }`}>{f.approvalStatus}</span>
                    <a href={f.cloudinaryUrl} target="_blank" rel="noreferrer"
                      className="text-primary hover:underline text-xs flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ CHAT ══ */}
        {activeTab === "chat" && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
              {!tracker.messages?.length && (
                <p className="text-xs text-muted-foreground text-center py-8">No messages yet.</p>
              )}
              {tracker.messages?.map((msg: any, i: number) => {
                const isAdmin = msg.sender === "Admin";
                return (
                  <div key={i} className={`flex flex-col max-w-[85%] ${isAdmin ? "self-end items-end ml-auto" : "self-start items-start"}`}>
                    <div className={`px-3 py-2 rounded-xl text-sm ${isAdmin ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendChat} className="p-3 border-t border-border flex gap-2">
              <input type="text" value={chatMessage} onChange={e => setChatMessage(e.target.value)}
                placeholder="Message client…"
                className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              <button type="submit" disabled={!chatMessage.trim()}
                className="bg-primary text-white p-2 rounded-lg disabled:opacity-50">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        {/* ══ AUDIT LOG ══ */}
        {activeTab === "audit" && (
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Immutable Audit Trail</p>
              <button onClick={fetchAuditLog} className="text-xs text-primary hover:underline">Refresh</button>
            </div>
            {auditLog.map((entry: any, i: number) => (
              <div key={i} className="flex gap-3 text-xs border-l-2 border-muted pl-3 pb-3">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{entry.action}</p>
                  <div className="flex items-center gap-2 text-muted-foreground mt-0.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      entry.actorRole === "Admin" ? "bg-blue-500/10 text-blue-500" :
                      entry.actorRole === "Client" ? "bg-purple-500/10 text-purple-500" :
                      "bg-muted text-muted-foreground"
                    }`}>{entry.actorRole}</span>
                    <span>{entry.actor}</span>
                    <span>·</span>
                    <span>{new Date(entry.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminProjectHub;
