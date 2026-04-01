import { create } from "zustand";
import type { Integration, Webhook } from "@/types/integrations";
import type { IntegrationStatus } from "@/types/common";
import { seedIntegrations, seedWebhooks } from "@/data/integrations";

interface IntegrationsStore {
  integrations: Integration[];
  webhooks: Webhook[];
  categoryFilter: string;
  updateIntegrationStatus: (id: string, status: IntegrationStatus) => void;
  setCategoryFilter: (category: string) => void;
  toggleWebhookStatus: (id: string) => void;
  getFilteredIntegrations: () => Integration[];
}

export const useIntegrationsStore = create<IntegrationsStore>((set, get) => ({
  integrations: seedIntegrations,
  webhooks: seedWebhooks,
  categoryFilter: "all",

  updateIntegrationStatus: (id, status) =>
    set((state) => ({
      integrations: state.integrations.map((i) =>
        i.id === id ? { ...i, status } : i
      ),
    })),

  setCategoryFilter: (category) => set({ categoryFilter: category }),

  toggleWebhookStatus: (id) =>
    set((state) => ({
      webhooks: state.webhooks.map((w) =>
        w.id === id
          ? { ...w, status: w.status === "active" ? "inactive" : "active" }
          : w
      ),
    })),

  getFilteredIntegrations: () => {
    const { integrations, categoryFilter } = get();
    if (categoryFilter === "all") return integrations;
    return integrations.filter((i) => i.category === categoryFilter);
  },
}));
