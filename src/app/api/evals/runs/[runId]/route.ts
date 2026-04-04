import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler, requireAuth, apiResponse, apiError } from "@/lib/api-helpers";

// ── GET /api/evals/runs/[runId] — single run detail ──
export const GET = withErrorHandler(
  async (_request: NextRequest, context?: { params: Record<string, string> }) => {
    await requireAuth();
    const runId = context?.params?.runId;
    if (!runId) return apiError("Run ID required", 400);

    const run = await prisma.evalRun.findUnique({
      where: { id: runId },
      include: { suite: { select: { name: true, agentId: true } } },
    });
    if (!run) return apiError("Run not found", 404);

    return apiResponse({ run });
  }
);
