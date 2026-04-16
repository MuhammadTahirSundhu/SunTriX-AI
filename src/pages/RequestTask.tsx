import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle, Upload, Shield, Clock, Users } from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "@/hooks/use-toast";
import { apiRequest, ENDPOINTS } from "@/lib/api";

const steps = ["About You", "Project Brief", "Technical Details", "Review & Submit"];

const RequestTask = () => {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "", role: "",
    projectTitle: "", projectType: "", description: "", startDate: "", duration: "", budget: "", priority: "Medium",
    techStack: "", existingCode: "No", codeDetails: "", integrations: "",
    notes: "", consent: false,
  });

  const updateField = (field: string, value: string | boolean) => setForm({ ...form, [field]: value });

  const handleSubmit = async () => {
    setSubmitting(true);
    const { error } = await apiRequest(ENDPOINTS.TASK_REQUEST_SUBMIT, {
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
        notes: form.notes,
      },
    });
    setSubmitting(false);
    if (!error) {
      toast({ title: "Task submitted!", description: "We'll send you a proposal within 24 hours." });
      setStep(0);
      setForm({ name: "", email: "", phone: "", company: "", role: "", projectTitle: "", projectType: "", description: "", startDate: "", duration: "", budget: "", priority: "Medium", techStack: "", existingCode: "No", codeDetails: "", integrations: "", notes: "", consent: false });
    } else {
      toast({ title: "Submission failed", description: error, variant: "destructive" });
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

  return (
    <Layout>
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-8 pt-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block text-xs font-mono text-primary uppercase tracking-widest mb-4">Request a Task</span>
            <h1 className="text-3xl lg:text-5xl font-extrabold mb-4">
              Tell Us What You <span className="gradient-text">Need</span>
            </h1>
            <p className="text-muted-foreground">Fill in the details and we'll send you a proposal within 24 hours.</p>
          </motion.div>

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
                          <div><label className={labelClass}>Full Name *</label><input type="text" value={form.name} onChange={(e) => updateField("name", e.target.value)} className={inputClass} placeholder="John Doe" /></div>
                          <div><label className={labelClass}>Email *</label><input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} className={inputClass} placeholder="john@company.com" /></div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                          <div><label className={labelClass}>Phone</label><input type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className={inputClass} placeholder="+1 (555) 123-4567" /></div>
                          <div><label className={labelClass}>Company</label><input type="text" value={form.company} onChange={(e) => updateField("company", e.target.value)} className={inputClass} placeholder="Acme Inc." /></div>
                        </div>
                        <div>
                          <label className={labelClass}>Your Role</label>
                          <select value={form.role} onChange={(e) => updateField("role", e.target.value)} className={inputClass}>
                            <option value="">Select role...</option>
                            <option>CTO</option><option>Product Manager</option><option>Dev Lead</option><option>Founder</option><option>Other</option>
                          </select>
                        </div>
                      </>
                    )}
                    {step === 1 && (
                      <>
                        <div><label className={labelClass}>Project Title *</label><input type="text" value={form.projectTitle} onChange={(e) => updateField("projectTitle", e.target.value)} className={inputClass} placeholder="AI-powered analytics dashboard" /></div>
                        <div>
                          <label className={labelClass}>Project Type *</label>
                          <select value={form.projectType} onChange={(e) => updateField("projectType", e.target.value)} className={inputClass}>
                            <option value="">Select type...</option>
                            <option>Agentic AI & Automation</option><option>AI & Machine Learning</option><option>Computer Vision</option><option>AI Product / SaaS</option><option>Dedicated Team</option><option>Other</option>
                          </select>
                        </div>
                        <div><label className={labelClass}>Description * (min 20 chars)</label><textarea rows={4} value={form.description} onChange={(e) => updateField("description", e.target.value)} className={`${inputClass} resize-none`} placeholder="Describe your project goals, requirements, and expected outcomes..." /></div>
                        <div className="grid sm:grid-cols-2 gap-6">
                          <div><label className={labelClass}>Preferred Start</label><input type="date" value={form.startDate} onChange={(e) => updateField("startDate", e.target.value)} className={inputClass} /></div>
                          <div>
                            <label className={labelClass}>Budget Range</label>
                            <select value={form.budget} onChange={(e) => updateField("budget", e.target.value)} className={inputClass}>
                              <option value="">Select budget...</option>
                              <option>{"< $5,000"}</option><option>$5,000 - $25,000</option><option>$25,000 - $100,000</option><option>$100,000+</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Priority *</label>
                          <div className="flex gap-3">
                            {["Low", "Medium", "High", "Critical"].map((p) => (
                              <button key={p} type="button" onClick={() => updateField("priority", p)}
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
                        <div><label className={labelClass}>Preferred Tech Stack</label><input type="text" value={form.techStack} onChange={(e) => updateField("techStack", e.target.value)} className={inputClass} placeholder="e.g., Python, React, AWS..." /></div>
                        <div>
                          <label className={labelClass}>Existing Codebase? *</label>
                          <div className="flex gap-3">
                            {["Yes", "No"].map((v) => (
                              <button key={v} type="button" onClick={() => updateField("existingCode", v)}
                                className={`rounded-lg border px-6 py-2 text-sm font-medium transition-colors ${form.existingCode === v ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>
                        {form.existingCode === "Yes" && (
                          <div><label className={labelClass}>Codebase Details</label><textarea rows={3} value={form.codeDetails} onChange={(e) => updateField("codeDetails", e.target.value)} className={`${inputClass} resize-none`} placeholder="Describe your current tech stack and codebase..." /></div>
                        )}
                        <div><label className={labelClass}>Integration Needs</label><textarea rows={3} value={form.integrations} onChange={(e) => updateField("integrations", e.target.value)} className={`${inputClass} resize-none`} placeholder="APIs, databases, third-party services..." /></div>
                        <div className="rounded-lg border border-dashed border-border bg-muted/50 p-8 text-center">
                          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">Drag & drop files or click to upload</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">PDF, DOCX, PNG, XLSX — max 25MB</p>
                        </div>
                      </>
                    )}
                    {step === 3 && (
                      <>
                        <div className="rounded-xl border border-border bg-muted/30 p-6 space-y-3">
                          <h3 className="font-bold text-foreground">Review Your Submission</h3>
                          {form.name && <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">Name:</span> {form.name}</p>}
                          {form.email && <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">Email:</span> {form.email}</p>}
                          {form.company && <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">Company:</span> {form.company}</p>}
                          {form.projectTitle && <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">Project:</span> {form.projectTitle}</p>}
                          {form.projectType && <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">Type:</span> {form.projectType}</p>}
                          {form.budget && <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">Budget:</span> {form.budget}</p>}
                          {form.priority && <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">Priority:</span> {form.priority}</p>}
                          {form.description && <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">Description:</span> {form.description}</p>}
                        </div>
                        <div><label className={labelClass}>Additional Notes</label><textarea rows={3} value={form.notes} onChange={(e) => updateField("notes", e.target.value)} className={`${inputClass} resize-none`} placeholder="Anything else we should know..." /></div>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input type="checkbox" checked={form.consent} onChange={(e) => updateField("consent", e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-border bg-surface2 accent-primary" />
                          <span className="text-sm text-muted-foreground">I agree to SunTriX's privacy policy and consent to being contacted regarding this project submission. *</span>
                        </label>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="flex justify-between mt-8 pt-6 border-t border-border">
                  <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  {step < 3 ? (
                    <button onClick={() => setStep(step + 1)} disabled={!canNext()}
                      className="gradient-bg inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 hover:opacity-90 transition-opacity">
                      Next <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button onClick={handleSubmit} disabled={!form.consent || submitting}
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
