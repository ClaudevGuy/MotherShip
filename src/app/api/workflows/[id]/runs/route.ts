import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler, requireAuth, getProjectId, apiResponse } from "@/lib/api-helpers";

export const GET = withErrorHandler(async (
  _request: NextRequest,
  context?: { params: Record<string, string> }
) => {
  await requireAuth();
  const projectId = await getProjectId();
  const workflowId = context?.params?.id;

  if (!workflowId) return apiResponse({ runs: [] });

  // Verify workflow belongs to project
  const workflow = await prisma.workflow.findFirst({
    where: { id: workflowId, projectId },
  });
  if (!workflow) return apiResponse({ runs: [] });

  const runs = await prisma.workflowRun.findMany({
    where: { workflowId },
    orderBy: { startedAt: "desc" },
    take: 50,
  });

  return apiResponse({ runs });
});
