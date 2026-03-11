import { useState } from "react";
import { Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n, LANGUAGES } from "@/lib/i18n";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useI18n();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === language);

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 p-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
      >
        <Globe className="h-4 w-4 text-foreground" />
        <span className="text-xs font-medium text-foreground hidden sm:inline">{current?.flag}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-border bg-card shadow-xl p-1.5 z-50"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setOpen(false); }}
                className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm transition-colors ${
                  language === lang.code
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
