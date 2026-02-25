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
 */

// Change this to your backend URL when ready (e.g., "https://api.suntrix.com/v1")
const BASE_URL = "";

// Cloudinary config (update when ready)
const CLOUDINARY_URL = "";

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

  // AI Chatbot
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
  SITE_CONTENT: `${BASE_URL}/cms/content`,
  HERO_CONTENT: `${BASE_URL}/cms/hero`,
  ANNOUNCEMENT: `${BASE_URL}/cms/announcement`,
  COMPANY_INFO: `${BASE_URL}/cms/company`,
  SEO_SETTINGS: `${BASE_URL}/cms/seo`,
  SEO_BY_PAGE: (page: string) => `${BASE_URL}/cms/seo/${page}`,

  // Admin
  ADMIN_DASHBOARD_STATS: `${BASE_URL}/admin/stats`,
  ADMIN_TASKS: `${BASE_URL}/admin/tasks`,
  ADMIN_CONTACTS: `${BASE_URL}/admin/contacts`,
  ADMIN_USERS: `${BASE_URL}/admin/users`,

  // Assets (Cloudinary)
  UPLOAD_IMAGE: `${CLOUDINARY_URL || BASE_URL}/upload/image`,
  UPLOAD_VIDEO: `${CLOUDINARY_URL || BASE_URL}/upload/video`,
  UPLOAD_DELETE: (publicId: string) => `${BASE_URL}/upload/${publicId}`,
} as const;

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

  // If no BASE_URL, we're in localStorage mode — return null
  if (!BASE_URL) {
    return { data: null, error: "API not configured — using local storage" };
  }

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
