import { create } from "zustand";
import type { Incident, IncidentEvent, AlertRule, OnCallSchedule } from "@/types/incidents";
import type { IncidentSeverity, IncidentStatus } from "@/types/common";
import { seedIncidents, seedAlertRules, seedOnCallSchedule } from "@/data/incidents";

interface IncidentsStore {
  incidents: Incident[];
  alertRules: AlertRule[];
  onCallSchedule: OnCallSchedule[];
  severityFilter: IncidentSeverity | "all";
  statusFilter: IncidentStatus | "all";
  setSeverityFilter: (severity: IncidentSeverity | "all") => void;
  setStatusFilter: (status: IncidentStatus | "all") => void;
  updateIncidentStatus: (id: string, status: IncidentStatus) => void;
  addTimelineEvent: (incidentId: string, event: IncidentEvent) => void;
  toggleAlertRule: (id: string) => void;
  getFilteredIncidents: () => Incident[];
  getActiveIncidents: () => Incident[];
}

export const useIncidentsStore = create<IncidentsStore>((set, get) => ({
  incidents: seedIncidents,
  alertRules: seedAlertRules,
  onCallSchedule: seedOnCallSchedule,
  severityFilter: "all",
  statusFilter: "all",

  setSeverityFilter: (severity) => set({ severityFilter: severity }),
  setStatusFilter: (status) => set({ statusFilter: status }),

  updateIncidentStatus: (id, status) =>
    set((state) => ({
      incidents: state.incidents.map((i) =>
        i.id === id ? { ...i, status, updatedAt: new Date().toISOString() } : i
      ),
    })),

  addTimelineEvent: (incidentId, event) =>
    set((state) => ({
      incidents: state.incidents.map((i) =>
        i.id === incidentId
          ? { ...i, timeline: [...i.timeline, event], updatedAt: new Date().toISOString() }
          : i
      ),
    })),

  toggleAlertRule: (id) =>
    set((state) => ({
      alertRules: state.alertRules.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      ),
    })),

  getFilteredIncidents: () => {
    const { incidents, severityFilter, statusFilter } = get();
    return incidents.filter((i) => {
      if (severityFilter !== "all" && i.severity !== severityFilter) return false;
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      return true;
    });
  },

  getActiveIncidents: () => {
    return get().incidents.filter((i) => i.status !== "resolved");
  },
}));
