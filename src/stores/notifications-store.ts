import { create } from "zustand";
import { apiFetch } from "@/lib/api-client";
import { isFresh, markFetched, markInflight, invalidate } from "@/lib/store-cache";

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  category?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

interface NotificationsStore {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  getUnreadCount: () => number;
}

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  notifications: [],
  isLoading: false,
  error: null,

  fetch: async () => {
    if (isFresh("notifications")) return;
    markInflight("notifications");
    set({ isLoading: true, error: null });
    try {
      const res = await apiFetch("/api/notifications?limit=50");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const { data } = await res.json();
      markFetched("notifications");
      set({ notifications: data.notifications, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  markAsRead: async (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: "PUT" });
    } catch {
      // silent — local state already updated
    }
  },

  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
    try {
      await apiFetch("/api/notifications/read-all", { method: "POST" });
    } catch {
      // silent
    }
  },

  dismissNotification: async (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
    try {
      await apiFetch(`/api/notifications/${id}`, { method: "DELETE" });
    } catch {
      // silent
    }
  },

  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.read).length;
  },
}));
