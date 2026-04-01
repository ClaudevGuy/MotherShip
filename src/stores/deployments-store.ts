import { create } from "zustand";
import type { Deployment, EnvironmentStatus, FeatureFlag } from "@/types/deployments";
import type { DeployStatus, Environment } from "@/types/common";
import { seedDeployments, seedEnvironments, seedFeatureFlags } from "@/data/deployments";
import { jitter } from "@/data/generators";

interface DeploymentsStore {
  deployments: Deployment[];
  environments: EnvironmentStatus[];
  featureFlags: FeatureFlag[];
  environmentFilter: Environment | "all";
  statusFilter: DeployStatus | "all";
  setEnvironmentFilter: (env: Environment | "all") => void;
  setStatusFilter: (status: DeployStatus | "all") => void;
  addDeployment: (deployment: Deployment) => void;
  updateDeploymentStatus: (id: string, status: DeployStatus) => void;
  toggleFeatureFlag: (id: string, environment: Environment) => void;
  getFilteredDeployments: () => Deployment[];
  simulateTick: () => void;
}

export const useDeploymentsStore = create<DeploymentsStore>((set, get) => ({
  deployments: seedDeployments,
  environments: seedEnvironments,
  featureFlags: seedFeatureFlags,
  environmentFilter: "all",
  statusFilter: "all",

  setEnvironmentFilter: (env) => set({ environmentFilter: env }),
  setStatusFilter: (status) => set({ statusFilter: status }),

  addDeployment: (deployment) =>
    set((state) => ({ deployments: [deployment, ...state.deployments] })),

  updateDeploymentStatus: (id, status) =>
    set((state) => ({
      deployments: state.deployments.map((d) =>
        d.id === id ? { ...d, status } : d
      ),
    })),

  toggleFeatureFlag: (id, environment) =>
    set((state) => ({
      featureFlags: state.featureFlags.map((f) =>
        f.id === id
          ? { ...f, environments: { ...f.environments, [environment]: !f.environments[environment] } }
          : f
      ),
    })),

  getFilteredDeployments: () => {
    const { deployments, environmentFilter, statusFilter } = get();
    return deployments.filter((d) => {
      if (environmentFilter !== "all" && d.environment !== environmentFilter) return false;
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      return true;
    });
  },

  simulateTick: () =>
    set((state) => ({
      environments: state.environments.map((e) => ({
        ...e,
        activeUsers: Math.max(0, Math.round(jitter(e.activeUsers, 3))),
        uptime: Math.min(100, parseFloat(jitter(e.uptime, 0.01).toFixed(2))),
      })),
    })),
}));
