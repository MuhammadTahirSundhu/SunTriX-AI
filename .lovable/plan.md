

## Plan: Portfolio Enhancements, Social Branding, Agency Intro Video, and Grok Chatbot Integration

### 1. Portfolio Thumbnail + Video Fields in Admin and Frontend

**Data model changes** (`src/lib/cms-store.ts`):
- Add `thumbnailImage: string` field to `PortfolioProject` interface (separate from `coverImage`)
- `videoUrl` already exists -- will be used as the project demo video

**Admin Portfolio** (`src/pages/admin/AdminPortfolio.tsx`):
- Add "Thumbnail Image URL" input field to the project edit modal
- Add "Demo Video URL" input field (already exists, just ensure it's prominent and labeled clearly)
- Portfolio card grid in admin will show thumbnail as the card preview image

**Portfolio page** (`src/pages/Portfolio.tsx`):
- Each portfolio card uses `thumbnailImage` (fallback to `coverImage`) as the card visual

**Portfolio Detail page** (`src/pages/PortfolioDetail.tsx`):
- Restructure layout: move the video demo section ABOVE the "Key Highlights" and "Tools & Stack" sections
- If `videoUrl` exists, show a prominent video player embed; otherwise show `coverImage`

**Service pages** (`src/components/ServicePageTemplate.tsx` + individual service pages):
- Add a "Related Portfolio" section at the bottom of each service page that filters published portfolio projects by matching category (e.g., Agentic AI page shows only "Agentic AI" category projects)

---

### 2. Social Accounts & Freelance Platform Branding

**Data model** (`src/lib/cms-store.ts`):
- Extend `CompanyInfo.socialLinks` to support platforms: LinkedIn, Twitter/X, GitHub, YouTube, Instagram, Upwork, Fiverr -- each with `platform`, `url`, and `enabled` fields

**Admin Content** (`src/pages/admin/AdminContent.tsx`):
- Add a "Social & Freelance Profiles" section under Company Info tab where admin can set URLs for each platform and toggle visibility

**Frontend** (`src/components/Footer.tsx`):
- Replace hardcoded `#` links with dynamic social links from `companyStore`
- Add Upwork and Fiverr icons/badges with proper branding

**New component**: A "Find Us On" / social proof strip that can appear on the homepage or About page showing all active social platform badges

**API endpoints** (`src/lib/api.ts`):
- Add `SOCIAL_LINKS: ${BASE_URL}/cms/social-links` endpoint

---

### 3. Agency Introduction Video

**Data model** (`src/lib/cms-store.ts`):
- Add `introVideoUrl: string` and `introVideoEnabled: boolean` to `CompanyInfo`

**Admin Content** (`src/pages/admin/AdminContent.tsx`):
- Add "Agency Intro Video" field under Company Info with URL input and enable/disable toggle

**Frontend placement**: Add a new `AgencyIntroVideo` component placed on the homepage between the DepartmentsSection and HowWeWorkSection -- a cinematic full-width video section with a play button overlay

**Media store**: Register `agency-intro-video` as a media key so it's also manageable from Admin Media

**API endpoints** (`src/lib/api.ts`):
- Add `INTRO_VIDEO: ${BASE_URL}/cms/intro-video` endpoint

---

### 4. Grok API Integration for Chatbot + API Documentation

**API file update** (`src/lib/api.ts`):
- Add Grok-specific configuration block:
  ```
  GROK_API_URL = "https://api.x.ai/v1"
  GROK_API_KEY = "" // Set at backend integration time
  ```
- Add endpoints:
  ```
  CHAT_SEND: ${GROK_API_URL}/chat/completions  (or ${BASE_URL}/chat for proxied)
  ```
- Add detailed migration comments explaining:
  - Grok uses OpenAI-compatible API format
  - Model: `grok-3` or `grok-3-mini` (free tier)
  - Backend should proxy requests through Node.js to keep API key server-side
  - Request/response format documentation inline

**Chatbot update** (`src/components/AIChatbot.tsx`):
- Keep current preset-response logic as the localStorage fallback
- Add a clearly documented code path for when `BASE_URL` is set: call `apiRequest(ENDPOINTS.CHAT_SEND, { method: "POST", body: { messages } })` using the OpenAI-compatible format
- Add comments showing exact Grok API payload structure

**README.md update**:
- Add "AI Chatbot (Grok)" section documenting:
  - Grok API endpoint and model names
  - Required env vars (`GROK_API_KEY`)
  - Backend proxy pattern (Node.js route that forwards to x.ai)
  - Request/response schema

---

### Technical Details

**Files to create:**
- `src/components/AgencyIntroVideo.tsx` -- cinematic intro video section
- `src/components/SocialBranding.tsx` -- social/freelance platform badges strip

**Files to modify:**
- `src/lib/cms-store.ts` -- add `thumbnailImage` to portfolio, extend `CompanyInfo` with social links and intro video
- `src/lib/api.ts` -- add Grok config, social links endpoint, intro video endpoint
- `src/pages/admin/AdminPortfolio.tsx` -- add thumbnail field to edit modal
- `src/pages/admin/AdminContent.tsx` -- add social links manager and intro video field
- `src/pages/Portfolio.tsx` -- use thumbnail for cards
- `src/pages/PortfolioDetail.tsx` -- move video above highlights/tools
- `src/components/ServicePageTemplate.tsx` -- add filtered portfolio section
- `src/components/AIChatbot.tsx` -- add Grok API integration path
- `src/components/Footer.tsx` -- dynamic social links from store
- `src/pages/Index.tsx` -- add AgencyIntroVideo component
- `README.md` -- add Grok chatbot and social links documentation

