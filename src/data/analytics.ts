import type { AnalyticsData } from "@/types/analytics";
import { generateTimeSeries } from "./generators";

export const seedAnalytics: AnalyticsData = {
  dau: generateTimeSeries(30, 800, 1400, "up"),
  wau: generateTimeSeries(30, 3200, 5800, "up"),
  mau: generateTimeSeries(30, 12000, 18000, "up"),

  retention: [
    [100, 68, 52, 41, 35, 31, 28, 26],
    [100, 71, 55, 44, 37, 33, 30, 0],
    [100, 65, 50, 39, 34, 30, 0, 0],
    [100, 72, 56, 45, 38, 0, 0, 0],
    [100, 69, 53, 42, 0, 0, 0, 0],
    [100, 74, 58, 0, 0, 0, 0, 0],
    [100, 70, 0, 0, 0, 0, 0, 0],
    [100, 0, 0, 0, 0, 0, 0, 0],
  ],

  geoData: [
    { country: "United States", users: 8420 },
    { country: "United Kingdom", users: 2140 },
    { country: "Germany", users: 1580 },
    { country: "Canada", users: 1320 },
    { country: "Australia", users: 890 },
    { country: "France", users: 720 },
    { country: "Japan", users: 540 },
    { country: "Brazil", users: 480 },
    { country: "India", users: 410 },
    { country: "Netherlands", users: 340 },
  ],

  featureUsage: [
    { feature: "Claim Search", usage: 89, trend: 4.2 },
    { feature: "Dashboard", usage: 84, trend: 12.1 },
    { feature: "Batch Processing", usage: 67, trend: 8.7 },
    { feature: "Analytics Reports", usage: 54, trend: 15.3 },
    { feature: "API Integration", usage: 42, trend: 6.4 },
    { feature: "Document Upload", usage: 38, trend: -2.1 },
    { feature: "Notification Settings", usage: 24, trend: 1.8 },
    { feature: "Team Management", usage: 18, trend: 0.4 },
  ],

  conversionFunnel: [
    { stage: "Landing Page", count: 14200 },
    { stage: "Sign Up Started", count: 4890 },
    { stage: "Email Verified", count: 3720 },
    { stage: "First Claim Submitted", count: 2140 },
    { stage: "Paying Customer", count: 1247 },
  ],

  growthMetrics: [
    { metric: "Revenue (MRR)", current: 48200, previous: 42800, data: generateTimeSeries(30, 40000, 50000, "up") },
    { metric: "Active Users", current: 1247, previous: 1089, data: generateTimeSeries(30, 1000, 1300, "up") },
    { metric: "Claims Processed", current: 19847, previous: 16230, data: generateTimeSeries(30, 500, 800, "up") },
    { metric: "Agent Tasks/Day", current: 3420, previous: 2890, data: generateTimeSeries(30, 2500, 3500, "up") },
  ],
};
