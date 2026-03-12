import { useState } from "react";
import { Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n, LANGUAGES } from "@/lib/i18n";

const LanguageSwitcher = () => {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === lang);

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen(!open)}
        className="h-9 rounded-lg border border-border bg-card/50 flex items-center gap-1.5 px-2.5 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
      >
        <Globe className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">{current?.flag}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute top-full right-0 mt-1 w-40 rounded-xl border border-border bg-card/95 backdrop-blur-xl p-1.5 shadow-2xl z-50"
          >
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  lang === l.code ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                }`}
              >
                <span>{l.flag}</span>
                <span className="font-medium">{l.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
