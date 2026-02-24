/**
 * LocalStorage Data Store
 * 
 * Drop-in replacement for backend API calls during development.
 * When backend is ready, replace store calls with apiRequest() calls.
 * Data is structured to match MongoDB document schema.
 */

// ─── Types ──────────────────────────────────────────────────────

export interface TaskRequest {
  id: string;
  name: string;
  email: string;
  company: string;
  service: string;
  budget: string;
  timeline: string;
  description: string;
  status: "new" | "in_review" | "proposal_sent" | "in_progress" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AdminUser {
  id: string;
  email: string;
  password: string; // In prod, this would be hashed
  name: string;
  role: "admin" | "viewer";
}

export interface DashboardStats {
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  totalContacts: number;
  unreadContacts: number;
  revenue: number;
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

// ─── Task Requests ──────────────────────────────────────────────

export const taskStore = {
  getAll(): TaskRequest[] {
    return getCollection<TaskRequest>("suntrix_tasks");
  },

  getById(id: string): TaskRequest | undefined {
    return this.getAll().find((t) => t.id === id);
  },

  create(data: Omit<TaskRequest, "id" | "status" | "createdAt" | "updatedAt">): TaskRequest {
    const task: TaskRequest = {
      ...data,
      id: generateId(),
      status: "new",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const all = this.getAll();
    all.unshift(task);
    setCollection("suntrix_tasks", all);
    return task;
  },

  update(id: string, updates: Partial<TaskRequest>): TaskRequest | null {
    const all = this.getAll();
    const idx = all.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    setCollection("suntrix_tasks", all);
    return all[idx];
  },

  delete(id: string): boolean {
    const all = this.getAll();
    const filtered = all.filter((t) => t.id !== id);
    if (filtered.length === all.length) return false;
    setCollection("suntrix_tasks", filtered);
    return true;
  },
};

// ─── Contact Messages ───────────────────────────────────────────

export const contactStore = {
  getAll(): ContactMessage[] {
    return getCollection<ContactMessage>("suntrix_contacts");
  },

  create(data: Omit<ContactMessage, "id" | "read" | "createdAt">): ContactMessage {
    const msg: ContactMessage = {
      ...data,
      id: generateId(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    const all = this.getAll();
    all.unshift(msg);
    setCollection("suntrix_contacts", all);
    return msg;
  },

  markRead(id: string): void {
    const all = this.getAll();
    const idx = all.findIndex((m) => m.id === id);
    if (idx !== -1) {
      all[idx].read = true;
      setCollection("suntrix_contacts", all);
    }
  },

  delete(id: string): boolean {
    const all = this.getAll();
    const filtered = all.filter((m) => m.id !== id);
    if (filtered.length === all.length) return false;
    setCollection("suntrix_contacts", filtered);
    return true;
  },
};

// ─── Chat History ───────────────────────────────────────────────

export const chatStore = {
  getHistory(): ChatMessage[] {
    return getCollection<ChatMessage>("suntrix_chat");
  },

  addMessage(role: "user" | "assistant", content: string): ChatMessage {
    const msg: ChatMessage = {
      id: generateId(),
      role,
      content,
      timestamp: new Date().toISOString(),
    };
    const all = this.getHistory();
    all.push(msg);
    setCollection("suntrix_chat", all);
    return msg;
  },

  clear(): void {
    localStorage.removeItem("suntrix_chat");
  },
};

// ─── Admin Auth ─────────────────────────────────────────────────

export const authStore = {
  init(): void {
    const users = getCollection<AdminUser>("suntrix_admins");
    if (users.length === 0) {
      setCollection("suntrix_admins", [
        {
          id: "admin_1",
          email: "admin@suntrix.com",
          password: "admin123",
          name: "Admin",
          role: "admin",
        },
      ]);
    }
  },

  login(email: string, password: string): AdminUser | null {
    this.init();
    const users = getCollection<AdminUser>("suntrix_admins");
    const user = users.find((u) => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem("suntrix_admin_session", JSON.stringify(user));
      return user;
    }
    return null;
  },

  logout(): void {
    localStorage.removeItem("suntrix_admin_session");
  },

  getSession(): AdminUser | null {
    try {
      const session = localStorage.getItem("suntrix_admin_session");
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  },
};

// ─── Dashboard Stats ────────────────────────────────────────────

export const statsStore = {
  getStats(): DashboardStats {
    const tasks = taskStore.getAll();
    const contacts = contactStore.getAll();
    return {
      totalTasks: tasks.length,
      pendingTasks: tasks.filter((t) => t.status === "new" || t.status === "in_review").length,
      completedTasks: tasks.filter((t) => t.status === "completed").length,
      totalContacts: contacts.length,
      unreadContacts: contacts.filter((c) => !c.read).length,
      revenue: tasks.filter((t) => t.status === "completed").length * 15000,
    };
  },
};

// ─── Newsletter ─────────────────────────────────────────────────

export const newsletterStore = {
  subscribe(email: string): boolean {
    const subs = getCollection<{ email: string; date: string }>("suntrix_newsletter");
    if (subs.find((s) => s.email === email)) return false;
    subs.push({ email, date: new Date().toISOString() });
    setCollection("suntrix_newsletter", subs);
    return true;
  },

  getAll(): { email: string; date: string }[] {
    return getCollection("suntrix_newsletter");
  },
};
