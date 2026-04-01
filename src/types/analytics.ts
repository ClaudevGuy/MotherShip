import type { TimeSeriesPoint } from "./common";

export interface AnalyticsData {
  dau: TimeSeriesPoint[];
  wau: TimeSeriesPoint[];
  mau: TimeSeriesPoint[];
  retention: number[][];
  geoData: { country: string; users: number }[];
  featureUsage: { feature: string; usage: number; trend: number }[];
  conversionFunnel: { stage: string; count: number }[];
  growthMetrics: { metric: string; current: number; previous: number; data: TimeSeriesPoint[] }[];
}
