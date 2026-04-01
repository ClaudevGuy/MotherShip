import { create } from "zustand";
import { relativeTimestamp } from "@/data/generators";

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

interface NotificationsStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  getUnreadCount: () => number;
}

const initialNotifications: Notification[] = [
  { id: "ntf_001", type: "error", title: "P1 Incident: API Gateway Outage", message: "API gateway health check failed. Error rate at 47%.", timestamp: relativeTimestamp(120), read: false, actionUrl: "/incidents" },
  { id: "ntf_002", type: "success", title: "Deployment Complete", message: "api-gateway v2.14.2 deployed to production successfully.", timestamp: relativeTimestamp(45), read: false, actionUrl: "/deployments" },
  { id: "ntf_003", type: "warning", title: "BugHunter Agent Error", message: "Context window exceeded. Agent needs attention.", timestamp: relativeTimestamp(45), read: false, actionUrl: "/agents" },
  { id: "ntf_004", type: "info", title: "Deployment In Progress", message: "api-gateway v2.14.3 canary at 10% traffic.", timestamp: relativeTimestamp(8), read: false, actionUrl: "/deployments" },
  { id: "ntf_005", type: "warning", title: "Budget Alert", message: "AI APIs spend at 81% of monthly budget ($2,847 / $3,500).", timestamp: relativeTimestamp(60), read: true, actionUrl: "/costs" },
  { id: "ntf_006", type: "success", title: "Security Scan Clear", message: "SecurityScanner found no new vulnerabilities in latest scan.", timestamp: relativeTimestamp(16), read: true },
  { id: "ntf_007", type: "info", title: "New Team Member", message: "Emily Rodriguez has been added as a viewer.", timestamp: relativeTimestamp(180), read: true, actionUrl: "/team" },
  { id: "ntf_008", type: "warning", title: "Elevated Search Latency", message: "Search P95 latency at 890ms, exceeding 500ms threshold.", timestamp: relativeTimestamp(4320), read: true, actionUrl: "/incidents" },
];

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  notifications: initialNotifications,

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: `ntf_${Date.now()}`,
          timestamp: new Date().toISOString(),
          read: false,
        },
        ...state.notifications,
      ],
    })),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.read).length;
  },
}));
