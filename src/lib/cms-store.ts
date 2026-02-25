/**
 * CMS Content Store
 * 
 * Manages all dynamic website content via localStorage.
 * When backend is ready, replace with API calls from api.ts.
 * Schema matches MongoDB document structure.
 */

// ─── Types ──────────────────────────────────────────────────────

export interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  shortDescription: string;
  metric: string;
  metricLabel: string;
  coverImage: string;
  images: string[];
  videoUrl: string;
  tags: string[];
  tools: { name: string; icon: string }[];
  clientLogo: string;
  clientName: string;
  industry: string;
  highlights: string[];
  status: "published" | "draft";
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CaseStudy {
  id: string;
  projectId: string;
  slug: string;
  title: string;
  heroImage: string;
  challenge: string;
  solution: string;
  results: string;
  galleryImages: string[];
  videoUrl: string;
  toolsUsed: { name: string; icon: string }[];
  keyMetrics: { label: string; value: string; description: string }[];
  testimonial: { quote: string; name: string; role: string; avatar: string };
  status: "published" | "draft";
  createdAt: string;
  updatedAt: string;
}

export interface SiteContent {
  id: string;
  section: string;
  key: string;
  value: string;
  type: "text" | "image" | "video" | "html" | "json";
  page: string;
  updatedAt: string;
}

export interface AnnouncementBar {
  id: string;
  text: string;
  link: string;
  linkText: string;
  enabled: boolean;
  bgColor: string;
  updatedAt: string;
}

export interface SEOSettings {
  id: string;
  page: string;
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  href: string;
  order: number;
  enabled: boolean;
  updatedAt: string;
}

export interface ServiceInfo {
  id: string;
  departmentId: string;
  title: string;
  description: string;
  features: string[];
  image: string;
  icon: string;
  order: number;
  enabled: boolean;
  updatedAt: string;
}

export interface HeroContent {
  id: string;
  badge: string;
  headline: string[];
  gradientWords: string[];
  subheadline: string;
  ctaPrimary: { text: string; link: string };
  ctaSecondary: { text: string; link: string };
  trustPills: string[];
  backgroundImage: string;
  enabled: boolean;
  updatedAt: string;
}

export interface CompanyInfo {
  id: string;
  name: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  socialLinks: { platform: string; url: string }[];
  logo: string;
  updatedAt: string;
}

export interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  order: number;
  enabled: boolean;
  updatedAt: string;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  featured: boolean;
  status: "published" | "draft";
  createdAt: string;
}

// ─── Helpers ────────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getCollection<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function setCollection<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function getObject<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setObject<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Portfolio Store ────────────────────────────────────────────

