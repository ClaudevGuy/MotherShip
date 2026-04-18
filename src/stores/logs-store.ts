import { create } from "zustand";
import { apiFetch } from "@/lib/api-client";
import type { LogEntry, ErrorGroup, LLMCall, TraceSpan } from "@/types/logs";
import type { LogLevel } from "@/types/common";

export type LLMRange = "today" | "24h" | "7d" | "30d" | "all";

export interface LLMStats {
  calls: number;
  tokensIn: number;
  tokensOut: number;
  totalCost: number;
  avgLatency: number;
  since: LLMRange;
}

interface LogsStore {
  logs: LogEntry[];
  errorGroups: ErrorGroup[];
  llmCalls: LLMCall[];
  llmStats: LLMStats | null;
  llmRange: LLMRange;
  traceSpans: TraceSpan[];
  isLoading: boolean;
  error: string | null;
  levelFilter: LogLevel | "all";
  serviceFilter: string;
  searchQuery: string;
  isLive: boolean;
  /** Fetch everything (used on page mount). Always fresh — no TTL cache. */
  fetch: () => Promise<void>;
  /** Fetch only LLM calls + stats (used on tab change + polling). */
  fetchLLM: (range?: LLMRange) => Promise<void>;
  setLevelFilter: (level: LogLevel | "all") => void;
  setServiceFilter: (service: string) => void;
  setSearchQuery: (query: string) => void;
  setIsLive: (live: boolean) => void;
  setLLMRange: (range: LLMRange) => void;
  addLog: (log: LogEntry) => void;
  getFilteredLogs: () => LogEntry[];
}

export const useLogsStore = create<LogsStore>((set, get) => ({
  logs: [],
  errorGroups: [],
  llmCalls: [],
  llmStats: null,
  llmRange: "today",
  traceSpans: [],
  isLoading: false,
  error: null,
  levelFilter: "all",
  serviceFilter: "",
  searchQuery: "",
  isLive: true,

  fetch: async () => {
    // No TTL cache: observability data must always be fresh. Dedup is
    // handled by React Strict Mode / caller invoking fetch once per mount.
    set({ isLoading: true, error: null });
    try {
      const range = get().llmRange;
      const [logsRes, errorsRes, llmRes, tracesRes] = await Promise.all([
        apiFetch("/api/logs"),
        apiFetch("/api/logs/errors"),
        apiFetch(`/api/logs/llm-calls?since=${range}`),
        apiFetch("/api/logs/traces"),
      ]);
      if (!logsRes.ok) throw new Error("Failed to fetch logs");
      if (!errorsRes.ok) throw new Error("Failed to fetch errors");
      if (!llmRes.ok) throw new Error("Failed to fetch LLM calls");
      if (!tracesRes.ok) throw new Error("Failed to fetch traces");
      const [logsData, errorsData, llmData, tracesData] = await Promise.all([
        logsRes.json(),
        errorsRes.json(),
        llmRes.json(),
        tracesRes.json(),
      ]);
      set({
        logs: logsData.data.entries,
        errorGroups: errorsData.data.groups,
        llmCalls: llmData.data.calls,
        llmStats: llmData.data.stats ?? null,
        traceSpans: tracesData.data.spans,
        isLoading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchLLM: async (range) => {
    const effective = range ?? get().llmRange;
    try {
      const res = await apiFetch(`/api/logs/llm-calls?since=${effective}`);
      if (!res.ok) return;
      const data = await res.json();
      set({
        llmCalls: data.data.calls,
        llmStats: data.data.stats ?? null,
        llmRange: effective,
      });
    } catch {
      /* silent — polling path */
    }
  },

  setLevelFilter: (level) => set({ levelFilter: level }),
  setServiceFilter: (service) => set({ serviceFilter: service }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setIsLive: (live) => set({ isLive: live }),
  setLLMRange: (range) => {
    set({ llmRange: range });
    // Re-fetch LLM data for the new range.
    get().fetchLLM(range);
  },

  addLog: (log) =>
    set((state) => ({ logs: [log, ...state.logs].slice(0, 200) })),

  getFilteredLogs: () => {
    const { logs, levelFilter, serviceFilter, searchQuery } = get();
    return logs.filter((l) => {
      if (levelFilter !== "all" && l.level !== levelFilter) return false;
      if (serviceFilter && l.service !== serviceFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          l.message.toLowerCase().includes(q) ||
          l.service.toLowerCase().includes(q) ||
          (l.traceId && l.traceId.toLowerCase().includes(q))
        );
      }
      return true;
    });
  },
}));
