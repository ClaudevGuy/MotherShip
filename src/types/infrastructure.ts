import type { HealthStatus } from "./common";

export interface ResourceMetric {
  label: string;
  value: number;
  max: number;
  unit: string;
  trend: number;
}

export interface ServiceNode {
  id: string;
  name: string;
  status: HealthStatus;
  type: "api" | "worker" | "database" | "cache" | "queue" | "cdn";
  connections: string[];
  latency: number;
}

export interface APIEndpoint {
  path: string;
  method: string;
  p50: number;
  p95: number;
  p99: number;
  errorRate: number;
  rps: number;
  status: HealthStatus;
}

export interface QueueMetric {
  name: string;
  depth: number;
  processingRate: number;
  dlqCount: number;
}
