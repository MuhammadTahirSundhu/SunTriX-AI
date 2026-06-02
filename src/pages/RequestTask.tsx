import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, CheckCircle, Shield, Clock, Users, Sparkles, Tag } from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "@/hooks/use-toast";
import { apiRequest, ENDPOINTS } from "@/lib/api";

const steps = ["About You", "Project Brief", "Technical Details", "Review & Submit"];

// Maps a plan's raw price to the closest budget option label
function getPlanBudgetLabel(price: number): string {
  if (price === 0) return "";
  if (price < 5000)   return "< $5,000";
  if (price < 25000)  return "$5,000 - $25,000";
  if (price < 100000) return "$25,000 - $100,000";
  return "$100,000+";
}

const RequestTask = () => {
  const [searchParams] = useSearchParams();
  // Dynamic plan — whatever the admin has configured in /admin/pricing
  // No plan names hardcoded here. URL params carry the plan name + price as-is.
  const selectedPlanName  = searchParams.get("plan")   || "";
  const selectedPlanPrice = Number(searchParams.get("budget") || "0");

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [trackingToken, setTrackingToken] = useState("");

  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "", role: "",
    projectTitle: "", projectType: "", description: "", startDate: "", duration: "",
    // Pre-fill budget from URL param (closest tier) — fully dynamic, never hardcoded
    budget: getPlanBudgetLabel(selectedPlanPrice),
    priority: "Medium",
    techStack: "", existingCode: "No", codeDetails: "", integrations: "",
    notes: "", consent: false, projectLink: "",
  });

  const updateField = (field: string, value: string | boolean) => setForm({ ...form, [field]: value });

  const handleSubmit = async () => {
    setSubmitting(true);
    const { data, error } = await apiRequest<{ trackingToken: string }>(ENDPOINTS.TASK_REQUEST_SUBMIT, {
      method: "POST",
      body: {
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        role: form.role,
        projectTitle: form.projectTitle,
        service: form.projectType,
        budget: form.budget,
        timeline: form.startDate,
        description: form.description,
        priority: form.priority,
        techStack: form.techStack,
        existingCode: form.existingCode,
        codeDetails: form.codeDetails,
        integrations: form.integrations,
        notes: form.projectLink ? `${form.notes}\n\nProject Link: ${form.projectLink}` : form.notes,
        // Dynamic plan data — passed through exactly as received from URL
        selectedPlan: selectedPlanName,
        planBudget:   selectedPlanPrice,
      },
    });
    setSubmitting(false);
    if (!error && data) {
      setTrackingToken(data.trackingToken || "");
      setSubmitted(true);
    } else {
      toast({ title: "Submission failed", description: error || "Please try again.", variant: "destructive" });
    }
  };

  const canNext = () => {
    if (step === 0) return form.name && form.email;
    if (step === 1) return form.projectTitle && form.projectType && form.description.length >= 20 && form.priority;
    if (step === 2) return form.existingCode;
    if (step === 3) return form.consent;
    return true;
  };

  const inputClass = "w-full rounded-lg border border-border bg-surface2 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";
  const labelClass = "block text-sm font-medium text-foreground mb-2";

  // ── Success State ──────────────────────────────────────────────
  if (submitted) {
    return (
      <Layout>
        <section className="min-h-screen flex items-center justify-center pt-32 pb-20 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg w-full text-center"
          >
            <div className="rounded-2xl border border-emerald-500/30 bg-card p-10 shadow-xl">
              <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-extrabold text-foreground mb-3">Request Submitted!</h1>
              <p className="text-muted-foreground mb-6">
                Thank you! We've received your project brief and will review it shortly.
                You'll receive a personalized proposal within <strong className="text-foreground">24 hours</strong>.
              </p>
              {trackingToken && (
                <div className="bg-muted/30 rounded-xl p-4 border border-border mb-6 text-left">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Your Tracking ID</p>
                  <p className="font-mono text-sm text-primary break-all">{trackingToken}</p>
                  <p className="text-xs text-muted-foreground mt-2">Save this to track your project status at any time.</p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {trackingToken && (
                  <Link
                    to={`/track/${trackingToken}`}
                    className="gradient-bg rounded-xl px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    Track My Request →
                  </Link>
                )}
                <Link
                  to="/"
                  className="rounded-xl border border-border px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-8 pt-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block text-xs font-mono text-primary uppercase tracking-widest mb-4">Request a Task</span>
            <h1 className="text-3xl lg:text-5xl font-extrabold mb-4">
              Tell Us What You <span className="gradient-text">Need</span>
            </h1>
            <p className="text-muted-foreground">Fill in the details and we'll send you a custom proposal within 24 hours.</p>
          </motion.div>

          {/* Dynamic Plan Banner — shows only if user came from /pricing with a plan selected */}
          {selectedPlanName && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto mb-8"
            >
              <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-5 py-4">
                <div className="h-9 w-9 rounded-lg gradient-bg flex items-center justify-center shrink-0">
                  <Tag className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Selected Plan</p>
                  <p className="text-foreground font-bold text-sm truncate">
                    {selectedPlanName}
                    {selectedPlanPrice > 0 && (
                      <span className="ml-2 text-primary font-extrabold">
                        — Starting at ${selectedPlanPrice.toLocaleString()}
                      </span>
                    )}
                  </p>
                </div>
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
              </div>
            </motion.div>
          )}

          {/* Progress */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="flex items-center justify-between">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center">
                  <div className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-colors ${i <= step ? "gradient-bg text-primary-foreground" : "border border-border text-muted-foreground"}`}>
                    {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`ml-2 text-xs font-medium hidden sm:block ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
                  {i < steps.length - 1 && <div className={`mx-4 h-px w-8 sm:w-16 ${i < step ? "bg-primary" : "bg-border"}`} />}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-border bg-card p-8">
                <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    {step === 0 && (
                      <>
                        <div className="grid sm:grid-cols-2 gap-6">
                          <div><label className={labelClass}>Full Name *</label><input id="rt-name" type="text" value={form.name} onChange={(e) => updateField("name", e.target.value)} className={inputClass} placeholder="John Doe" /></div>
                          <div><label className={labelClass}>Email *</label><input id="rt-email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} className={inputClass} placeholder="john@company.com" /></div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                          <div><label className={labelClass}>Phone</label><input id="rt-phone" type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className={inputClass} placeholder="+1 (555) 123-4567" /></div>
                          <div><label className={labelClass}>Company</label><input id="rt-company" type="text" value={form.company} onChange={(e) => updateField("company", e.target.value)} className={inputClass} placeholder="Acme Inc." /></div>
                        </div>
                        <div>
                          <label className={labelClass}>Your Role</label>
                          <select id="rt-role" value={form.role} onChange={(e) => updateField("role", e.target.value)} className={inputClass}>
                            <option value="">Select role...</option>
                            <option>CTO</option><option>Product Manager</option><option>Dev Lead</option><option>Founder</option><option>Other</option>
                          </select>
                        </div>
                      </>
                    )}
                    {step === 1 && (
                      <>
                        <div><label className={labelClass}>Project Title *</label><input id="rt-project-title" type="text" value={form.projectTitle} onChange={(e) => updateField("projectTitle", e.target.value)} className={inputClass} placeholder="AI-powered analytics dashboard" /></div>
                        <div>
                          <label className={labelClass}>Project Type *</label>
                          <select id="rt-project-type" value={form.projectType} onChange={(e) => updateField("projectType", e.target.value)} className={inputClass}>
                            <option value="">Select type...</option>
                            <option>Agentic AI & Automation</option><option>AI & Machine Learning</option><option>Computer Vision</option><option>AI Product / SaaS</option><option>Dedicated Team</option><option>Other</option>
                          </select>
                        </div>
                        <div><label className={labelClass}>Description * (min 20 chars)</label><textarea id="rt-description" rows={4} value={form.description} onChange={(e) => updateField("description", e.target.value)} className={`${inputClass} resize-none`} placeholder="Describe your project goals, requirements, and expected outcomes..." /></div>
                        <div className="grid sm:grid-cols-2 gap-6">
                          <div><label className={labelClass}>Preferred Start</label><input id="rt-start-date" type="date" value={form.startDate} onChange={(e) => updateField("startDate", e.target.value)} className={inputClass} /></div>
                          <div>
                            <label className={labelClass}>
                              Budget Range
                              {selectedPlanName && <span className="ml-2 text-xs text-primary font-normal">(pre-filled from your plan)</span>}
                            </label>
                            <select id="rt-budget" value={form.budget} onChange={(e) => updateField("budget", e.target.value)} className={inputClass}>
                              <option value="">Select budget...</option>
                              <option>{"< $5,000"}</option>
                              <option>$5,000 - $25,000</option>
                              <option>$25,000 - $100,000</option>
                              <option>$100,000+</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Priority *</label>
                          <div className="flex gap-3">
                            {["Low", "Medium", "High", "Critical"].map((p) => (
                              <button key={p} id={`rt-priority-${p.toLowerCase()}`} type="button" onClick={() => updateField("priority", p)}
                                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${form.priority === p ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    {step === 2 && (
                      <>
                        <div><label className={labelClass}>Preferred Tech Stack</label><input id="rt-tech-stack" type="text" value={form.techStack} onChange={(e) => updateField("techStack", e.target.value)} className={inputClass} placeholder="e.g., Python, React, AWS..." /></div>
                        <div>
                          <label className={labelClass}>Existing Codebase? *</label>
                          <div className="flex gap-3">
                            {["Yes", "No"].map((v) => (
                              <button key={v} id={`rt-existing-code-${v.toLowerCase()}`} type="button" onClick={() => updateField("existingCode", v)}
                                className={`rounded-lg border px-6 py-2 text-sm font-medium transition-colors ${form.existingCode === v ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>
                        {form.existingCode === "Yes" && (
                          <div><label className={labelClass}>Codebase Details</label><textarea id="rt-code-details" rows={3} value={form.codeDetails} onChange={(e) => updateField("codeDetails", e.target.value)} className={`${inputClass} resize-none`} placeholder="Describe your current tech stack and codebase..." /></div>
                        )}
                        <div><label className={labelClass}>Integration Needs</label><textarea id="rt-integrations" rows={3} value={form.integrations} onChange={(e) => updateField("integrations", e.target.value)} className={`${inputClass} resize-none`} placeholder="APIs, databases, third-party services..." /></div>
                        <div>
                          <label className={labelClass}>Project Files / Assets Link (Optional)</label>
                          <input id="rt-project-link" type="text" value={form.projectLink} onChange={(e) => updateField("projectLink", e.target.value)} className={inputClass} placeholder="Google Drive, Figma, Dropbox, or GitHub link..." />
                          <p className="text-xs text-muted-foreground mt-1">Please ensure link sharing permissions are set to 'Anyone with the link'.</p>
                        </div>
                      </>
                    )}
                    {step === 3 && (
                      <>
                        <div className="rounded-xl border border-border bg-muted/30 p-6 space-y-3">
                          <h3 className="font-bold text-foreground">Review Your Submission</h3>
                          {selectedPlanName && (
                            <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-primary/5 border border-primary/20">
                              <Tag className="h-3.5 w-3.5 text-primary shrink-0" />
                              <p className="text-sm text-foreground font-medium">
                                <span className="text-primary">Plan:</span> {selectedPlanName}
                                {selectedPlanPrice > 0 && <span className="text-muted-foreground ml-1">(${selectedPlanPrice.toLocaleString()} starting)</span>}
                              </p>
                            </div>
                          )}
                          {form.name && <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">Name:</span> {form.name}</p>}
                          {form.email && <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">Email:</span> {form.email}</p>}
                          {form.company && <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">Company:</span> {form.company}</p>}
                          {form.projectTitle && <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">Project:</span> {form.projectTitle}</p>}
                          {form.projectType && <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">Type:</span> {form.projectType}</p>}
                          {form.budget && <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">Budget:</span> {form.budget}</p>}
                          {form.priority && <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">Priority:</span> {form.priority}</p>}
                          {form.description && <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">Description:</span> {form.description}</p>}
                        </div>
                        <div><label className={labelClass}>Additional Notes</label><textarea id="rt-notes" rows={3} value={form.notes} onChange={(e) => updateField("notes", e.target.value)} className={`${inputClass} resize-none`} placeholder="Anything else we should know..." /></div>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input id="rt-consent" type="checkbox" checked={form.consent} onChange={(e) => updateField("consent", e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-border bg-surface2 accent-primary" />
                          <span className="text-sm text-muted-foreground">I agree to SunTriX's privacy policy and consent to being contacted regarding this project submission. *</span>
                        </label>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="flex justify-between mt-8 pt-6 border-t border-border">
                  <button id="rt-back" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  {step < 3 ? (
                    <button id="rt-next" onClick={() => setStep(step + 1)} disabled={!canNext()}
                      className="gradient-bg inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 hover:opacity-90 transition-opacity">
                      Next <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button id="rt-submit" onClick={handleSubmit} disabled={!form.consent || submitting}
                      className="gradient-bg inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 hover:opacity-90 transition-opacity">
                      {submitting ? "Submitting…" : <><span>Submit Task</span> <CheckCircle className="h-4 w-4" /></>}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6 sticky top-24">
                <h3 className="font-bold text-foreground mb-4">Why SunTriX?</h3>
                <div className="space-y-4">
                  {[
                    { icon: Clock, title: "24-Hour Proposal", desc: "We respond with a detailed proposal within one business day." },
                    { icon: Shield, title: "NDA First", desc: "Your ideas are protected from the first conversation." },
                    { icon: Users, title: "Dedicated Team", desc: "Every project gets a dedicated team lead and engineer." },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <item.icon className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-border text-center">
                  <p className="text-xs text-muted-foreground">50+ teams currently building with us</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default RequestTask;
