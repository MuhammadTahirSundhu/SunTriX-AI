/**
 * Centralized API Endpoints
 * 
 * All backend endpoints are defined here. When migrating to Node.js + MongoDB,
 * simply update the BASE_URL and endpoint paths. All components import from this file.
 * 
 * MIGRATION GUIDE:
 * 1. Set BASE_URL to your backend (e.g., "https://api.suntrix.com/v1")
 * 2. Replace localStorage store calls with apiRequest() calls
 * 3. Update Cloudinary endpoints for asset uploads
 * 4. Set GROK_API_KEY in your backend environment for chatbot
 */

// Backend URL — reads from VITE_API_URL env var in production, falls back to local dev
const BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:4000/v1";

// Cloudinary config (update when ready)
const CLOUDINARY_URL = "";

// ─── Grok AI Configuration ─────────────────────────────────────
// Grok uses an OpenAI-compatible API format (https://api.x.ai/v1)
// The backend should proxy chat requests to Grok to keep the API key server-side.
//
// Models available:
//   - grok-3        (most capable, paid)
//   - grok-3-mini   (free tier, good for most use cases)
//
// Required env vars on backend:
//   GROK_API_KEY=xai-xxxxxxxxxxxxxxxxxxxxxxxx
//
// Backend proxy pattern (Node.js/Express):
//   app.post("/chat", async (req, res) => {
//     const { messages } = req.body;
//     const response = await fetch("https://api.x.ai/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${process.env.GROK_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "grok-3-mini",  // or "grok-3"
//         messages: [
//           { role: "system", content: "You are SunTriX AI assistant..." },
//           ...messages,
//         ],
//         temperature: 0.7,
//         max_tokens: 1024,
//       }),
//     });
//     const data = await response.json();
//     res.json(data);
//   });
//
// Request format (OpenAI-compatible):
//   POST /chat/completions
//   {
//     "model": "grok-3-mini",
//     "messages": [
//       { "role": "system", "content": "..." },
//       { "role": "user", "content": "..." }
//     ],
//     "temperature": 0.7,
//     "max_tokens": 1024,
//     "stream": false
//   }
//
// Response format:
//   {
//     "choices": [{ "message": { "role": "assistant", "content": "..." } }],
//     "usage": { "prompt_tokens": 10, "completion_tokens": 50, "total_tokens": 60 }
//   }

const GROK_API_URL = "https://api.x.ai/v1";

// ─── Endpoint Definitions ─────────────────────────────────────────
export const ENDPOINTS = {
  // Auth
  AUTH_LOGIN: `${BASE_URL}/auth/login`,
  AUTH_REGISTER: `${BASE_URL}/auth/register`,
  AUTH_LOGOUT: `${BASE_URL}/auth/logout`,
  AUTH_ME: `${BASE_URL}/auth/me`,

  // Contact & Requests
  CONTACT_SUBMIT: `${BASE_URL}/contact`,
  TASK_REQUEST_SUBMIT: `${BASE_URL}/task-requests`,
  TASK_REQUEST_LIST: `${BASE_URL}/task-requests`,
  TASK_REQUEST_BY_ID: (id: string) => `${BASE_URL}/task-requests/${id}`,
  TASK_REQUEST_UPDATE: (id: string) => `${BASE_URL}/task-requests/${id}`,

  // AI Chatbot (proxied through backend → Grok API)
  // Backend forwards to: https://api.x.ai/v1/chat/completions
  CHAT_SEND: `${BASE_URL}/chat`,
  CHAT_HISTORY: `${BASE_URL}/chat/history`,

  // Portfolio & Case Studies
  PORTFOLIO_LIST: `${BASE_URL}/portfolio`,
  PORTFOLIO_BY_ID: (id: string) => `${BASE_URL}/portfolio/${id}`,
  PORTFOLIO_BY_SLUG: (slug: string) => `${BASE_URL}/portfolio/slug/${slug}`,
  PORTFOLIO_CREATE: `${BASE_URL}/portfolio`,
  PORTFOLIO_UPDATE: (id: string) => `${BASE_URL}/portfolio/${id}`,
  PORTFOLIO_DELETE: (id: string) => `${BASE_URL}/portfolio/${id}`,

  CASE_STUDY_LIST: `${BASE_URL}/case-studies`,
  CASE_STUDY_BY_SLUG: (slug: string) => `${BASE_URL}/case-studies/slug/${slug}`,
  CASE_STUDY_CREATE: `${BASE_URL}/case-studies`,
  CASE_STUDY_UPDATE: (id: string) => `${BASE_URL}/case-studies/${id}`,
  CASE_STUDY_DELETE: (id: string) => `${BASE_URL}/case-studies/${id}`,

  // Testimonials
  TESTIMONIALS_LIST: `${BASE_URL}/testimonials`,
  TESTIMONIALS_CREATE: `${BASE_URL}/testimonials`,
  TESTIMONIALS_UPDATE: (id: string) => `${BASE_URL}/testimonials/${id}`,
  TESTIMONIALS_DELETE: (id: string) => `${BASE_URL}/testimonials/${id}`,

  // Newsletter
  NEWSLETTER_SUBSCRIBE: `${BASE_URL}/newsletter`,
  NEWSLETTER_LIST: `${BASE_URL}/newsletter`,

  // CMS Content
  CMS_ANNOUNCEMENT: `${BASE_URL}/cms/announcement`,
  CMS_HERO: `${BASE_URL}/cms/hero`,
  CMS_COMPANY: `${BASE_URL}/cms/company`,
  CMS_SOCIAL_LINKS: `${BASE_URL}/cms/social-links`,
  CMS_INTRO_VIDEO: `${BASE_URL}/cms/intro-video`,
  CMS_SEO_BY_PAGE: (page: string) => `${BASE_URL}/cms/seo/${page}`,

  // Departments
  DEPARTMENTS_LIST: `${BASE_URL}/departments`,
  DEPARTMENTS_CREATE: `${BASE_URL}/departments`,
  DEPARTMENTS_UPDATE: (id: string) => `${BASE_URL}/departments/${id}`,
  DEPARTMENTS_DELETE: (id: string) => `${BASE_URL}/departments/${id}`,

  // Admin
  ADMIN_DASHBOARD_STATS: `${BASE_URL}/admin/stats`,
  ADMIN_TASKS: `${BASE_URL}/task-requests`,
  ADMIN_CONTACTS: `${BASE_URL}/contact`,
  ADMIN_USERS: `${BASE_URL}/admin/users`,

  // Assets (Cloudinary via backend)
  UPLOAD_IMAGE: `${BASE_URL}/upload/image`,
  UPLOAD_VIDEO: `${BASE_URL}/upload/video`,
  UPLOAD_DELETE: (publicId: string) => `${BASE_URL}/upload/${publicId}`,
} as const;

// ─── Grok Chat Helper Types ──────────────────────────────────────

export interface GrokChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GrokChatRequest {
  model: string;
  messages: GrokChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface GrokChatResponse {
  choices: { message: { role: string; content: string } }[];
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

// ─── HTTP Client ─────────────────────────────────────────────────
interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<{ data: T | null; error: string | null }> {
  const { method = "GET", body, headers = {} } = options;

  try {
    const token = localStorage.getItem("auth_token");
    const res = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Request failed" }));
      return { data: null, error: err.message || `Error ${res.status}` };
    }

    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Network error" };
  }
}
