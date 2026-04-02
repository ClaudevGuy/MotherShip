import type { TaskProfile, ProviderKey } from "./model-selector";

interface AgentConfig {
  name: string;
  model: string;
  tags: string[];
  tools: { name: string; enabled: boolean }[];
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  tasksCompleted: number;
}

const REASONING_KEYWORDS = [
  "analyze", "reason", "think step by step", "chain of thought",
  "evaluate", "compare", "assess", "debug", "investigate",
  "architect", "design", "security", "vulnerability",
];

const CRITICAL_TAGS = ["critical", "destructive", "security", "billing", "production", "finance"];
const DESTRUCTIVE_TOOLS = ["database", "file_system"];

function mapProviderKey(model: string): ProviderKey {
  const map: Record<string, ProviderKey> = {
    CLAUDE: "CLAUDE",
    GPT4: "GPT4",
    GEMINI: "GEMINI",
    CUSTOM: "CUSTOM",
  };
  return map[model.toUpperCase()] ?? "CUSTOM";
}

export function profileTask(agent: AgentConfig, taskInput: string): TaskProfile {
  const lowerPrompt = agent.systemPrompt.toLowerCase();
  const lowerInput = taskInput.toLowerCase();
  const lowerTags = agent.tags.map((t) => t.toLowerCase());
  const enabledTools = agent.tools.filter((t) => t.enabled).map((t) => t.name.toLowerCase());

  const hasProductionAccess =
    lowerTags.some((t) => t === "production" || t === "destructive") ||
    enabledTools.some((t) => DESTRUCTIVE_TOOLS.includes(t));

  const isRepetitive = agent.tasksCompleted > 50;

  const requiresReasoning =
    agent.temperature < 0.3 ||
    REASONING_KEYWORDS.some((kw) => lowerPrompt.includes(kw) || lowerInput.includes(kw));

  const errorCostHigh =
    hasProductionAccess ||
    lowerTags.some((t) => CRITICAL_TAGS.includes(t));

  const isFirstRun = agent.tasksCompleted === 0;

  return {
    agentType: agent.name,
    taskDescription: taskInput,
    expectedOutputTokens: agent.maxTokens,
    hasProductionAccess,
    isRepetitive,
    requiresReasoning,
    errorCostHigh,
    provider: mapProviderKey(agent.model),
    isFirstRun,
  };
}
