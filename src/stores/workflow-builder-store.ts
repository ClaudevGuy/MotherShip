import { create } from "zustand";
import type { Node, Edge } from "@xyflow/react";

export interface TriggerConfig {
  type: "manual" | "schedule" | "webhook" | "event";
  cron?: string;
  timezone?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  eventType?: string;
  eventFilter?: string;
}

export interface AgentNodeConfig {
  agentId: string;
  agentName: string;
  model: string;
  inputSource: "trigger" | "previous" | "manual";
  outputVar: string;
  timeout?: number;
  onFailure: "stop" | "skip" | "retry" | "continue";
  retryCount?: number;
  condition?: string;
}

interface WorkflowBuilderStore {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  isDirty: boolean;
  workflowId: string | null;
  workflowName: string;
  workflowDescription: string;
  workflowStatus: string;

  // Node actions
  setNodes: (nodes: Node[]) => void;
  addNode: (node: Node) => void;
  removeNode: (id: string) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  updateNodeConfig: (id: string, config: Record<string, unknown>) => void;

  // Edge actions
  setEdges: (edges: Edge[]) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (id: string) => void;

  // Selection
  setSelected: (id: string | null) => void;

  // Workflow metadata
  setWorkflowName: (name: string) => void;
  setWorkflowDescription: (desc: string) => void;
  setDirty: (dirty: boolean) => void;

  // Serialization
  loadFromWorkflow: (workflow: {
    id: string;
    name: string;
    description: string;
    status: string;
    steps: unknown;
    trigger: unknown;
  }) => void;
  serializeToJson: () => { nodes: Node[]; edges: Edge[]; trigger: TriggerConfig | null };
  reset: () => void;
}

const initialState = {
  nodes: [] as Node[],
  edges: [] as Edge[],
  selectedNodeId: null as string | null,
  isDirty: false,
  workflowId: null as string | null,
  workflowName: "",
  workflowDescription: "",
  workflowStatus: "draft",
};

export const useWorkflowBuilderStore = create<WorkflowBuilderStore>((set, get) => ({
  ...initialState,

  setNodes: (nodes) => set({ nodes, isDirty: true }),
  addNode: (node) => set((s) => ({ nodes: [...s.nodes, node], isDirty: true })),
  removeNode: (id) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
      isDirty: true,
    })),
  updateNodePosition: (id, position) =>
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, position } : n)),
      isDirty: true,
    })),
  updateNodeConfig: (id, config) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...config } } : n
      ),
      isDirty: true,
    })),

  setEdges: (edges) => set({ edges, isDirty: true }),
  addEdge: (edge) => set((s) => ({ edges: [...s.edges, edge], isDirty: true })),
  removeEdge: (id) =>
    set((s) => ({ edges: s.edges.filter((e) => e.id !== id), isDirty: true })),

  setSelected: (id) => set({ selectedNodeId: id }),

  setWorkflowName: (name) => set({ workflowName: name, isDirty: true }),
  setWorkflowDescription: (desc) => set({ workflowDescription: desc, isDirty: true }),
  setDirty: (dirty) => set({ isDirty: dirty }),

  loadFromWorkflow: (workflow) => {
    const canvas = workflow.steps as { nodes?: Node[]; edges?: Edge[] } | null;
    const trigger = workflow.trigger as TriggerConfig | null;

    // If steps is canvas format (nodes/edges), load directly
    if (canvas && Array.isArray(canvas.nodes)) {
      set({
        nodes: canvas.nodes,
        edges: canvas.edges || [],
        workflowId: workflow.id,
        workflowName: workflow.name,
        workflowDescription: workflow.description || "",
        workflowStatus: workflow.status,
        isDirty: false,
        selectedNodeId: null,
      });
      return;
    }

    // Otherwise, convert legacy step array to canvas format
    const steps = Array.isArray(workflow.steps) ? (workflow.steps as Array<{ agentId: string; agentName: string; position: number }>) : [];
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Add trigger node
    if (trigger) {
      nodes.push({
        id: "trigger_1",
        type: "trigger",
        position: { x: 100, y: 200 },
        data: { ...trigger },
      });
    }

    // Add agent nodes
    steps.forEach((step, i) => {
      const nodeId = `agent_${i + 1}`;
      nodes.push({
        id: nodeId,
        type: "agent",
        position: { x: 350 + i * 250, y: 200 },
        data: {
          agentId: step.agentId,
          agentName: step.agentName,
          model: "",
          inputSource: i === 0 ? "trigger" : "previous",
          outputVar: `step${i + 1}_output`,
          onFailure: "stop",
        },
      });

      // Connect to previous
      const sourceId = i === 0 && trigger ? "trigger_1" : i > 0 ? `agent_${i}` : null;
      if (sourceId) {
        edges.push({
          id: `edge_${sourceId}_${nodeId}`,
          source: sourceId,
          target: nodeId,
          type: "animated",
        });
      }
    });

    set({
      nodes,
      edges,
      workflowId: workflow.id,
      workflowName: workflow.name,
      workflowDescription: workflow.description || "",
      workflowStatus: workflow.status,
      isDirty: false,
      selectedNodeId: null,
    });
  },

  serializeToJson: () => {
    const { nodes, edges } = get();
    const triggerNode = nodes.find((n) => n.type === "trigger");
    const trigger = triggerNode ? (triggerNode.data as unknown as TriggerConfig) : null;
    return { nodes, edges, trigger };
  },

  reset: () => set({ ...initialState }),
}));
