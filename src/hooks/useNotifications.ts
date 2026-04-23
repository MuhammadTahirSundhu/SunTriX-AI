import { useState, useEffect } from "react";
import { apiRequest, ENDPOINTS } from "../lib/api";

export interface NotificationsData {
  newTasks: number;
  unreadMessages: number;
  newSubscribers: number;
  total: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationsData>({
    newTasks: 0,
    unreadMessages: 0,
    newSubscribers: 0,
    total: 0,
  });

  const fetchNotifications = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      const { data } = await apiRequest<NotificationsData>(
        `${(import.meta.env.VITE_API_URL as string) || "http://localhost:4000/v1"}/admin/notifications`
      );
      if (data) {
        setNotifications({
          newTasks: data.newTasks || 0,
          unreadMessages: data.unreadMessages || 0,
          newSubscribers: data.newSubscribers || 0,
          total: (data.newTasks || 0) + (data.unreadMessages || 0) + (data.newSubscribers || 0),
        });
      }
    } catch {
      // Silently fail — notifications are non-critical
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000); // poll every 60s
    return () => clearInterval(interval);
  }, []);

  return notifications;
}
