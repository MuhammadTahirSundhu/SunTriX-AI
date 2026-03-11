import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Languages } from "lucide-react";
import { LANGUAGES, type Language, translationStore } from "@/lib/i18n";
import { toast } from "@/hooks/use-toast";

const TRANSLATION_KEYS = [
  { key: "nav.home", label: "Nav: Home" },
  { key: "nav.services", label: "Nav: Services" },
  { key: "nav.howWeWork", label: "Nav: How We Work" },
  { key: "nav.portfolio", label: "Nav: Portfolio" },
  { key: "nav.about", label: "Nav: About" },
  { key: "nav.contact", label: "Nav: Contact" },
  { key: "nav.bookCall", label: "Nav: Book a Call" },
  { key: "nav.requestTask", label: "Nav: Request a Task" },
  { key: "hero.badge", label: "Hero: Badge" },
  { key: "hero.cta.primary", label: "Hero: Primary CTA" },
  { key: "hero.cta.secondary", label: "Hero: Secondary CTA" },
  { key: "footer.subscribe", label: "Footer: Subscribe" },
  { key: "footer.rights", label: "Footer: Rights" },
  { key: "portfolio.title", label: "Portfolio: Title" },
  { key: "portfolio.subtitle", label: "Portfolio: Subtitle" },
  { key: "portfolio.viewCase", label: "Portfolio: View Case" },
  { key: "portfolio.filter.all", label: "Portfolio: All Filter" },
  { key: "cta.title", label: "CTA: Title" },
  { key: "cta.subtitle", label: "CTA: Subtitle" },
  { key: "contact.title", label: "Contact: Title" },
  { key: "about.title", label: "About: Title" },
];

const AdminTranslations = () => {
  const [activeLang, setActiveLang] = useState<Language>("en");
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    const all = translationStore.getAll();
    setTranslations(all[activeLang] || {});
  }, [activeLang]);

  const save = () => {
    translationStore.updateBulk(activeLang, translations);
    toast({ title: `Translations saved for ${LANGUAGES.find((l) => l.code === activeLang)?.name}` });
  };

  const inputCls = "w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">Translations</h1>
        <p className="text-sm text-muted-foreground">Manage language translations for the website</p>
      </div>

      {/* Language tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setActiveLang(lang.code)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              activeLang === lang.code ? "gradient-bg text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>{lang.flag}</span> {lang.name}
          </button>
        ))}
      </div>

      <motion.div key={activeLang} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-6">
        <div className="space-y-4">
          {TRANSLATION_KEYS.map(({ key, label }) => (
            <div key={key} className="grid grid-cols-3 gap-4 items-center">
              <label className="text-xs font-medium text-muted-foreground">{label}</label>
              <input
                value={translations[key] || ""}
                onChange={(e) => setTranslations({ ...translations, [key]: e.target.value })}
                placeholder={key}
                className={inputCls}
              />
              <p className="text-xs text-muted-foreground/50 truncate">{key}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={save} className="gradient-bg inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
            <Save className="h-4 w-4" /> Save Translations
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminTranslations;