const SEED_PROJECTS: Omit<PortfolioProject, "id" | "createdAt" | "updatedAt">[] = [
  {
    title: "AI-Powered Document Processing",
    slug: "ai-document-processing",
    category: "Agentic AI",
    description: "Built an autonomous document processing pipeline for a Fortune 500 financial services company. The system uses multi-agent orchestration to classify, extract, validate, and route 50,000+ documents daily with 99.2% accuracy.",
    shortDescription: "Autonomous pipeline for Fortune 500 company processing 50,000+ documents daily.",
    metric: "10x",
    metricLabel: "Faster Processing",
    coverImage: "",
    images: [],
    videoUrl: "",
    tags: ["LangChain", "Python", "AWS", "OpenAI"],
    tools: [
      { name: "LangChain", icon: "🔗" },
      { name: "Python", icon: "🐍" },
      { name: "AWS", icon: "☁️" },
      { name: "OpenAI", icon: "🤖" },
    ],
    clientLogo: "",
    clientName: "Fortune 500 Financial Corp",
    industry: "Financial Services",
    highlights: ["99.2% accuracy rate", "50K+ daily documents", "60% cost reduction", "Multi-agent orchestration"],
    status: "published",
    featured: true,
    order: 1,
  },
  {
    title: "Predictive Maintenance Platform",
    slug: "predictive-maintenance",
    category: "AI & ML",
    description: "Developed a machine learning platform that predicts equipment failures 72 hours in advance with 97.3% accuracy, reducing unplanned downtime by 60% across 12 manufacturing facilities.",
    shortDescription: "ML-driven maintenance prediction system reducing downtime by 60% in manufacturing.",
    metric: "97.3%",
    metricLabel: "Prediction Accuracy",
    coverImage: "",
    images: [],
    videoUrl: "",
    tags: ["PyTorch", "MLflow", "Docker", "TimescaleDB"],
    tools: [
      { name: "PyTorch", icon: "🔥" },
      { name: "MLflow", icon: "📊" },
      { name: "Docker", icon: "🐳" },
    ],
    clientLogo: "",
    clientName: "IndustrialTech Corp",
    industry: "Manufacturing",
    highlights: ["72-hour advance prediction", "97.3% accuracy", "60% downtime reduction", "12 facilities deployed"],
    status: "published",
    featured: true,
    order: 2,
  },
  {
    title: "Quality Inspection System",
    slug: "quality-inspection",
    category: "Computer Vision",
    description: "Automated PCB defect detection system using custom-trained YOLO models with real-time inference on the production line. Achieved 94% improvement in defect detection with sub-100ms inference time.",
    shortDescription: "Automated PCB defect detection with real-time inference on the production line.",
    metric: "94%",
    metricLabel: "Detection Improvement",
    coverImage: "",
    images: [],
    videoUrl: "",
    tags: ["YOLO", "OpenCV", "NVIDIA", "TensorRT"],
    tools: [
      { name: "YOLO", icon: "👁️" },
      { name: "OpenCV", icon: "📷" },
      { name: "NVIDIA", icon: "💚" },
    ],
    clientLogo: "",
    clientName: "VisionTech Industries",
    industry: "Electronics Manufacturing",
    highlights: ["Sub-100ms inference", "94% improvement", "Real-time edge deployment", "Custom YOLO model"],
    status: "published",
    featured: false,
    order: 3,
  },
  {
    title: "Analytics SaaS Platform",
    slug: "analytics-saas",
    category: "SaaS Platform",
    description: "Full-stack analytics platform built from zero to 5,000 paying users in 8 months. Features embedded ML models for predictive analytics, real-time dashboards, and multi-tenant architecture.",
    shortDescription: "Full-stack analytics platform from 0 to 5,000 users with embedded ML models.",
    metric: "$2M",
    metricLabel: "Annual Revenue",
    coverImage: "",
    images: [],
    videoUrl: "",
    tags: ["Next.js", "PostgreSQL", "Stripe", "Redis"],
    tools: [
      { name: "Next.js", icon: "⚡" },
      { name: "PostgreSQL", icon: "🐘" },
      { name: "Stripe", icon: "💳" },
    ],
    clientLogo: "",
    clientName: "DataInsight Inc",
    industry: "SaaS / Analytics",
    highlights: ["5,000 paying users", "$2M ARR in 8 months", "Multi-tenant architecture", "Embedded ML models"],
    status: "published",
    featured: true,
    order: 4,
  },
  {
    title: "Multi-Agent Customer Service",
    slug: "multi-agent-support",
    category: "Agentic AI",
    description: "AI agents handling tier-1 support with intelligent escalation, context retention across conversations, and continuous learning from resolved tickets.",
    shortDescription: "AI agents handling tier-1 support with intelligent escalation and learning.",
    metric: "85%",
    metricLabel: "Auto-Resolution Rate",
    coverImage: "",
    images: [],
    videoUrl: "",
    tags: ["AutoGen", "OpenAI", "Redis", "Node.js"],
    tools: [
      { name: "AutoGen", icon: "🤖" },
      { name: "OpenAI", icon: "🧠" },
      { name: "Redis", icon: "🔴" },
    ],
    clientLogo: "",
    clientName: "SupportFlow",
    industry: "Customer Service",
    highlights: ["85% auto-resolution", "3x faster response", "Intelligent escalation", "Continuous learning"],
    status: "published",
    featured: false,
    order: 5,
  },
  {
    title: "Real-time Video Surveillance",
    slug: "video-surveillance",
    category: "Computer Vision",
    description: "City-scale video analytics for traffic management and public safety. Processing 500+ camera feeds with real-time object detection, tracking, and anomaly alerts.",
    shortDescription: "City-scale video analytics for traffic management and public safety.",
    metric: "99.1%",
    metricLabel: "Detection Rate",
    coverImage: "",
    images: [],
    videoUrl: "",
    tags: ["TensorFlow", "Triton", "Kubernetes", "RTSP"],
    tools: [
      { name: "TensorFlow", icon: "🧮" },
      { name: "Triton", icon: "🚀" },
      { name: "Kubernetes", icon: "☸️" },
    ],
    clientLogo: "",
    clientName: "SmartCity Gov",
    industry: "Government / Smart City",
    highlights: ["500+ camera feeds", "99.1% detection rate", "Real-time alerts", "City-scale deployment"],
    status: "published",
    featured: false,
    order: 6,
  },
];

