import { useState, useEffect } from "react";

export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

const TOKEN_KEY = "suntrix_auth_token";
const USER_KEY = "suntrix_auth_user";

class AuthManager {
  private state: AuthState = {
    token: localStorage.getItem(TOKEN_KEY),
    user: this.loadUser(),
    isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
  };

  private listeners = new Set<() => void>();

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public getState(): AuthState {
    return { ...this.state };
  }

  public getToken(): string | null {
    return this.state.token;
  }

  public getUser(): User | null {
    return this.state.user;
  }

  public isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  public login(token: string, user: User) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.state = { token, user, isAuthenticated: true };
    this.notify();
  }

  public logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.state = { token: null, user: null, isAuthenticated: false };
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }
}

export const authManager = new AuthManager();

export function useAuth() {
  const [state, setState] = useState<AuthState>(authManager.getState());

  useEffect(() => {
    return authManager.subscribe(() => {
      setState(authManager.getState());
    });
  }, []);

  return {
    ...state,
    login: (token: string, user: User) => authManager.login(token, user),
    logout: () => authManager.logout(),
  };
}
