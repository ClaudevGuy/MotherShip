import type { CostBreakdown, AgentCost, Budget, Invoice } from "@/types/costs";
import type { TimeSeriesPoint } from "@/types/common";
import { generateTimeSeries } from "./generators";

export const seedCostBreakdown: CostBreakdown[] = [
  {
    category: "AI APIs",
    total: 2847,
    subcategories: [
      { name: "Anthropic (Claude)", amount: 1420, trend: 8.2 },
      { name: "OpenAI (GPT-4)", amount: 980, trend: -3.1 },
      { name: "Google (Gemini)", amount: 234, trend: 12.4 },
      { name: "Embeddings & Fine-tuning", amount: 213, trend: 5.7 },
    ],
  },
  {
    category: "Infrastructure",
    total: 1245,
    subcategories: [
      { name: "AWS Compute (EC2/ECS)", amount: 567, trend: 2.1 },
      { name: "AWS Database (RDS)", amount: 312, trend: -1.4 },
      { name: "AWS Storage (S3)", amount: 89, trend: 4.8 },
      { name: "CloudFront CDN", amount: 134, trend: 6.2 },
      { name: "Other AWS Services", amount: 143, trend: 1.9 },
    ],
  },
  {
    category: "Third-Party Services",
    total: 389,
    subcategories: [
      { name: "Vercel Hosting", amount: 120, trend: 0.0 },
      { name: "Datadog Monitoring", amount: 99, trend: 0.0 },
      { name: "PagerDuty", amount: 45, trend: 0.0 },
      { name: "Sentry Error Tracking", amount: 79, trend: 0.0 },
      { name: "Linear Project Management", amount: 46, trend: 0.0 },
    ],
  },
  {
    category: "Labor",
    total: 12000,
    subcategories: [
      { name: "Engineering Team", amount: 8500, trend: 0.0 },
      { name: "DevOps", amount: 2000, trend: 0.0 },
      { name: "Product & Design", amount: 1500, trend: 0.0 },
    ],
  },
];

export const seedAgentCosts: AgentCost[] = [
  { agentId: "agt_y5z6a7b8", agentName: "DataPipelineAgent", costPerRun: 0.062, totalRuns: 3241, totalCost: 892.14, trend: 4.2 },
  { agentId: "agt_e5f6g7h8", agentName: "TestWriter", costPerRun: 0.087, totalRuns: 923, totalCost: 518.42, trend: -2.1 },
  { agentId: "agt_g3h4i5j6", agentName: "InfraMonitor", costPerRun: 0.001, totalRuns: 48720, totalCost: 412.89, trend: 1.3 },
  { agentId: "agt_a1b2c3d4", agentName: "CodeReviewer", costPerRun: 0.045, totalRuns: 1847, totalCost: 342.18, trend: 6.8 },
  { agentId: "agt_i9j0k1l2", agentName: "DocGenerator", costPerRun: 0.108, totalRuns: 412, totalCost: 287.93, trend: -5.4 },
  { agentId: "agt_k7l8m9n0", agentName: "DeployBot", costPerRun: 0.042, totalRuns: 834, totalCost: 234.67, trend: 3.7 },
  { agentId: "agt_m3n4o5p6", agentName: "SecurityScanner", costPerRun: 0.022, totalRuns: 2134, totalCost: 198.47, trend: -1.2 },
  { agentId: "agt_u1v2w3x4", agentName: "BugHunter", costPerRun: 0.098, totalRuns: 567, totalCost: 156.29, trend: 15.3 },
  { agentId: "agt_q7r8s9t0", agentName: "PerformanceOptimizer", costPerRun: 0.052, totalRuns: 328, totalCost: 124.83, trend: -8.7 },
  { agentId: "agt_c9d0e1f2", agentName: "APIDesigner", costPerRun: 0.064, totalRuns: 187, totalCost: 78.43, trend: 2.4 },
];

export const seedBudgets: Budget[] = [
  { category: "AI APIs", limit: 3500, spent: 2847, alertThreshold: 80 },
  { category: "Infrastructure", limit: 1500, spent: 1245, alertThreshold: 85 },
  { category: "Third-Party Services", limit: 500, spent: 389, alertThreshold: 90 },
  { category: "Labor", limit: 15000, spent: 12000, alertThreshold: 90 },
];

export const seedInvoices: Invoice[] = [
  { id: "inv_001", date: "2026-03-01", amount: 16481.00, status: "paid" },
  { id: "inv_002", date: "2026-02-01", amount: 15892.34, status: "paid" },
  { id: "inv_003", date: "2026-01-01", amount: 14723.18, status: "paid" },
  { id: "inv_004", date: "2025-12-01", amount: 13987.42, status: "paid" },
  { id: "inv_005", date: "2026-03-15", amount: 2847.00, status: "pending" },
  { id: "inv_006", date: "2026-03-10", amount: 1245.00, status: "overdue" },
];

export const seedDailyCosts: TimeSeriesPoint[] = generateTimeSeries(30, 420, 620, "up");
