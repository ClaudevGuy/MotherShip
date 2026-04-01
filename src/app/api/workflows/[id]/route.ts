import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireAuth,
  requireRole,
  getProjectId,
  apiResponse,
  apiError,
  ApiError,
  validateBody,
} from "@/lib/api-helpers";
import { updateWorkflowSchema } from "@/lib/validations/workflows";
import { logAuditEvent } from "@/lib/audit";

// ── GET /api/workflows/[id] ──

export const GET = withErrorHandler(
  async (_req: NextRequest, context?: { params: Record<string, string> }) => {
    await requireAuth();
    const projectId = await getProjectId();
    const id = context?.params?.id;
    if (!id) return apiError("Workflow ID is required", 400);

    const workflow = await prisma.workflow.findFirst({
      where: { id, projectId },
      include: { steps: { orderBy: { position: "asc" } } },
    });
    if (!workflow) throw new ApiError("Workflow not found", 404);

    return apiResponse(workflow);
  }
);

// ── PATCH /api/workflows/[id] ──

export const PATCH = withErrorHandler(
  async (request: NextRequest, context?: { params: Record<string, string> }) => {
    const user = await requireRole("developer");
    const projectId = await getProjectId();
    const id = context?.params?.id;
    if (!id) return apiError("Workflow ID is required", 400);

    const existing = await prisma.workflow.findFirst({ where: { id, projectId } });
    if (!existing) throw new ApiError("Workflow not found", 404);

    const body = await validateBody(request, updateWorkflowSchema);

    const workflow = await prisma.$transaction(async (tx) => {
      if (body.steps) {
        await tx.workflowStep.deleteMany({ where: { workflowId: id } });
        await tx.workflowStep.createMany({
          data: body.steps.map((s) => ({
            workflowId: id,
            agentId: s.agentId,
            agentName: s.agentName,
            position: s.position,
          })),
        });
      }
      return tx.workflow.update({
        where: { id },
        data: {
          ...(body.name !== undefined && { name: body.name }),
          ...(body.description !== undefined && { description: body.description }),
        },
        include: { steps: { orderBy: { position: "asc" } } },
      });
    });

    await logAuditEvent({
      projectId,
      userId: user.id,
      userName: user.name,
      action: "workflow.update",
      target: workflow.name,
      details: `Updated workflow "${workflow.name}"`,
    });

    return apiResponse(workflow);
  }
);

// ── DELETE /api/workflows/[id] ──

export const DELETE = withErrorHandler(
  async (_req: NextRequest, context?: { params: Record<string, string> }) => {
    const user = await requireRole("developer");
    const projectId = await getProjectId();
    const id = context?.params?.id;
    if (!id) return apiError("Workflow ID is required", 400);

    const existing = await prisma.workflow.findFirst({ where: { id, projectId } });
    if (!existing) throw new ApiError("Workflow not found", 404);

    await prisma.workflow.delete({ where: { id } });

    await logAuditEvent({
      projectId,
      userId: user.id,
      userName: user.name,
      action: "workflow.delete",
      target: existing.name,
      details: `Deleted workflow "${existing.name}"`,
    });

    return apiResponse({ success: true, id });
  }
);
