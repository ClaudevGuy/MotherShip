import { z } from "zod";

export const createWorkflowSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(2000).optional().default(""),
  steps: z
    .array(
      z.object({
        agentId: z.string().min(1),
        agentName: z.string().min(1),
        position: z.number().int().min(0),
      })
    )
    .min(2, "A workflow needs at least 2 agents"),
});

export const updateWorkflowSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).optional(),
  steps: z
    .array(
      z.object({
        agentId: z.string().min(1),
        agentName: z.string().min(1),
        position: z.number().int().min(0),
      })
    )
    .min(2)
    .optional(),
});

export const runWorkflowSchema = z.object({
  input: z.string().min(1, "Input is required"),
});

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>;
export type RunWorkflowInput = z.infer<typeof runWorkflowSchema>;
