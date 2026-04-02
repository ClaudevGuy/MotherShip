import type { LogLevel } from "./common";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  agentId?: string;
  userId?: string;
  traceId?: string;
  metadata?: Record<string, string>;
}

export interface ErrorGroup {
  id: string;
  message: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  affectedUsers: number;
  stackTrace: string;
  service: string;
}

export interface LLMCall {
  id: string;
  timestamp: string;
  model: string;
  prompt: string;
  response: string;
  tokensIn: number;
  tokensOut: number;
  latency: number;
  cost: number;
  agentId: string;
  agentName: string;
  selectedTier?: number | null;
  selectionReason?: string | null;
  wasUpgraded?: boolean;
  originalTier?: number | null;
  selectionDurationMs?: number | null;
}

export interface TraceSpan {
  id: string;
  traceId: string;
  name: string;
  service: string;
  start: number;
  duration: number;
  status: "ok" | "error";
}
