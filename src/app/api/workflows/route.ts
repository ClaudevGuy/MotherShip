import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireAuth,
  requireRole,
  getProjectId,
  apiResponse,
  validateBody,
} from "@/lib/api-helpers";
import { createWorkflowSchema } from "@/lib/validations/workflows";
import { logAuditEvent } from "@/lib/audit";

// ── GET /api/workflows ──

export const GET = withErrorHandler(async () => {
  await requireAuth();
  const projectId = await getProjectId();

  const workflows = await prisma.workflow.findMany({
    where: { projectId },
    include: { steps: { orderBy: { position: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return apiResponse({ workflows });
});

// ── POST /api/workflows ──

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await requireRole("developer");
  const projectId = await getProjectId();
  const body = await validateBody(request, createWorkflowSchema);

  const workflow = await prisma.workflow.create({
    data: {
      projectId,
      name: body.name,
      description: body.description,
      createdBy: user.id,
      steps: {
        create: body.steps.map((s) => ({
          agentId: s.agentId,
          agentName: s.agentName,
          position: s.position,
        })),
      },
    },
    include: { steps: { orderBy: { position: "asc" } } },
  });

  await logAuditEvent({
    projectId,
    userId: user.id,
    userName: user.name,
    action: "workflow.create",
    target: workflow.name,
    details: `Created workflow "${workflow.name}" with ${body.steps.length} steps`,
  });

  return apiResponse(workflow, 201);
});
