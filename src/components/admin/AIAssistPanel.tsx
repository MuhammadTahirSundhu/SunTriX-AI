import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import { Sparkles, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

// ─── Module-specific placeholder hints ───────────────────────────────────────
const PLACEHOLDERS: Record<string, string> = {
  portfolio: `Paste a project description, brief, or documentation.\n\nExample:\n"We built a computer vision system for RetailCo that detects inventory anomalies with 98% accuracy. It runs on AWS SageMaker with OpenCV and reduced stockouts by 40%."`,
  department: `Describe a service department or practice area.\n\nExample:\n"Our Agentic AI division builds fully autonomous, multi-step AI agents that automate complex business workflows end-to-end without human intervention."`,
  blog: `Paste an article draft, topic brief, or research notes.\n\nExample:\n"Write about how large language models are transforming enterprise customer support, reducing ticket resolution time by 60%, with examples from Salesforce and Zendesk integrations."`,
  team: `Paste a team member's bio, LinkedIn summary, or profile.\n\nExample:\n"Sarah Chen is a Senior ML Engineer with 7 years building production AI systems. Previously at Google Brain. GitHub: github.com/sarahchen. LinkedIn: linkedin.com/in/sarahchen."`,
  pricing: `Describe a pricing plan or package.\n\nExample:\n"Our Growth plan costs $999/month and includes up to 20 AI agents, priority support, custom integrations, and 100GB of storage. Best suited for scaling startups."`,
  client: `Mention a client or partner company.\n\nExample:\n"Acme Corporation — a Fortune 500 retail company. Website: https://acme.com."`,
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface AIAssistPanelProps {
  module: string;
  onExtracted: (fields: Record<string, unknown>) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
const AIAssistPanel = ({ module, onExtracted }: AIAssistPanelProps) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showTip, setShowTip] = useState(false);

  const handleExtract = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { data, error: apiError } = await apiRequest<{ fields: Record<string, unknown> }>(
      ENDPOINTS.AI_EXTRACT,
      {
        method: "POST",
        body: { module, text: text.trim() },
      }
    );

    setLoading(false);

    if (apiError || !data?.fields) {
      setError(apiError || "AI extraction failed. Please try again.");
      return;
    }

    // Filter out empty values so we don't overwrite existing data unnecessarily
    const extracted = Object.fromEntries(
      Object.entries(data.fields).filter(([, v]) => {
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === "string") return v.trim() !== "";
        if (typeof v === "number") return true;
        return false;
      })
    );

    onExtracted(extracted);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/5 via-violet-500/5 to-transparent p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/20">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">AI-Assisted Entry</p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Paste text → AI fills the form
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowTip(!showTip)}
          className="flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 transition-colors"
        >
          How it works
          {showTip ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {/* Tip */}
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-3 text-xs text-purple-300 space-y-1">
              <p>1. Paste any unstructured text below (brief, bio, description, docs)</p>
              <p>2. Click <strong>"Generate Fields"</strong> — the AI extracts & maps the data</p>
              <p>3. All form fields are pre-filled — review and edit before saving</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={PLACEHOLDERS[module] || "Paste your text here..."}
          rows={5}
          className="w-full rounded-lg border border-purple-500/20 bg-background/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none transition-colors"
          disabled={loading}
        />
        {text.length > 0 && (
          <span className="absolute bottom-2 right-3 text-[10px] text-muted-foreground/50">
            {text.length} chars
          </span>
        )}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate Button */}
      <button
        type="button"
        onClick={handleExtract}
        disabled={loading || !text.trim()}
        className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          success
            ? "bg-emerald-500 text-white"
            : "bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-500 hover:to-violet-500 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Extracting fields...
          </>
        ) : success ? (
          <>
            <Sparkles className="h-4 w-4" />
            Fields populated! Review below ↓
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Fields
          </>
        )}
      </button>

      {/* Animated progress bar while loading */}
      {loading && (
        <div className="h-0.5 w-full rounded-full bg-purple-500/10 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-violet-500"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}
    </div>
  );
};

export default AIAssistPanel;
