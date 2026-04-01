import { create } from "zustand";
import type { ResourceMetric, ServiceNode, APIEndpoint, QueueMetric } from "@/types/infrastructure";
import { seedResourceMetrics, seedServiceNodes, seedAPIEndpoints, seedQueueMetrics } from "@/data/infrastructure";
import { jitter } from "@/data/generators";

interface InfrastructureStore {
  resources: ResourceMetric[];
  services: ServiceNode[];
  endpoints: APIEndpoint[];
  queues: QueueMetric[];
  updateServiceStatus: (id: string, status: "healthy" | "degraded" | "down") => void;
  simulateTick: () => void;
}

export const useInfrastructureStore = create<InfrastructureStore>((set) => ({
  resources: seedResourceMetrics,
  services: seedServiceNodes,
  endpoints: seedAPIEndpoints,
  queues: seedQueueMetrics,

  updateServiceStatus: (id, status) =>
    set((state) => ({
      services: state.services.map((s) =>
        s.id === id ? { ...s, status } : s
      ),
    })),

  simulateTick: () =>
    set((state) => ({
      resources: state.resources.map((r) => ({
        ...r,
        value: Math.min(r.max, Math.max(0, parseFloat(jitter(r.value, 2).toFixed(1)))),
        trend: parseFloat(jitter(r.trend, 20).toFixed(1)),
      })),
      services: state.services.map((s) => ({
        ...s,
        latency: Math.max(1, Math.round(jitter(s.latency, 5))),
      })),
      endpoints: state.endpoints.map((e) => ({
        ...e,
        p50: Math.max(1, Math.round(jitter(e.p50, 3))),
        p95: Math.max(1, Math.round(jitter(e.p95, 5))),
        p99: Math.max(1, Math.round(jitter(e.p99, 5))),
        rps: Math.max(0, Math.round(jitter(e.rps, 8))),
        errorRate: Math.max(0, parseFloat(jitter(e.errorRate, 10).toFixed(1))),
      })),
      queues: state.queues.map((q) => ({
        ...q,
        depth: Math.max(0, Math.round(jitter(q.depth, 10))),
        processingRate: Math.max(0, Math.round(jitter(q.processingRate, 5))),
      })),
    })),
}));
