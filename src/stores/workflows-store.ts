import { create } from "zustand";

export interface WorkflowStep {
  id: string;
  workflowId: string;
  agentId: string;
  agentName: string;
  position: number;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: "idle" | "running" | "completed" | "failed";
  createdAt: string;
  lastRun: string | null;
  totalRuns: number;
  steps: WorkflowStep[];
}

interface WorkflowsStore {
  workflows: Workflow[];
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  addWorkflow: (workflow: Workflow) => void;
  removeWorkflow: (id: string) => Promise<void>;
  updateWorkflowStatus: (id: string, status: Workflow["status"]) => void;
}

export const useWorkflowsStore = create<WorkflowsStore>((set, get) => ({
  workflows: [],
  isLoading: false,
  error: null,

  fetch: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/workflows");
      if (!res.ok) throw new Error("Failed to fetch workflows");
      const { data } = await res.json();
      const workflows = (data.workflows as Array<Record<string, unknown>>).map((w) => ({
        ...w,
        status: (w.status as string).toLowerCase() as Workflow["status"],
      })) as Workflow[];
      set({ workflows, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addWorkflow: (workflow) =>
    set((state) => ({ workflows: [workflow, ...state.workflows] })),

  removeWorkflow: async (id) => {
    set((state) => ({ workflows: state.workflows.filter((w) => w.id !== id) }));
    try {
      await fetch(`/api/workflows/${id}`, { method: "DELETE" });
    } catch {
      get().fetch();
    }
  },

  updateWorkflowStatus: (id, status) =>
    set((state) => ({
      workflows: state.workflows.map((w) => (w.id === id ? { ...w, status } : w)),
    })),
}));
