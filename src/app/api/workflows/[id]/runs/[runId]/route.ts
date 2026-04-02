import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler, requireAuth, getProjectId, apiResponse, ApiError } from "@/lib/api-helpers";

export const GET = withErrorHandler(async (
  _request: NextRequest,
  context?: { params: Record<string, string> }
) => {
  await requireAuth();
  const projectId = await getProjectId();
  const workflowId = context?.params?.id;
  const runId = context?.params?.runId;

  if (!workflowId || !runId) throw new ApiError("Missing parameters", 400);

  const workflow = await prisma.workflow.findFirst({
    where: { id: workflowId, projectId },
  });
  if (!workflow) throw new ApiError("Workflow not found", 404);

  const run = await prisma.workflowRun.findFirst({
    where: { id: runId, workflowId },
  });
  if (!run) throw new ApiError("Run not found", 404);

  return apiResponse({ run });
});
