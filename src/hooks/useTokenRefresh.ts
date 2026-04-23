import { useEffect, useRef } from "react";
import { apiRequest, ENDPOINTS } from "../lib/api";

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function useTokenRefresh() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const check = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      const payload = parseJwt(token);
      if (!payload?.exp) return;
      const expiresInMs = payload.exp * 1000 - Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (expiresInMs < twentyFourHours && expiresInMs > 0) {
        const { data } = await apiRequest<{ token: string }>(ENDPOINTS.AUTH_ME, { method: "GET" });
        if (data && (data as any).token) {
          localStorage.setItem("auth_token", (data as any).token);
        }
      }
    };

    check();
    intervalRef.current = setInterval(check, 60 * 60 * 1000); // every hour
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
}