export const portfolioStore = {
  _seeded: false,

  _seed() {
    if (this._seeded) return;
    const existing = getCollection<PortfolioProject>("suntrix_portfolio");
    if (existing.length === 0) {
      const projects = SEED_PROJECTS.map((p, i) => ({
        ...p,
        id: generateId() + i,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setCollection("suntrix_portfolio", projects);
    }
    this._seeded = true;
  },

  getAll(): PortfolioProject[] {
    this._seed();
    return getCollection<PortfolioProject>("suntrix_portfolio");
  },

  getPublished(): PortfolioProject[] {
    return this.getAll().filter((p) => p.status === "published").sort((a, b) => a.order - b.order);
  },

  getFeatured(): PortfolioProject[] {
    return this.getPublished().filter((p) => p.featured);
  },

  getBySlug(slug: string): PortfolioProject | undefined {
    return this.getAll().find((p) => p.slug === slug);
  },

  getById(id: string): PortfolioProject | undefined {
    return this.getAll().find((p) => p.id === id);
  },

  create(data: Omit<PortfolioProject, "id" | "createdAt" | "updatedAt">): PortfolioProject {
    const project: PortfolioProject = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const all = this.getAll();
    all.unshift(project);
    setCollection("suntrix_portfolio", all);
    return project;
  },

  update(id: string, updates: Partial<PortfolioProject>): PortfolioProject | null {
    const all = this.getAll();
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    setCollection("suntrix_portfolio", all);
    return all[idx];
  },

  delete(id: string): boolean {
    const all = this.getAll();
    const filtered = all.filter((p) => p.id !== id);
    if (filtered.length === all.length) return false;
    setCollection("suntrix_portfolio", filtered);
    return true;
  },
};

// ─── Case Study Store ───────────────────────────────────────────

export const caseStudyStore = {
  getAll(): CaseStudy[] {
    return getCollection<CaseStudy>("suntrix_case_studies");
  },

  getBySlug(slug: string): CaseStudy | undefined {
    return this.getAll().find((cs) => cs.slug === slug);
  },

  getByProjectId(projectId: string): CaseStudy | undefined {
    return this.getAll().find((cs) => cs.projectId === projectId);
  },

  create(data: Omit<CaseStudy, "id" | "createdAt" | "updatedAt">): CaseStudy {
    const cs: CaseStudy = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const all = this.getAll();
    all.unshift(cs);
    setCollection("suntrix_case_studies", all);
    return cs;
  },

  update(id: string, updates: Partial<CaseStudy>): CaseStudy | null {
    const all = this.getAll();
    const idx = all.findIndex((cs) => cs.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    setCollection("suntrix_case_studies", all);
    return all[idx];
  },

  delete(id: string): boolean {
    const all = this.getAll();
    const filtered = all.filter((cs) => cs.id !== id);
    if (filtered.length === all.length) return false;
    setCollection("suntrix_case_studies", filtered);
    return true;
  },
};

// ─── Announcement Bar Store ─────────────────────────────────────

const DEFAULT_ANNOUNCEMENT: AnnouncementBar = {
  id: "announcement_1",
  text: "🚀 Now accepting AI project briefs — 24hr proposal guarantee",
  link: "/request-task",
  linkText: "Submit Brief →",
  enabled: true,
  bgColor: "primary",
  updatedAt: new Date().toISOString(),
};

export const announcementStore = {
  get(): AnnouncementBar {
    return getObject("suntrix_announcement", DEFAULT_ANNOUNCEMENT);
  },

  update(data: Partial<AnnouncementBar>): AnnouncementBar {
    const current = this.get();
    const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
    setObject("suntrix_announcement", updated);
    return updated;
  },

  toggle(): AnnouncementBar {
    const current = this.get();
    return this.update({ enabled: !current.enabled });
  },
};

// ─── Hero Content Store ─────────────────────────────────────────

const DEFAULT_HERO: HeroContent = {
  id: "hero_1",
  badge: "Accepting new AI & SaaS project briefs",
  headline: ["Engineering", "Intelligence That", "Perceives, Reasons,", "and Acts"],
  gradientWords: ["Intelligence", "Acts"],
  subheadline: "From agentic AI workflows to production-grade SaaS platforms — SunTriX delivers end-to-end AI engineering with a 24-hour proposal guarantee.",
  ctaPrimary: { text: "Request a Demo", link: "/request-task" },
  ctaSecondary: { text: "Watch Overview", link: "#" },
  trustPills: ["50+ Projects Delivered", "Fortune 500 Clients", "24hr Response SLA"],
  backgroundImage: "",
  enabled: true,
  updatedAt: new Date().toISOString(),
};

export const heroStore = {
  get(): HeroContent {
    return getObject("suntrix_hero", DEFAULT_HERO);
  },

  update(data: Partial<HeroContent>): HeroContent {
    const current = this.get();
    const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
    setObject("suntrix_hero", updated);
    return updated;
  },
};

// ─── Company Info Store ─────────────────────────────────────────

const DEFAULT_COMPANY: CompanyInfo = {
  id: "company_1",
  name: "SunTriX",
  tagline: "Engineering Intelligence That Perceives, Reasons, and Acts",
  description: "Your AI-first technology partner delivering end-to-end AI engineering.",
  email: "hello@suntrix.com",
  phone: "+1 (555) 123-4567",
  address: "San Francisco, CA",
  socialLinks: [
    { platform: "LinkedIn", url: "#" },
    { platform: "Twitter", url: "#" },
    { platform: "GitHub", url: "#" },
  ],
  logo: "",
  updatedAt: new Date().toISOString(),
};

export const companyStore = {
  get(): CompanyInfo {
    return getObject("suntrix_company", DEFAULT_COMPANY);
  },

  update(data: Partial<CompanyInfo>): CompanyInfo {
    const current = this.get();
    const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
    setObject("suntrix_company", updated);
    return updated;
  },
};

// ─── Testimonials Store ─────────────────────────────────────────

const SEED_TESTIMONIALS: Omit<TestimonialItem, "id" | "createdAt">[] = [
  {
    quote: "SunTriX transformed our data pipeline with an agentic AI system that cut processing time by 10x. Their architectural depth is unmatched.",
    name: "Sarah Chen",
    role: "CTO",
    company: "DataFlow Inc.",
    avatar: "",
    rating: 5,
    featured: true,
    status: "published",
  },
  {
    quote: "We went from concept to production-ready SaaS in 12 weeks. The team's ability to combine ML models with scalable infrastructure is remarkable.",
    name: "Marcus Johnson",
    role: "VP Engineering",
    company: "NeuralPath",
    avatar: "",
    rating: 5,
    featured: true,
    status: "published",
  },
  {
    quote: "Their computer vision solution achieved 94% accuracy on our quality inspection system. SunTriX delivered ahead of schedule with exceptional documentation.",
    name: "Emily Rodriguez",
    role: "Head of Product",
    company: "VisionTech",
    avatar: "",
    rating: 5,
    featured: true,
    status: "published",
  },
];

export const testimonialStore = {
  _seeded: false,

  _seed() {
    if (this._seeded) return;
    const existing = getCollection<TestimonialItem>("suntrix_testimonials");
    if (existing.length === 0) {
      const items = SEED_TESTIMONIALS.map((t) => ({
        ...t,
        id: generateId(),
        createdAt: new Date().toISOString(),
      }));
      setCollection("suntrix_testimonials", items);
    }
    this._seeded = true;
  },

  getAll(): TestimonialItem[] {
    this._seed();
    return getCollection<TestimonialItem>("suntrix_testimonials");
  },

  getPublished(): TestimonialItem[] {
    return this.getAll().filter((t) => t.status === "published");
  },

  create(data: Omit<TestimonialItem, "id" | "createdAt">): TestimonialItem {
    const item: TestimonialItem = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const all = this.getAll();
    all.unshift(item);
    setCollection("suntrix_testimonials", all);
    return item;
  },

  update(id: string, updates: Partial<TestimonialItem>): TestimonialItem | null {
    const all = this.getAll();
    const idx = all.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates };
    setCollection("suntrix_testimonials", all);
    return all[idx];
  },

  delete(id: string): boolean {
    const all = this.getAll();
    const filtered = all.filter((t) => t.id !== id);
    if (filtered.length === all.length) return false;
    setCollection("suntrix_testimonials", filtered);
    return true;
  },
};

// ─── SEO Settings Store ─────────────────────────────────────────

export const seoStore = {
  getAll(): SEOSettings[] {
    return getCollection<SEOSettings>("suntrix_seo");
  },

  getByPage(page: string): SEOSettings | undefined {
    return this.getAll().find((s) => s.page === page);
  },

  upsert(page: string, data: Partial<SEOSettings>): SEOSettings {
    const all = this.getAll();
    const idx = all.findIndex((s) => s.page === page);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
      setCollection("suntrix_seo", all);
      return all[idx];
    }
    const item: SEOSettings = {
      id: generateId(),
      page,
      title: data.title || "",
      description: data.description || "",
      keywords: data.keywords || "",
      ogImage: data.ogImage || "",
      updatedAt: new Date().toISOString(),
    };
    all.push(item);
    setCollection("suntrix_seo", all);
    return item;
  },
};

// ─── Site Content Store (Generic Key-Value) ─────────────────────

export const siteContentStore = {
  getAll(): SiteContent[] {
    return getCollection<SiteContent>("suntrix_site_content");
  },

  get(page: string, section: string, key: string): string {
    const item = this.getAll().find(
      (c) => c.page === page && c.section === section && c.key === key
    );
    return item?.value || "";
  },

  set(page: string, section: string, key: string, value: string, type: SiteContent["type"] = "text"): SiteContent {
    const all = this.getAll();
    const idx = all.findIndex(
      (c) => c.page === page && c.section === section && c.key === key
    );
    if (idx !== -1) {
      all[idx] = { ...all[idx], value, type, updatedAt: new Date().toISOString() };
      setCollection("suntrix_site_content", all);
      return all[idx];
    }
    const item: SiteContent = {
      id: generateId(),
      section,
      key,
      value,
      type,
      page,
      updatedAt: new Date().toISOString(),
    };
    all.push(item);
    setCollection("suntrix_site_content", all);
    return item;
  },
};
