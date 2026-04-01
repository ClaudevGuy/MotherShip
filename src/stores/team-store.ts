import { create } from "zustand";
import type { TeamMember, AuditLogEntry, APIKey } from "@/types/team";
import type { TeamRole } from "@/types/common";
import { seedTeamMembers, seedAuditLog, seedAPIKeys } from "@/data/team";

interface TeamStore {
  members: TeamMember[];
  auditLog: AuditLogEntry[];
  apiKeys: APIKey[];
  updateMemberRole: (id: string, role: TeamRole) => void;
  removeMember: (id: string) => void;
  addAuditEntry: (entry: AuditLogEntry) => void;
  revokeAPIKey: (id: string) => void;
}

export const useTeamStore = create<TeamStore>((set) => ({
  members: seedTeamMembers,
  auditLog: seedAuditLog,
  apiKeys: seedAPIKeys,

  updateMemberRole: (id, role) =>
    set((state) => ({
      members: state.members.map((m) =>
        m.id === id ? { ...m, role } : m
      ),
    })),

  removeMember: (id) =>
    set((state) => ({
      members: state.members.filter((m) => m.id !== id),
    })),

  addAuditEntry: (entry) =>
    set((state) => ({ auditLog: [entry, ...state.auditLog] })),

  revokeAPIKey: (id) =>
    set((state) => ({
      apiKeys: state.apiKeys.filter((k) => k.id !== id),
    })),
}));
