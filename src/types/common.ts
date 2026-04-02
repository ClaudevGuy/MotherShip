export type AgentStatus = "running" | "idle" | "paused" | "error" | "deploying";
export type DeployStage = "dev" | "staging" | "review" | "production";
export type DeployStatus = "success" | "failed" | "in_progress" | "rolled_back" | "pending";
export type IncidentSeverity = "P1" | "P2" | "P3";
export type IncidentStatus = "open" | "investigating" | "resolved";
export type HealthStatus = "healthy" | "degraded" | "down";
export type LogLevel = "debug" | "info" | "warn" | "error";
export type ModelProvider = "Claude" | "GPT-4" | "Gemini" | "Custom";
export type ModelStrategy = "auto" | "manual" | "cost_first" | "quality_first";
export type Environment = "development" | "staging" | "production";
export type IntegrationStatus = "connected" | "disconnected" | "error";
export type TeamRole = "admin" | "developer" | "agent_manager" | "viewer";
export type AlertChannel = "slack" | "email" | "pagerduty";

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface StatusCount {
  label: string;
  value: number;
  color: string;
}
