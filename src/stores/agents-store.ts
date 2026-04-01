import { create } from "zustand";
import type { Agent, AgentRun } from "@/types/agents";
import type { AgentStatus, ModelProvider } from "@/types/common";
import { seedAgents } from "@/data/agents";
import { jitter } from "@/data/generators";

interface AgentsStore {
  agents: Agent[];
  searchQuery: string;
  statusFilter: AgentStatus | "all";
  modelFilter: ModelProvider | "all";
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: AgentStatus | "all") => void;
  setModelFilter: (model: ModelProvider | "all") => void;
  updateAgentStatus: (id: string, status: AgentStatus) => void;
  addRun: (agentId: string, run: AgentRun) => void;
  getFilteredAgents: () => Agent[];
  simulateTick: () => void;
}

export const useAgentsStore = create<AgentsStore>((set, get) => ({
  agents: seedAgents,
  searchQuery: "",
  statusFilter: "all",
  modelFilter: "all",

  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setModelFilter: (model) => set({ modelFilter: model }),

  updateAgentStatus: (id, status) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id ? { ...a, status } : a
      ),
    })),

  addRun: (agentId, run) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === agentId ? { ...a, runs: [run, ...a.runs] } : a
      ),
    })),

  getFilteredAgents: () => {
    const { agents, searchQuery, statusFilter, modelFilter } = get();
    return agents.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (modelFilter !== "all" && a.model !== modelFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  },

  simulateTick: () =>
    set((state) => ({
      agents: state.agents.map((a) => ({
        ...a,
        tokenUsage: Math.round(jitter(a.tokenUsage, 0.1)),
        avgLatency: Math.round(jitter(a.avgLatency, 2)),
        contextWindowUsage: Math.min(100, Math.max(0, Math.round(jitter(a.contextWindowUsage, 1)))),
        healthScore: Math.min(100, Math.max(0, Math.round(jitter(a.healthScore, 0.5)))),
        errorRate: Math.max(0, parseFloat(jitter(a.errorRate, 3).toFixed(1))),
      })),
    })),
}));
