import { useState, useEffect, useCallback } from "react";
import { ENDPOINTS, apiRequest } from "@/lib/api";
import { authStore } from "@/lib/store";
import {
  Bot, Mail, CreditCard, HardDrive, Building2, MessageSquare,
  Newspaper, Shield, Eye, EyeOff, Save, RefreshCw, CheckCircle2,
  AlertCircle, ChevronRight, Loader2, ToggleLeft, ToggleRight,
  Settings2, Lock, Info,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────
interface Setting {
  _id: string;
  key: string;
  value: string;
  section: string;
  label: string;
  description?: string;
  type: "text" | "password" | "toggle" | "number" | "textarea" | "url" | "select";
  options?: string[];
  isSecret: boolean;
}

type SectionId = "ai" | "email" | "payment" | "storage" | "brand" | "chatbot" | "newsletter" | "security";

// ─── Section metadata ─────────────────────────────────────────────────────
const SECTIONS: {
  id: SectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
  description: string;
}[] = [
  { id: "ai",         label: "AI & Groq",       icon: Bot,          color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/30", description: "Model selection, API keys and AI behaviour" },
  { id: "chatbot",    label: "Chatbot",          icon: MessageSquare,color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/30",   description: "Website chatbot prompt, links and toggles" },
  { id: "email",      label: "Email",            icon: Mail,         color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", description: "Resend key, sender address and notification toggles" },
  { id: "payment",    label: "Payments",         icon: CreditCard,   color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/30",  description: "Stripe keys, mode toggle and invoice settings" },
  { id: "storage",    label: "File Storage",     icon: HardDrive,    color: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/30",   description: "Cloudinary credentials and upload limits" },
  { id: "brand",      label: "Brand & Identity", icon: Building2,    color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/30",  description: "Company name, links and brand copy" },
  { id: "newsletter", label: "Newsletter",       icon: Newspaper,    color: "text-pink-400",   bg: "bg-pink-500/10",   border: "border-pink-500/30",   description: "Batch size, opt-in and footer text" },
  { id: "security",   label: "Security",         icon: Shield,       color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/30",    description: "JWT secret, session expiry and rate limits" },
];

// ─── Individual field component ────────────────────────────────────────────
function SettingField({
  setting,
  localValue,
  onChange,
}: {
  setting: Setting;
  localValue: string;
  onChange: (key: string, value: string) => void;
}) {
  const [showSecret, setShowSecret] = useState(false);
  const isModified = localValue !== setting.value;

  const baseInput =
    "w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/20 transition-all";

  if (setting.type === "toggle") {
    const isOn = localValue === "true";
    return (
      <button
        type="button"
        onClick={() => onChange(setting.key, isOn ? "false" : "true")}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm font-medium ${
          isOn
            ? "bg-green-500/10 border-green-500/40 text-green-400"
            : "bg-zinc-800/50 border-zinc-700 text-zinc-500"
        }`}
      >
        {isOn ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
        {isOn ? "Enabled" : "Disabled"}
      </button>
    );
  }

  if (setting.type === "select") {
    return (
      <select
        value={localValue}
        onChange={(e) => onChange(setting.key, e.target.value)}
        className={baseInput + " cursor-pointer"}
      >
        {setting.options?.map((opt) => (
          <option key={opt} value={opt} className="bg-zinc-900">
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (setting.type === "textarea") {
    return (
      <textarea
        value={localValue}
        onChange={(e) => onChange(setting.key, e.target.value)}
        rows={5}
        className={baseInput + " resize-y font-mono text-xs leading-relaxed"}
        placeholder={setting.isSecret ? "Enter value…" : `Enter ${setting.label.toLowerCase()}…`}
      />
    );
  }

  if (setting.type === "password") {
    return (
      <div className="relative">
        <input
          type={showSecret ? "text" : "password"}
          value={localValue === "••••••••••••" ? "" : localValue}
          onChange={(e) => onChange(setting.key, e.target.value)}
          placeholder={localValue === "••••••••••••" ? "Leave blank to keep current value" : "Enter new value…"}
          className={baseInput + " pr-10 font-mono"}
        />
        <button
          type="button"
          onClick={() => setShowSecret(!showSecret)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
        {isModified && localValue !== "" && (
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-500" />
        )}
      </div>
    );
  }

  // text / url / number
  return (
    <div className="relative">
      <input
        type={setting.type === "number" ? "number" : "text"}
        value={localValue}
        onChange={(e) => onChange(setting.key, e.target.value)}
        placeholder={`Enter ${setting.label.toLowerCase()}…`}
        step={setting.type === "number" ? "0.1" : undefined}
        className={baseInput + (isModified ? " border-orange-500/50" : "")}
      />
      {isModified && (
        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-500" />
      )}
    </div>
  );
}

// ─── Section panel ─────────────────────────────────────────────────────────
function SectionPanel({
  section,
  settings,
  localValues,
  onChange,
  onSave,
  saving,
  savedKeys,
}: {
  section: typeof SECTIONS[0];
  settings: Setting[];
  localValues: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onSave: (sectionId: string) => void;
  saving: string | null;
  savedKeys: Set<string>;
}) {
  const Icon = section.icon;
  const isSaving = saving === section.id;
  const hasChanges = settings.some((s) => {
    const lv = localValues[s.key] ?? s.value;
    // For password fields: only dirty if they typed something new (non-empty, non-masked)
    if (s.isSecret) return lv !== "" && lv !== "••••••••••••" && lv !== s.value;
    return lv !== s.value;
  });

  return (
    <div className={`rounded-2xl border ${section.border} bg-[#111] overflow-hidden`}>
      {/* Section header */}
      <div className={`${section.bg} border-b ${section.border} px-6 py-4 flex items-start justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${section.bg} border ${section.border}`}>
            <Icon className={`h-5 w-5 ${section.color}`} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">{section.label}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{section.description}</p>
          </div>
        </div>
        <button
          onClick={() => onSave(section.id)}
          disabled={isSaving || !hasChanges}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
            isSaving
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              : hasChanges
              ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20"
              : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
          }`}
        >
          {isSaving ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</>
          ) : (
            <><Save className="h-3.5 w-3.5" /> Save Section</>
          )}
        </button>
      </div>

      {/* Fields */}
      <div className="divide-y divide-[#1a1a1a]">
        {settings.map((setting) => {
          const lv = localValues[setting.key] ?? setting.value;
          const justSaved = savedKeys.has(setting.key);
          return (
            <div key={setting.key} className="px-6 py-4 flex flex-col sm:flex-row sm:items-start gap-4">
              {/* Label */}
              <div className="sm:w-64 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-200">{setting.label}</span>
                  {setting.isSecret && <Lock className="h-3 w-3 text-zinc-600" />}
                  {justSaved && <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />}
                </div>
                {setting.description && (
                  <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{setting.description}</p>
                )}
                <code className="text-[10px] text-zinc-700 font-mono mt-1 block">{setting.key}</code>
              </div>

              {/* Input */}
              <div className="flex-1">
                <SettingField
                  setting={setting}
                  localValue={lv}
                  onChange={onChange}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
const AdminSettings = () => {
  const user = authStore.getSession();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<SectionId>("ai");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // ── Fetch all settings ──────────────────────────────────────────────────
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await apiRequest<{ settings: Setting[] }>(
      ENDPOINTS.SETTINGS_LIST
    );
    if (error || !data) {
      showToast("error", error || "Failed to load settings");
    } else {
      setSettings(data.settings);
      // Build local state — for secrets, keep the masked value as-is
      const vals: Record<string, string> = {};
      for (const s of data.settings) vals[s.key] = s.value;
      setLocalValues(vals);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  // ── Toast helper ────────────────────────────────────────────────────────
  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Handle field change ─────────────────────────────────────────────────
  const handleChange = (key: string, value: string) => {
    setLocalValues((prev) => ({ ...prev, [key]: value }));
  };

  // ── Save an entire section ──────────────────────────────────────────────
  const handleSave = async (sectionId: string) => {
    setSaving(sectionId);
    const sectionSettings = settings.filter((s) => s.section === sectionId);

    const updates = sectionSettings
      .map((s) => ({ key: s.key, value: localValues[s.key] ?? s.value }))
      // Skip password fields that are still masked or empty (user didn't change them)
      .filter(({ key, value }) => {
        const setting = sectionSettings.find((s) => s.key === key);
        if (setting?.isSecret && (value === "••••••••••••" || value === "")) return false;
        return true;
      });

    const { data, error } = await apiRequest<{ saved: number; errors?: string[] }>(
      ENDPOINTS.SETTINGS_BULK,
      { method: "PATCH", body: { updates } }
    );

    setSaving(null);

    if (error || !data) {
      showToast("error", error || "Save failed");
      return;
    }

    if (data.errors?.length) {
      showToast("error", `Saved ${data.saved}, but errors: ${data.errors.join(", ")}`);
    } else {
      showToast("success", `${data.saved} setting${data.saved !== 1 ? "s" : ""} saved successfully`);
    }

    // Mark saved keys briefly
    const savedSet = new Set(sectionSettings.map((s) => s.key));
    setSavedKeys(savedSet);
    setTimeout(() => setSavedKeys(new Set()), 2500);

    // Re-fetch so masks update correctly for secrets
    await fetchSettings();
  };

  // ── Active section settings ─────────────────────────────────────────────
  const activeSectionMeta = SECTIONS.find((s) => s.id === activeSection)!;
  const activeSectionSettings = settings.filter((s) => s.section === activeSection);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium transition-all animate-in fade-in slide-in-from-top-2 ${
            toast.type === "success"
              ? "bg-green-950 border-green-500/40 text-green-300"
              : "bg-red-950 border-red-500/40 text-red-300"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {toast.msg}
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        {/* ── Left Sidebar nav ─────────────────────────────────────────────── */}
        <aside className="w-64 shrink-0 border-r border-[#1a1a1a] bg-[#0d0d0d] flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="px-5 py-5 border-b border-[#1a1a1a]">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="h-8 w-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                <Settings2 className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">Settings</h1>
                <p className="text-[11px] text-zinc-600">System Configuration</p>
              </div>
            </div>
          </div>

          {/* Section navigation */}
          <nav className="flex-1 p-3 space-y-1">
            {SECTIONS.map((sec) => {
              const SIcon = sec.icon;
              const isActive = activeSection === sec.id;
              const sectionSettings = settings.filter((s) => s.section === sec.id);
              const hasUnsaved = sectionSettings.some((s) => {
                const lv = localValues[s.key] ?? s.value;
                if (s.isSecret) return lv !== "" && lv !== "••••••••••••" && lv !== s.value;
                return lv !== s.value;
              });
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left ${
                    isActive
                      ? `${sec.bg} ${sec.border} border text-white font-medium`
                      : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
                  }`}
                >
                  <SIcon className={`h-4 w-4 shrink-0 ${isActive ? sec.color : ""}`} />
                  <span className="flex-1">{sec.label}</span>
                  {hasUnsaved && (
                    <span className="h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                  )}
                  {isActive && <ChevronRight className={`h-3.5 w-3.5 ${sec.color}`} />}
                </button>
              );
            })}
          </nav>

          {/* Admin info */}
          <div className="p-3 border-t border-[#1a1a1a]">
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-white/5">
              <div className="h-7 w-7 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                <span className="text-xs font-bold text-orange-400">{user?.name?.[0] ?? "A"}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-zinc-200 truncate">{user?.name}</p>
                <p className="text-[10px] text-zinc-600 truncate capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main content ──────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          {/* Top bar */}
          <div className="sticky top-0 z-10 bg-[#0a0a0a]/90 backdrop-blur border-b border-[#1a1a1a] px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg ${activeSectionMeta.bg}`}>
                <activeSectionMeta.icon className={`h-4 w-4 ${activeSectionMeta.color}`} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">{activeSectionMeta.label}</h2>
                <p className="text-xs text-zinc-500">{activeSectionMeta.description}</p>
              </div>
            </div>
            <button
              onClick={fetchSettings}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-[#2a2a2a] transition-all"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-3">
                <Loader2 className="h-8 w-8 text-orange-400 animate-spin" />
                <p className="text-sm text-zinc-500">Loading settings…</p>
              </div>
            ) : activeSectionSettings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 gap-3">
                <Info className="h-8 w-8 text-zinc-700" />
                <p className="text-sm text-zinc-500">No settings found for this section.</p>
              </div>
            ) : (
              <SectionPanel
                section={activeSectionMeta}
                settings={activeSectionSettings}
                localValues={localValues}
                onChange={handleChange}
                onSave={handleSave}
                saving={saving}
                savedKeys={savedKeys}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;
