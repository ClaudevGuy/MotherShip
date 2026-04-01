import { create } from "zustand";
import type { CostBreakdown, AgentCost, Budget, Invoice } from "@/types/costs";
import type { TimeSeriesPoint } from "@/types/common";
import { seedCostBreakdown, seedAgentCosts, seedBudgets, seedInvoices, seedDailyCosts } from "@/data/costs";

interface CostsStore {
  breakdown: CostBreakdown[];
  agentCosts: AgentCost[];
  budgets: Budget[];
  invoices: Invoice[];
  dailyCosts: TimeSeriesPoint[];
  dateRange: "7d" | "14d" | "30d" | "90d";
  setDateRange: (range: "7d" | "14d" | "30d" | "90d") => void;
  updateBudget: (category: string, limit: number) => void;
  getTotalSpend: () => number;
}

export const useCostsStore = create<CostsStore>((set, get) => ({
  breakdown: seedCostBreakdown,
  agentCosts: seedAgentCosts,
  budgets: seedBudgets,
  invoices: seedInvoices,
  dailyCosts: seedDailyCosts,
  dateRange: "30d",

  setDateRange: (range) => set({ dateRange: range }),

  updateBudget: (category, limit) =>
    set((state) => ({
      budgets: state.budgets.map((b) =>
        b.category === category ? { ...b, limit } : b
      ),
    })),

  getTotalSpend: () => {
    return get().breakdown.reduce((sum, b) => sum + b.total, 0);
  },
}));
