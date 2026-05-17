import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, Clock, RefreshCw, Plus, Search,
  ExternalLink, RotateCcw, Copy, Check, Loader2, FileText, Link2
} from "lucide-react";
import { apiRequest, ENDPOINTS } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────
interface Payment {
  _id: string;
  type: "subscription" | "invoice" | "retainer";
  status: "pending" | "paid" | "failed" | "refunded" | "cancelled";
  amount: number;
  currency: string;
  clientEmail: string;
  clientName: string;
  description: string;
  invoiceToken?: string;
  stripeSessionId?: string;
  paidAt?: string;
  createdAt: string;
  taskRequestId?: { projectTitle: string; name: string };
  planId?: { name: string };
}

interface Stats {
  totalRevenueCents: number;
  pendingCount: number;
  refundedCents: number;
  thisMonthCents: number;
}

interface TaskOption { _id: string; projectTitle: string; name: string; email: string; }

// ─── Helpers ──────────────────────────────────────────────────────
const fmt = (cents: number, cur = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: cur.toUpperCase() }).format(cents / 100);

const statusColor: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  failed: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  refunded: "bg-violet-500/10 text-violet-400 border-violet-500/30",
  cancelled: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
};

// ─── Sub-components ───────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color }: any) => (
  <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-extrabold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  </div>
);

