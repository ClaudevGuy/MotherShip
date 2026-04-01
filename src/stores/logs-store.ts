import { create } from "zustand";
import type { LogEntry, ErrorGroup, LLMCall, TraceSpan } from "@/types/logs";
import type { LogLevel } from "@/types/common";
import { seedLogs, seedErrorGroups, seedLLMCalls, seedTraceSpans } from "@/data/logs";

interface LogsStore {
  logs: LogEntry[];
  errorGroups: ErrorGroup[];
  llmCalls: LLMCall[];
  traceSpans: TraceSpan[];
  levelFilter: LogLevel | "all";
  serviceFilter: string;
  searchQuery: string;
  isLive: boolean;
  setLevelFilter: (level: LogLevel | "all") => void;
  setServiceFilter: (service: string) => void;
  setSearchQuery: (query: string) => void;
  setIsLive: (live: boolean) => void;
  addLog: (log: LogEntry) => void;
  getFilteredLogs: () => LogEntry[];
}

export const useLogsStore = create<LogsStore>((set, get) => ({
  logs: seedLogs,
  errorGroups: seedErrorGroups,
  llmCalls: seedLLMCalls,
  traceSpans: seedTraceSpans,
  levelFilter: "all",
  serviceFilter: "",
  searchQuery: "",
  isLive: true,

  setLevelFilter: (level) => set({ levelFilter: level }),
  setServiceFilter: (service) => set({ serviceFilter: service }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setIsLive: (live) => set({ isLive: live }),

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
