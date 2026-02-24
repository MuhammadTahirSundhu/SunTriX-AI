/**
 * Centralized API Endpoints
 * 
 * All backend endpoints are defined here. When migrating to Node.js + MongoDB,
 * simply update the BASE_URL and endpoint paths. All components import from this file.
 */

// Change this to your backend URL when ready (e.g., "https://api.suntrix.com/v1")
const BASE_URL = "";

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

  // Portfolio
  PORTFOLIO_LIST: `${BASE_URL}/portfolio`,
  PORTFOLIO_BY_ID: (id: string) => `${BASE_URL}/portfolio/${id}`,

  // Testimonials
  TESTIMONIALS_LIST: `${BASE_URL}/testimonials`,

  // Newsletter
  NEWSLETTER_SUBSCRIBE: `${BASE_URL}/newsletter`,

  // Admin
  ADMIN_DASHBOARD_STATS: `${BASE_URL}/admin/stats`,
  ADMIN_TASKS: `${BASE_URL}/admin/tasks`,
  ADMIN_CONTACTS: `${BASE_URL}/admin/contacts`,
  ADMIN_USERS: `${BASE_URL}/admin/users`,

  // Assets (Cloudinary)
  UPLOAD_IMAGE: `${BASE_URL}/upload/image`,
  UPLOAD_VIDEO: `${BASE_URL}/upload/video`,
} as const;

// ─── HTTP Client ─────────────────────────────────────────────────
// Wrapper around fetch. When backend is ready, this handles auth headers, etc.
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
