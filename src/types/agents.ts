import type { AgentStatus, ModelProvider } from "./common";

export interface AgentTool {
  name: string;
  enabled: boolean;
  usageCount: number;
}

export interface AgentRun {
  id: string;
  startedAt: string;
  duration: number;
  status: "success" | "failed" | "running";
  tokensUsed: number;
  cost: number;
  output: string;
}

export interface EvalResult {
  name: string;
  passed: boolean;
  score: number;
  details: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  model: ModelProvider;
  status: AgentStatus;
  tasksCompleted: number;
  errorRate: number;
  tokenUsage: number;
  avgLatency: number;
  costPerHour: number;
  totalCost: number;
  lastRun: string;
  createdAt: string;
  createdBy: string;
  healthScore: number;
  contextWindowUsage: number;
  tags: string[];
  tools: AgentTool[];
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  runs: AgentRun[];
  evalResults: EvalResult[];
}
