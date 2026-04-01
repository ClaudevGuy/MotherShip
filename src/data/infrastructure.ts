import type { ResourceMetric, ServiceNode, APIEndpoint, QueueMetric } from "@/types/infrastructure";

export const seedResourceMetrics: ResourceMetric[] = [
  { label: "CPU Usage", value: 44.7, max: 100, unit: "%", trend: -2.3 },
  { label: "Memory", value: 62.1, max: 100, unit: "%", trend: 1.8 },
  { label: "Storage", value: 34.2, max: 100, unit: "%", trend: 0.4 },
  { label: "Network I/O", value: 28.4, max: 100, unit: "%", trend: -0.7 },
];

export const seedServiceNodes: ServiceNode[] = [
  { id: "svc_api", name: "API Gateway", status: "healthy", type: "api", connections: ["svc_cache", "svc_db", "svc_queue", "svc_auth"], latency: 45 },
  { id: "svc_auth", name: "Auth Service", status: "healthy", type: "api", connections: ["svc_db", "svc_cache"], latency: 32 },
  { id: "svc_worker", name: "Worker Service", status: "healthy", type: "worker", connections: ["svc_db", "svc_queue", "svc_cache"], latency: 120 },
  { id: "svc_db", name: "PostgreSQL", status: "healthy", type: "database", connections: [], latency: 8 },
  { id: "svc_cache", name: "Redis Cluster", status: "healthy", type: "cache", connections: [], latency: 2 },
  { id: "svc_queue", name: "RabbitMQ", status: "healthy", type: "queue", connections: [], latency: 5 },
  { id: "svc_cdn", name: "CloudFront CDN", status: "healthy", type: "cdn", connections: ["svc_api"], latency: 12 },
  { id: "svc_analytics", name: "Analytics Worker", status: "degraded", type: "worker", connections: ["svc_db", "svc_queue"], latency: 340 },
];

export const seedAPIEndpoints: APIEndpoint[] = [
  { path: "/api/v2/claims", method: "GET", p50: 45, p95: 120, p99: 340, errorRate: 0.2, rps: 342, status: "healthy" },
  { path: "/api/v2/claims", method: "POST", p50: 89, p95: 210, p99: 580, errorRate: 0.8, rps: 67, status: "healthy" },
  { path: "/api/v2/claims/:id", method: "GET", p50: 32, p95: 78, p99: 190, errorRate: 0.1, rps: 891, status: "healthy" },
  { path: "/api/v2/auth/login", method: "POST", p50: 120, p95: 280, p99: 620, errorRate: 1.2, rps: 156, status: "healthy" },
  { path: "/api/v2/auth/refresh", method: "POST", p50: 28, p95: 65, p99: 140, errorRate: 0.3, rps: 234, status: "healthy" },
  { path: "/api/v2/search", method: "GET", p50: 180, p95: 890, p99: 2100, errorRate: 2.1, rps: 78, status: "degraded" },
  { path: "/api/v2/analytics/events", method: "POST", p50: 15, p95: 34, p99: 78, errorRate: 0.1, rps: 2340, status: "healthy" },
  { path: "/api/v2/users/:id", method: "GET", p50: 38, p95: 92, p99: 210, errorRate: 0.4, rps: 456, status: "healthy" },
  { path: "/api/v2/webhooks", method: "POST", p50: 210, p95: 560, p99: 1200, errorRate: 1.8, rps: 34, status: "degraded" },
  { path: "/api/v2/reports/generate", method: "POST", p50: 2400, p95: 5800, p99: 12000, errorRate: 3.4, rps: 12, status: "degraded" },
];

export const seedQueueMetrics: QueueMetric[] = [
  { name: "claim-processing", depth: 142, processingRate: 48, dlqCount: 3 },
  { name: "email-notifications", depth: 23, processingRate: 120, dlqCount: 0 },
  { name: "analytics-events", depth: 8940, processingRate: 2340, dlqCount: 12 },
  { name: "report-generation", depth: 7, processingRate: 2, dlqCount: 1 },
];
