import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import { Plus, Trash2, Edit2, Check, X, Star, DollarSign } from "lucide-react";
import AIAssistPanel from "@/components/admin/AIAssistPanel";

interface PricingPlan {
  _id: string;
  name: string;
  price: number;
  currency: string;
  billingPeriod: "monthly" | "yearly" | "one-time";
  description: string;
  features: string[];
  isPopular: boolean;
  isVisible: boolean;
  ctaLabel: string;
  ctaLink: string;
}

const empty: Omit<PricingPlan, "_id"> = {
  name: "", price: 0, currency: "USD", billingPeriod: "monthly",
  description: "", features: [""], isPopular: false, isVisible: true,
  ctaLabel: "Get Started", ctaLink: "/contact",
};

const AdminPricing = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PricingPlan | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [aiMode, setAiMode] = useState(false);

  const fetch_ = async () => {
    setLoading(true);
    const { data } = await apiRequest<{ plans: PricingPlan[] }>(ENDPOINTS.PRICING_LIST);
    if (data?.plans) setPlans(data.plans);
    setLoading(false);
  };

  useEffect(() => { fetch_(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setAiMode(false); setShowForm(true); };
  const openEdit = (p: PricingPlan) => {
    setEditing(p);
    setForm({ name: p.name, price: p.price, currency: p.currency, billingPeriod: p.billingPeriod, description: p.description, features: p.features.length ? p.features : [""], isPopular: p.isPopular, isVisible: p.isVisible, ctaLabel: p.ctaLabel, ctaLink: p.ctaLink });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, features: form.features.filter(f => f.trim()) };
    if (editing) await apiRequest(ENDPOINTS.PRICING_UPDATE(editing._id), { method: "PUT", body: payload });
    else await apiRequest(ENDPOINTS.PRICING_CREATE, { method: "POST", body: payload });
    setSaving(false);
    setShowForm(false);
    fetch_();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this plan?")) return;
    await apiRequest(ENDPOINTS.PRICING_DELETE(id), { method: "DELETE" });
    fetch_();
  };

  const addFeature = () => setForm({ ...form, features: [...form.features, ""] });
  const updateFeature = (i: number, v: string) => { const f = [...form.features]; f[i] = v; setForm({ ...form, features: f }); };
  const removeFeature = (i: number) => setForm({ ...form, features: form.features.filter((_, idx) => idx !== i) });

  const billingLabel: Record<string, string> = { monthly: "/mo", yearly: "/yr", "one-time": " one-time" };

  const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary";
  const Toggle = ({ val, set }: { val: boolean; set: () => void }) => (
    <button type="button" onClick={set} className={`relative h-6 w-11 rounded-full transition-colors ${val ? "bg-primary" : "bg-muted"}`}>
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${val ? "left-6" : "left-1"}`} />
    </button>
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Pricing Plans</h1>
          <p className="text-sm text-muted-foreground">Manage service pricing</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { openCreate(); setAiMode(true); }}
            className="inline-flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 text-sm font-semibold text-purple-400 hover:bg-purple-500/20 transition-colors"
          >
            <span>✨</span> Add via AI
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="h-4 w-4" /> Add Manually
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium mb-4">No pricing plans yet</p>
          <button onClick={openCreate} className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90">Add Plan</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <motion.div key={plan._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`relative bg-card rounded-2xl border p-6 flex flex-col ${plan.isPopular ? "border-primary shadow-lg shadow-primary/10" : "border-border"}`}>
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" /> Most Popular
                  </span>
                </div>
              )}
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${plan.isVisible ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-muted text-muted-foreground border-border"}`}>
                  {plan.isVisible ? "Live" : "Hidden"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-display font-bold text-foreground">${plan.price}</span>
                <span className="text-muted-foreground text-sm">{billingLabel[plan.billingPeriod]}</span>
              </div>
              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 pt-4 border-t border-border">
                <button onClick={() => openEdit(plan)} className="flex-1 text-sm border border-border rounded-lg py-2 hover:bg-muted transition-colors text-foreground flex items-center justify-center gap-2">
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>
                <button onClick={() => handleDelete(plan._id)} className="p-2 rounded-lg border border-border hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive text-muted-foreground transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-lg font-bold text-foreground">{editing ? "Edit Plan" : "New Plan"}</h2>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"><X className="h-5 w-5" /></button>
              </div>
              <div className="px-6 pt-4">
                <div className="flex rounded-lg border border-border bg-muted/30 p-0.5 mb-4">
                  <button type="button" onClick={() => setAiMode(true)}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-all ${
                      aiMode ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}>
                    ✨ AI-Assisted
                  </button>
                  <button type="button" onClick={() => setAiMode(false)}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-all ${
                      !aiMode ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}>
                    📝 Manual
                  </button>
                </div>
                {aiMode && (
                  <div className="mb-4">
                    <AIAssistPanel
                      module="pricing"
                      onExtracted={(fields) => {
                        const f = fields as Partial<typeof form>;
                        // features array needs to be non-empty strings
                        if (Array.isArray(f.features) && f.features.length > 0) {
                          setForm((prev) => ({ ...prev, ...f, features: f.features as string[] }));
                        } else {
                          setForm((prev) => ({ ...prev, ...f }));
                        }
                        setAiMode(false);
                      }}
                    />
                  </div>
                )}
              </div>
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Plan Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Starter" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Price *</label>
                    <input required type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Currency</label>
                    <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={inputCls}>
                      <option>USD</option><option>EUR</option><option>GBP</option><option>PKR</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Billing Period</label>
                  <select value={form.billingPeriod} onChange={(e) => setForm({ ...form, billingPeriod: e.target.value as any })} className={inputCls}>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="one-time">One-Time</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={`${inputCls} resize-none`} placeholder="Best for small teams..." />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-muted-foreground">Features</label>
                    <button type="button" onClick={addFeature} className="text-xs text-primary hover:underline">+ Add</button>
                  </div>
                  <div className="space-y-2">
                    {form.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <input value={f} onChange={(e) => updateFeature(i, e.target.value)} className={inputCls} placeholder="Feature..." />
                        {form.features.length > 1 && (
                          <button type="button" onClick={() => removeFeature(i)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">CTA Label</label>
                    <input value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">CTA Link</label>
                    <input value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} className={inputCls} />
                  </div>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Toggle val={form.isPopular} set={() => setForm({ ...form, isPopular: !form.isPopular })} />
                    <span className="text-sm font-medium text-foreground">Mark as Popular</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Toggle val={form.isVisible} set={() => setForm({ ...form, isVisible: !form.isVisible })} />
                    <span className="text-sm font-medium text-foreground">Visible on website</span>
                  </label>
                </div>
                <button type="submit" disabled={saving} className="w-full bg-primary text-primary-foreground rounded-lg py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity">
                  {saving ? "Saving..." : editing ? "Update Plan" : "Create Plan"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPricing;
