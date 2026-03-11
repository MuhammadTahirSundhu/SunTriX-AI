import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "ar" | "fr" | "de" | "es" | "zh";

export const LANGUAGES: { code: Language; name: string; flag: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", name: "English", flag: "🇺🇸", dir: "ltr" },
  { code: "ar", name: "العربية", flag: "🇸🇦", dir: "rtl" },
  { code: "fr", name: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "de", name: "Deutsch", flag: "🇩🇪", dir: "ltr" },
  { code: "es", name: "Español", flag: "🇪🇸", dir: "ltr" },
  { code: "zh", name: "中文", flag: "🇨🇳", dir: "ltr" },
];

// Default English translations
const defaultTranslations: Record<string, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.services": "Services",
    "nav.howWeWork": "How We Work",
    "nav.portfolio": "Portfolio",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.bookCall": "Book a Call",
    "nav.requestTask": "Request a Task",
    "hero.badge": "Accepting new AI & SaaS project briefs",
    "hero.cta.primary": "Request a Demo",
    "hero.cta.secondary": "View Our Work",
    "footer.subscribe": "Subscribe to AI insights",
    "footer.rights": "All rights reserved.",
    "portfolio.title": "Proven Results",
    "portfolio.subtitle": "Real projects, measurable outcomes.",
    "portfolio.viewCase": "View Case Study",
    "portfolio.filter.all": "All",
    "cta.title": "Ready to Build Something Extraordinary?",
    "cta.subtitle": "Let's discuss your next AI project.",
    "contact.title": "Get in Touch",
    "about.title": "About Us",
  },
  ar: {
    "nav.home": "الرئيسية",
    "nav.services": "الخدمات",
    "nav.howWeWork": "كيف نعمل",
    "nav.portfolio": "أعمالنا",
    "nav.about": "من نحن",
    "nav.contact": "تواصل معنا",
    "nav.bookCall": "احجز مكالمة",
    "nav.requestTask": "طلب مهمة",
    "footer.rights": "جميع الحقوق محفوظة.",
    "portfolio.title": "نتائج مثبتة",
    "portfolio.viewCase": "عرض دراسة الحالة",
    "portfolio.filter.all": "الكل",
  },
  fr: {
    "nav.home": "Accueil",
    "nav.services": "Services",
    "nav.howWeWork": "Notre Méthode",
    "nav.portfolio": "Portfolio",
    "nav.about": "À Propos",
    "nav.contact": "Contact",
    "nav.bookCall": "Réserver un Appel",
    "nav.requestTask": "Demander une Tâche",
    "footer.rights": "Tous droits réservés.",
    "portfolio.title": "Résultats Prouvés",
    "portfolio.viewCase": "Voir l'Étude de Cas",
    "portfolio.filter.all": "Tout",
  },
  de: {
    "nav.home": "Startseite",
    "nav.services": "Dienste",
    "nav.portfolio": "Portfolio",
    "nav.about": "Über Uns",
    "nav.contact": "Kontakt",
    "nav.requestTask": "Aufgabe Anfordern",
    "footer.rights": "Alle Rechte vorbehalten.",
  },
  es: {
    "nav.home": "Inicio",
    "nav.services": "Servicios",
    "nav.portfolio": "Portafolio",
    "nav.about": "Nosotros",
    "nav.contact": "Contacto",
    "nav.requestTask": "Solicitar Tarea",
    "footer.rights": "Todos los derechos reservados.",
  },
  zh: {
    "nav.home": "首页",
    "nav.services": "服务",
    "nav.portfolio": "作品集",
    "nav.about": "关于我们",
    "nav.contact": "联系我们",
    "nav.requestTask": "提交任务",
    "footer.rights": "版权所有。",
  },
};

// Translation store in localStorage
const TRANSLATIONS_KEY = "suntrix_translations";

export const translationStore = {
  getAll(): Record<string, Record<string, string>> {
    try {
      const data = localStorage.getItem(TRANSLATIONS_KEY);
      return data ? { ...defaultTranslations, ...JSON.parse(data) } : defaultTranslations;
    } catch {
      return defaultTranslations;
    }
  },

  update(lang: Language, key: string, value: string) {
    const all = this.getAll();
    if (!all[lang]) all[lang] = {};
    all[lang][key] = value;
    localStorage.setItem(TRANSLATIONS_KEY, JSON.stringify(all));
  },

  updateBulk(lang: Language, translations: Record<string, string>) {
    const all = this.getAll();
    all[lang] = { ...(all[lang] || {}), ...translations };
    localStorage.setItem(TRANSLATIONS_KEY, JSON.stringify(all));
  },
};

// Detect browser language
function detectLanguage(): Language {
  const stored = localStorage.getItem("suntrix_language") as Language | null;
  if (stored && LANGUAGES.some((l) => l.code === stored)) return stored;
  
  const browserLang = navigator.language.split("-")[0] as Language;
  if (LANGUAGES.some((l) => l.code === browserLang)) return browserLang;
  return "en";
}

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
  dir: "ltr",
});

export const useI18n = () => useContext(I18nContext);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLang] = useState<Language>(detectLanguage);

  const setLanguage = (lang: Language) => {
    setLang(lang);
    localStorage.setItem("suntrix_language", lang);
    document.documentElement.dir = LANGUAGES.find((l) => l.code === lang)?.dir || "ltr";
  };

  useEffect(() => {
    document.documentElement.dir = LANGUAGES.find((l) => l.code === language)?.dir || "ltr";
  }, [language]);

  const translations = translationStore.getAll();

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en?.[key] || key;
  };

  const dir = LANGUAGES.find((l) => l.code === language)?.dir || "ltr";

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
};
