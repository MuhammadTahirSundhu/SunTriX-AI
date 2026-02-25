# SunTriX — AI Engineering Agency Website

> **Engineering Intelligence That Perceives, Reasons, and Acts**

A modern, premium, fully dynamic company website with a powerful Admin Dashboard (CMS) that controls all website content.

---

## 🏗️ Project Structure

```
src/
├── assets/                    # Static images, icons, brand assets
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   ├── AIChatbot.tsx          # Floating AI chatbot widget
│   ├── AnnouncementBar.tsx    # Dynamic top announcement bar
│   ├── CTASection.tsx         # Homepage call-to-action
│   ├── DepartmentsSection.tsx # Service departments grid
│   ├── Footer.tsx             # Global footer
│   ├── HeroSection.tsx        # Dynamic hero (reads from CMS)
│   ├── HowWeWorkSection.tsx   # Process steps
│   ├── Layout.tsx             # Page wrapper (Navbar + Footer + Chatbot)
│   ├── Navbar.tsx             # Navigation bar
│   ├── ServicePageTemplate.tsx# Reusable service page layout
│   ├── SocialProofBar.tsx     # Client logos marquee
│   ├── TechStackSection.tsx   # Technology grid
│   └── TestimonialsSection.tsx# Dynamic testimonials carousel
├── hooks/                     # Custom React hooks
├── lib/
│   ├── api.ts                 # ⭐ ALL backend API endpoints (central)
│   ├── cms-store.ts           # ⭐ CMS content stores (localStorage)
│   ├── store.ts               # Task/contact/chat/auth stores
│   └── utils.ts               # Utility functions
├── pages/
│   ├── admin/
│   │   ├── AdminLayout.tsx    # Admin shell with sidebar
│   │   ├── AdminLogin.tsx     # Admin authentication
│   │   ├── AdminDashboard.tsx # Analytics overview
│   │   ├── AdminTasks.tsx     # Task request management
│   │   ├── AdminMessages.tsx  # Contact message management
│   │   ├── AdminPortfolio.tsx # ⭐ Portfolio CRUD
│   │   ├── AdminContent.tsx   # ⭐ CMS content editor
│   │   ├── AdminNewsletter.tsx# Newsletter subscribers
│   │   └── AdminSettings.tsx  # Admin settings
│   ├── services/              # Individual service pages
│   ├── About.tsx
│   ├── Contact.tsx
│   ├── HowWeWork.tsx
│   ├── Index.tsx              # Homepage
│   ├── Legal.tsx              # Privacy/Terms/Cookies
│   ├── Partnership.tsx
│   ├── Portfolio.tsx          # Dynamic portfolio grid
│   ├── PortfolioDetail.tsx    # ⭐ Project detail + case study
│   ├── RequestTask.tsx        # Project brief form
│   ├── Technologies.tsx
│   └── Testimonials.tsx
└── App.tsx                    # Routes & providers
```

---

## 🔌 Backend Integration Guide

### Current State: localStorage
All data is persisted in `localStorage` via two store files:
- `src/lib/store.ts` — Tasks, contacts, chat, auth, newsletter
- `src/lib/cms-store.ts` — Portfolio, case studies, testimonials, hero content, announcement bar, company info, SEO

### Migration to Node.js + MongoDB

**Step 1: Update `src/lib/api.ts`**
```typescript
// Change this line:
const BASE_URL = "";
// To your backend:
const BASE_URL = "https://api.suntrix.com/v1";
```

**Step 2: Replace store calls with API calls**
```typescript
// Before (localStorage):
import { portfolioStore } from "@/lib/cms-store";
const projects = portfolioStore.getPublished();

// After (API):
import { apiRequest, ENDPOINTS } from "@/lib/api";
const { data: projects } = await apiRequest(ENDPOINTS.PORTFOLIO_LIST);
```

**Step 3: Add Cloudinary for assets**
```typescript
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/YOUR_CLOUD/upload";
```

### All API Endpoints (defined in `src/lib/api.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | Admin login |
| `/auth/me` | GET | Current user |
| `/portfolio` | GET/POST | List/Create projects |
| `/portfolio/:id` | PUT/DELETE | Update/Delete project |
| `/portfolio/slug/:slug` | GET | Get by slug |
| `/case-studies` | GET/POST | List/Create case studies |
| `/case-studies/slug/:slug` | GET | Get by slug |
| `/testimonials` | GET/POST | List/Create testimonials |
| `/contact` | POST | Submit contact form |
| `/task-requests` | GET/POST | List/Submit task briefs |
| `/chat` | POST | AI chatbot message |
| `/newsletter` | POST | Subscribe email |
| `/cms/hero` | GET/PUT | Hero section content |
| `/cms/announcement` | GET/PUT | Announcement bar |
| `/cms/company` | GET/PUT | Company info |
| `/cms/seo/:page` | GET/PUT | SEO settings per page |
| `/upload/image` | POST | Cloudinary image upload |
| `/upload/video` | POST | Cloudinary video upload |

---

## 📊 Required Database Schemas (MongoDB)

### Portfolio Projects
```json
{
  "title": "string",
  "slug": "string (unique)",
  "category": "string",
  "description": "string",
  "shortDescription": "string",
  "metric": "string",
  "metricLabel": "string",
  "coverImage": "string (Cloudinary URL)",
  "images": ["string"],
  "videoUrl": "string",
  "tags": ["string"],
  "tools": [{ "name": "string", "icon": "string" }],
  "clientName": "string",
  "industry": "string",
  "highlights": ["string"],
  "status": "published | draft",
  "featured": "boolean",
  "order": "number"
}
```

### Case Studies
```json
{
  "projectId": "ObjectId (ref: Portfolio)",
  "slug": "string",
  "challenge": "string",
  "solution": "string",
  "results": "string",
  "galleryImages": ["string"],
  "videoUrl": "string",
  "toolsUsed": [{ "name": "string", "icon": "string" }],
  "keyMetrics": [{ "label": "string", "value": "string", "description": "string" }],
  "testimonial": { "quote": "string", "name": "string", "role": "string" },
  "status": "published | draft"
}
```

### Testimonials
```json
{
  "quote": "string",
  "name": "string",
  "role": "string",
  "company": "string",
  "avatar": "string (Cloudinary URL)",
  "rating": "number (1-5)",
  "featured": "boolean",
  "status": "published | draft"
}
```

### Task Requests
```json
{
  "name": "string",
  "email": "string",
  "company": "string",
  "service": "string",
  "budget": "string",
  "timeline": "string",
  "description": "string",
  "status": "new | in_review | proposal_sent | in_progress | completed | cancelled"
}
```

---

## 🚀 Deployment

### Development
```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
npm run dev
```

### Production Build
```sh
npm run build
# Output in dist/ — deploy to Vercel, Netlify, or any static host
```

### Admin Access
- URL: `/admin/login`
- Default: `admin@suntrix.com` / `admin123`

---

## 🎨 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **State**: React Query + localStorage (swap to API)
- **Planned Backend**: Node.js + Express + MongoDB Atlas
- **Planned Assets**: Cloudinary CDN
