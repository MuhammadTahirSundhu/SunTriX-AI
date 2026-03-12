import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "en" | "ar" | "fr" | "de" | "es" | "zh";

const translations: Record<Lang, Record<string, string>> = {
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
    "hero.scroll": "Scroll",
    "cta.getInTouch": "Get in Touch",
    "cta.learnMore": "Learn More",
    "footer.subscribe": "Subscribe to AI insights",
    "footer.rights": "All rights reserved.",
    "footer.tagline": "Engineering Intelligence That Perceives, Reasons, and Acts.",
    "about.title": "About SunTriX",
    "about.hero.headline": "Building the Future of",
    "about.hero.gradient": "Intelligent Systems",
    "about.mission": "Mission",
    "about.vision": "Vision",
    "about.values": "Our Values",
    "about.team": "Leadership Team",
    "work.process": "Our Process",
    "work.title": "How We Work",
    "work.scrum": "Built on Scrum",
    "work.ready": "Ready to Start?",
    "portfolio.title": "Our Work",
    "portfolio.all": "All",
    "services.title": "Services",
    "contact.title": "Contact Us",
    "demos.title": "Video Demos",
    "demos.subtitle": "See It In Action",
    "demos.description": "Watch how our AI solutions work in real-world production environments.",
  },
  ar: {
    "nav.home": "الرئيسية",
    "nav.services": "الخدمات",
    "nav.howWeWork": "كيف نعمل",
    "nav.portfolio": "أعمالنا",
    "nav.about": "عن الشركة",
    "nav.contact": "اتصل بنا",
    "nav.bookCall": "احجز مكالمة",
    "nav.requestTask": "طلب مهمة",
    "hero.badge": "نقبل طلبات مشاريع الذكاء الاصطناعي",
    "hero.cta.primary": "طلب عرض",
    "hero.cta.secondary": "شاهد أعمالنا",
    "hero.scroll": "مرر",
    "cta.getInTouch": "تواصل معنا",
    "cta.learnMore": "اعرف المزيد",
    "footer.subscribe": "اشترك في نشرة الذكاء الاصطناعي",
    "footer.rights": "جميع الحقوق محفوظة.",
    "footer.tagline": "هندسة ذكاء يدرك ويفكر ويتصرف.",
    "about.title": "عن سنتركس",
    "about.hero.headline": "نبني مستقبل",
    "about.hero.gradient": "الأنظمة الذكية",
    "about.mission": "المهمة",
    "about.vision": "الرؤية",
    "about.values": "قيمنا",
    "about.team": "فريق القيادة",
    "work.process": "عمليتنا",
    "work.title": "كيف نعمل",
    "work.scrum": "مبني على سكرم",
    "work.ready": "مستعد للبدء؟",
    "portfolio.title": "أعمالنا",
    "portfolio.all": "الكل",
    "services.title": "الخدمات",
    "contact.title": "اتصل بنا",
    "demos.title": "عروض فيديو",
    "demos.subtitle": "شاهدها بالعمل",
    "demos.description": "شاهد كيف تعمل حلول الذكاء الاصطناعي لدينا في بيئات الإنتاج الحقيقية.",
  },
  fr: {
    "nav.home": "Accueil",
    "nav.services": "Services",
    "nav.howWeWork": "Notre Méthode",
    "nav.portfolio": "Portfolio",
    "nav.about": "À propos",
    "nav.contact": "Contact",
    "nav.bookCall": "Réserver un appel",
    "nav.requestTask": "Demander une tâche",
    "hero.badge": "Nous acceptons les nouveaux projets IA & SaaS",
    "hero.cta.primary": "Demander une démo",
    "hero.cta.secondary": "Voir nos réalisations",
    "hero.scroll": "Défiler",
    "cta.getInTouch": "Nous contacter",
    "cta.learnMore": "En savoir plus",
    "footer.subscribe": "S'abonner aux actualités IA",
    "footer.rights": "Tous droits réservés.",
    "footer.tagline": "Ingénierie d'intelligence qui perçoit, raisonne et agit.",
    "about.title": "À propos de SunTriX",
    "about.hero.headline": "Construire le futur des",
    "about.hero.gradient": "Systèmes Intelligents",
    "about.mission": "Mission",
    "about.vision": "Vision",
    "about.values": "Nos Valeurs",
    "about.team": "Équipe de Direction",
    "work.process": "Notre processus",
    "work.title": "Comment nous travaillons",
    "work.scrum": "Basé sur Scrum",
    "work.ready": "Prêt à commencer?",
    "portfolio.title": "Nos Réalisations",
    "portfolio.all": "Tout",
    "services.title": "Services",
    "contact.title": "Contactez-nous",
    "demos.title": "Démos Vidéo",
    "demos.subtitle": "Voir en Action",
    "demos.description": "Découvrez comment nos solutions IA fonctionnent en production.",
  },
  de: {
    "nav.home": "Startseite",
    "nav.services": "Dienstleistungen",
    "nav.howWeWork": "Unsere Methode",
    "nav.portfolio": "Portfolio",
    "nav.about": "Über uns",
    "nav.contact": "Kontakt",
    "nav.bookCall": "Anruf buchen",
    "nav.requestTask": "Aufgabe anfragen",
    "hero.badge": "Neue KI & SaaS-Projektanfragen willkommen",
    "hero.cta.primary": "Demo anfordern",
    "hero.cta.secondary": "Unsere Arbeit",
    "hero.scroll": "Scrollen",
    "cta.getInTouch": "Kontakt aufnehmen",
    "cta.learnMore": "Mehr erfahren",
    "footer.subscribe": "KI-Newsletter abonnieren",
    "footer.rights": "Alle Rechte vorbehalten.",
    "footer.tagline": "Engineering Intelligence die wahrnimmt, denkt und handelt.",
    "about.title": "Über SunTriX",
    "about.hero.headline": "Die Zukunft der",
    "about.hero.gradient": "Intelligenten Systeme",
    "about.mission": "Mission",
    "about.vision": "Vision",
    "about.values": "Unsere Werte",
    "about.team": "Führungsteam",
    "work.process": "Unser Prozess",
    "work.title": "Wie wir arbeiten",
    "work.scrum": "Basiert auf Scrum",
    "work.ready": "Bereit anzufangen?",
    "portfolio.title": "Unsere Arbeit",
    "portfolio.all": "Alle",
    "services.title": "Dienstleistungen",
    "contact.title": "Kontaktieren Sie uns",
    "demos.title": "Video-Demos",
    "demos.subtitle": "In Aktion sehen",
    "demos.description": "Sehen Sie wie unsere KI-Lösungen in Produktionsumgebungen funktionieren.",
  },
  es: {
    "nav.home": "Inicio",
    "nav.services": "Servicios",
    "nav.howWeWork": "Cómo Trabajamos",
    "nav.portfolio": "Portafolio",
    "nav.about": "Nosotros",
    "nav.contact": "Contacto",
    "nav.bookCall": "Reservar llamada",
    "nav.requestTask": "Solicitar tarea",
    "hero.badge": "Aceptamos nuevos proyectos de IA y SaaS",
    "hero.cta.primary": "Solicitar demo",
    "hero.cta.secondary": "Ver nuestro trabajo",
    "hero.scroll": "Desplazar",
    "cta.getInTouch": "Contáctenos",
    "cta.learnMore": "Más información",
    "footer.subscribe": "Suscríbase a novedades de IA",
    "footer.rights": "Todos los derechos reservados.",
    "footer.tagline": "Ingeniería de inteligencia que percibe, razona y actúa.",
    "about.title": "Sobre SunTriX",
    "about.hero.headline": "Construyendo el futuro de",
    "about.hero.gradient": "Sistemas Inteligentes",
    "about.mission": "Misión",
    "about.vision": "Visión",
    "about.values": "Nuestros Valores",
    "about.team": "Equipo Directivo",
    "work.process": "Nuestro proceso",
    "work.title": "Cómo Trabajamos",
    "work.scrum": "Basado en Scrum",
    "work.ready": "¿Listo para empezar?",
    "portfolio.title": "Nuestro Trabajo",
    "portfolio.all": "Todo",
    "services.title": "Servicios",
    "contact.title": "Contáctenos",
    "demos.title": "Demos en Video",
    "demos.subtitle": "Véalo en Acción",
    "demos.description": "Vea cómo nuestras soluciones de IA funcionan en entornos de producción reales.",
  },
  zh: {
    "nav.home": "首页",
    "nav.services": "服务",
    "nav.howWeWork": "工作方式",
    "nav.portfolio": "作品集",
    "nav.about": "关于我们",
    "nav.contact": "联系我们",
    "nav.bookCall": "预约电话",
    "nav.requestTask": "提交任务",
    "hero.badge": "正在接受AI和SaaS项目简报",
    "hero.cta.primary": "申请演示",
    "hero.cta.secondary": "查看作品",
    "hero.scroll": "滚动",
    "cta.getInTouch": "联系我们",
    "cta.learnMore": "了解更多",
    "footer.subscribe": "订阅AI资讯",
    "footer.rights": "版权所有。",
    "footer.tagline": "构建感知、推理和行动的智能工程。",
    "about.title": "关于SunTriX",
    "about.hero.headline": "构建未来的",
    "about.hero.gradient": "智能系统",
    "about.mission": "使命",
    "about.vision": "愿景",
    "about.values": "我们的价值观",
    "about.team": "领导团队",
    "work.process": "我们的流程",
    "work.title": "我们如何工作",
    "work.scrum": "基于Scrum",
    "work.ready": "准备好开始了吗？",
    "portfolio.title": "我们的作品",
    "portfolio.all": "全部",
    "services.title": "服务",
    "contact.title": "联系我们",
    "demos.title": "视频演示",
    "demos.subtitle": "实际演示",
    "demos.description": "观看我们的AI解决方案如何在真实生产环境中运行。",
  },
};

function detectLanguage(): Lang {
  const stored = localStorage.getItem("suntrix_lang") as Lang | null;
  if (stored && translations[stored]) return stored;
  const browserLang = navigator.language.split("-")[0] as Lang;
  return translations[browserLang] ? browserLang : "en";
}

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
  dir: "ltr",
});

export const useI18n = () => useContext(I18nContext);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(detectLanguage);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("suntrix_lang", l);
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = l;
  };

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: string): string => translations[lang]?.[key] || translations.en[key] || key;
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
};

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];