const Badge = ({ status }: { status: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColor[status] || statusColor.cancelled}`}>
    {status}
  </span>
);

// ─── Create Invoice Modal ─────────────────────────────────────────
const CreateInvoiceModal = ({ tasks, onClose, onCreated }: {
  tasks: TaskOption[]; onClose: () => void; onCreated: (url: string) => void;
}) => {
  const [form, setForm] = useState({ clientEmail: "", clientName: "", amountUSD: "", description: "", taskRequestId: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleTaskSelect = (id: string) => {
    const t = tasks.find(t => t._id === id);
    if (t) { set("taskRequestId", id); set("clientEmail", t.email); set("clientName", t.name); set("description", t.projectTitle || ""); }
    else set("taskRequestId", "");
  };

  const submit = async () => {
    if (!form.clientEmail || !form.amountUSD || !form.description) { setErr("Email, amount, and description are required."); return; }
    setLoading(true); setErr("");
    const { data, error } = await apiRequest<{ invoiceUrl: string }>(ENDPOINTS.PAYMENT_ADMIN_CREATE_INVOICE, {
      method: "POST", body: { ...form, amountUSD: Number(form.amountUSD) },
    });
    setLoading(false);
    if (error || !data) { setErr(error || "Failed to create invoice."); return; }
    onCreated(data.invoiceUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="font-bold text-foreground flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Create Invoice</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
        </div>
        <div className="p-6 space-y-4">
          {tasks.length > 0 && (
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Link to Task Request (optional)</label>
              <select value={form.taskRequestId} onChange={e => handleTaskSelect(e.target.value)}
                className="w-full rounded-xl bg-muted/30 border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="">— Select task —</option>
                {tasks.map(t => <option key={t._id} value={t._id}>{t.projectTitle || t.name} ({t.email})</option>)}
              </select>
            </div>
          )}
          {(["clientName:Client Name:text", "clientEmail:Client Email:email", "amountUSD:Amount (USD):number", "description:Description:text"] as const).map(raw => {
            const [key, label, type] = raw.split(":") as [string, string, string];
            return (
              <div key={key}>
                <label className="text-xs text-muted-foreground mb-1.5 block">{label}</label>
                <input type={type} value={(form as any)[key]} onChange={e => set(key, e.target.value)}
                  placeholder={label} min={type === "number" ? 1 : undefined}
                  className="w-full rounded-xl bg-muted/30 border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            );
          })}
          {err && <p className="text-xs text-destructive">{err}</p>}
          <button onClick={submit} disabled={loading}
            className="w-full gradient-bg rounded-xl py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Generate Invoice
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Payment Link Modal ───────────────────────────────────────────
const CreateLinkModal = ({ onClose, onCreated }: { onClose: () => void; onCreated: (url: string) => void }) => {
  const [form, setForm] = useState({ clientEmail: "", clientName: "", amountUSD: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.clientEmail || !form.amountUSD || !form.description) { setErr("All fields are required."); return; }
    setLoading(true); setErr("");
    const { data, error } = await apiRequest<{ paymentLinkUrl: string }>(ENDPOINTS.PAYMENT_ADMIN_CREATE_LINK, {
      method: "POST", body: { ...form, amountUSD: Number(form.amountUSD) },
    });
    setLoading(false);
    if (error || !data) { setErr(error || "Failed."); return; }
    onCreated(data.paymentLinkUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="font-bold text-foreground flex items-center gap-2"><Link2 className="h-4 w-4 text-primary" /> Quick Payment Link</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
        </div>
        <div className="p-6 space-y-4">
          {(["clientName:Client Name:text", "clientEmail:Client Email:email", "amountUSD:Amount (USD):number", "description:Description:text"] as const).map(raw => {
            const [key, label, type] = raw.split(":") as [string, string, string];
            return (
              <div key={key}>
                <label className="text-xs text-muted-foreground mb-1.5 block">{label}</label>
                <input type={type} value={(form as any)[key]} onChange={e => set(key, e.target.value)}
                  placeholder={label}
                  className="w-full rounded-xl bg-muted/30 border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            );
          })}
          {err && <p className="text-xs text-destructive">{err}</p>}
          <button onClick={submit} disabled={loading}
            className="w-full gradient-bg rounded-xl py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
            Create Payment Link
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Refund Modal ─────────────────────────────────────────────────
const RefundModal = ({ payment, onClose, onRefunded }: { payment: Payment; onClose: () => void; onRefunded: () => void }) => {
  const [reason, setReason] = useState("");
  const [partial, setPartial] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    setLoading(true); setErr("");
    const body: any = { reason };
    if (partial && amount) body.amountUSD = Number(amount);
    const { error } = await apiRequest(ENDPOINTS.PAYMENT_ADMIN_REFUND(payment._id), {
      method: "POST", body,
    });
    setLoading(false);
    if (error) { setErr(error); return; }
    onRefunded();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm rounded-2xl border border-destructive/30 bg-card shadow-2xl">
        <div className="p-6 border-b border-border">
          <h3 className="font-bold text-foreground">Issue Refund</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {payment.clientName} · {fmt(payment.amount, payment.currency)}
          </p>
        </div>
        <div className="p-6 space-y-4">
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <input type="checkbox" checked={partial} onChange={e => setPartial(e.target.checked)} className="rounded" />
            Partial refund
          </label>
          {partial && (
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="Amount in USD" min={1}
              className="w-full rounded-xl bg-muted/30 border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          )}
          <input value={reason} onChange={e => setReason(e.target.value)}
            placeholder="Reason (optional)"
            className="w-full rounded-xl bg-muted/30 border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          {err && <p className="text-xs text-destructive">{err}</p>}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-muted/30 transition-colors">Cancel</button>
            <button onClick={submit} disabled={loading}
              className="flex-1 bg-rose-500 rounded-xl py-2.5 text-sm font-bold text-white hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
              Refund
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Copy Button ──────────────────────────────────────────────────
const CopyBtn = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <button onClick={copy} className="text-muted-foreground hover:text-primary transition-colors" title="Copy link">
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
};

// ─── Main Component ───────────────────────────────────────────────
const AdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tasks, setTasks] = useState<TaskOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.append("status", filterStatus);
    if (filterType) params.append("type", filterType);

    const [paymentsRes, statsRes, tasksRes] = await Promise.all([
      apiRequest<{ payments: Payment[]; total: number }>(`${ENDPOINTS.PAYMENT_ADMIN_LIST}?${params}`),
      apiRequest<Stats>(ENDPOINTS.PAYMENT_ADMIN_STATS),
      apiRequest<{ requests: TaskOption[] }>(ENDPOINTS.ADMIN_TASKS),
    ]);

    if (paymentsRes.data) setPayments(paymentsRes.data.payments);
    if (statsRes.data) setStats(statsRes.data);
    if (tasksRes.data?.requests) setTasks(tasksRes.data.requests);
    setLoading(false);
  }, [filterStatus, filterType]);

  useEffect(() => { load(); }, [load]);

  const filtered = payments.filter(p =>
    !search || p.clientEmail.includes(search.toLowerCase()) || p.clientName.toLowerCase().includes(search.toLowerCase())
  );

  const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">Payments</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage invoices, transactions & refunds</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowLink(true)}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-muted/30 transition-colors">
            <Link2 className="h-4 w-4" /> Quick Link
          </button>
          <button onClick={() => setShowInvoice(true)}
            className="flex items-center gap-2 gradient-bg rounded-xl px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" /> Create Invoice
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={DollarSign} label="Total Revenue" value={fmt(stats.totalRevenueCents)} color="bg-emerald-500/10 text-emerald-400" />
          <StatCard icon={TrendingUp} label="This Month" value={fmt(stats.thisMonthCents)} color="bg-blue-500/10 text-blue-400" />
          <StatCard icon={Clock} label="Pending" value={stats.pendingCount} sub="awaiting payment" color="bg-amber-500/10 text-amber-400" />
          <StatCard icon={RefreshCw} label="Refunded" value={fmt(stats.refundedCents)} color="bg-violet-500/10 text-violet-400" />
        </div>
      )}

      {/* Generated URL toast */}
      {generatedUrl && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-emerald-400 mb-1">✅ Link generated — share with client</p>
            <p className="text-xs text-muted-foreground font-mono truncate">{generatedUrl}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <CopyBtn text={generatedUrl} />
            <a href={generatedUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button onClick={() => setGeneratedUrl("")} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/30 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="rounded-xl bg-muted/30 border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
          <option value="">All Statuses</option>
          {["pending", "paid", "failed", "refunded", "cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="rounded-xl bg-muted/30 border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
          <option value="">All Types</option>
          {["subscription", "invoice", "retainer"].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={load} className="rounded-xl border border-border px-3 py-2.5 hover:bg-muted/30 transition-colors">
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">No payments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {["Client", "Description", "Amount", "Type", "Status", "Date", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{p.clientName || "—"}</p>
                      <p className="text-xs text-muted-foreground">{p.clientEmail}</p>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="truncate text-foreground">{p.description}</p>
                      {p.taskRequestId?.projectTitle && <p className="text-xs text-muted-foreground truncate">{p.taskRequestId.projectTitle}</p>}
                    </td>
                    <td className="px-4 py-3 font-bold text-foreground whitespace-nowrap">{fmt(p.amount, p.currency)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs capitalize text-muted-foreground">{p.type}</span>
                    </td>
                    <td className="px-4 py-3"><Badge status={p.status} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {p.invoiceToken && (
                          <CopyBtn text={`${APP_URL}/invoice/${p.invoiceToken}`} />
                        )}
                        {p.status === "paid" && (
                          <button onClick={() => setRefundTarget(p)}
                            className="text-muted-foreground hover:text-rose-400 transition-colors" title="Refund">
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showInvoice && (
        <CreateInvoiceModal tasks={tasks} onClose={() => setShowInvoice(false)}
          onCreated={url => { setShowInvoice(false); setGeneratedUrl(url); }} />
      )}
      {showLink && (
        <CreateLinkModal onClose={() => setShowLink(false)}
          onCreated={url => { setShowLink(false); setGeneratedUrl(url); }} />
      )}
      {refundTarget && (
        <RefundModal payment={refundTarget} onClose={() => setRefundTarget(null)}
          onRefunded={() => { setRefundTarget(null); load(); }} />
      )}
    </div>
  );
};

export default AdminPayments;
