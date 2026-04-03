/**
 * Utilities for clearing and reloading all project-scoped data stores.
 * Call clearProjectData() when switching to a new/different project.
 * Call reloadProjectData() when switching back to the default project.
 */

import { useAgentsStore } from "@/stores/agents-store";
import { useIncidentsStore } from "@/stores/incidents-store";
import { useDeploymentsStore } from "@/stores/deployments-store";
import { useCostsStore } from "@/stores/costs-store";
import { useNotificationsStore } from "@/stores/notifications-store";
import { useLogsStore } from "@/stores/logs-store";
import { useTeamStore } from "@/stores/team-store";
import { useIntegrationsStore } from "@/stores/integrations-store";
import { useWorkflowsStore } from "@/stores/workflows-store";
import { invalidateAll } from "./store-cache";

export function clearProjectData() {
  // Invalidate cache so next fetch actually hits the API
  invalidateAll();

  // Reset all store data to empty
  useAgentsStore.setState({ agents: [], isLoading: false, error: null });
  useIncidentsStore.setState({ incidents: [], alertRules: [], onCallSchedule: [], isLoading: false, error: null });
  useDeploymentsStore.setState({ deployments: [], environments: [], featureFlags: [], isLoading: false, error: null });
  useCostsStore.setState({ breakdown: [], agentCosts: [], budgets: [], invoices: [], dailyCosts: [], isLoading: false, error: null });
  useNotificationsStore.setState({ notifications: [], isLoading: false, error: null });
  useLogsStore.setState({ logs: [], errorGroups: [], llmCalls: [], traceSpans: [], isLoading: false, error: null });
  useTeamStore.setState({ members: [], auditLog: [], apiKeys: [], isLoading: false, error: null });
  useIntegrationsStore.setState({ integrations: [], webhooks: [], isLoading: false, error: null });
  useWorkflowsStore.setState({ workflows: [], isLoading: false, error: null });
}

export function reloadProjectData() {
  // Invalidate cache first so fetches actually execute
  invalidateAll();

  // Trigger fresh fetches for all stores
  useAgentsStore.getState().fetch();
  useIncidentsStore.getState().fetch();
  useDeploymentsStore.getState().fetch();
  useCostsStore.getState().fetch();
  useNotificationsStore.getState().fetch();
  useLogsStore.getState().fetch();
  useTeamStore.getState().fetch();
  useIntegrationsStore.getState().fetch();
  useWorkflowsStore.getState().fetch();
}
