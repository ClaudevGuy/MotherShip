import { create } from "zustand";
import type { AnalyticsData } from "@/types/analytics";
import { seedAnalytics } from "@/data/analytics";

interface AnalyticsStore {
  data: AnalyticsData;
  activeMetric: "dau" | "wau" | "mau";
  dateRange: "7d" | "14d" | "30d" | "90d";
  setActiveMetric: (metric: "dau" | "wau" | "mau") => void;
  setDateRange: (range: "7d" | "14d" | "30d" | "90d") => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  data: seedAnalytics,
  activeMetric: "dau",
  dateRange: "30d",

  setActiveMetric: (metric) => set({ activeMetric: metric }),
  setDateRange: (range) => set({ dateRange: range }),
}));
