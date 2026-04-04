import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler, requireAuth, getProjectId, apiResponse, apiError } from "@/lib/api-helpers";

// ── GET /api/evals/[id]/runs — run history ──
export const GET = withErrorHandler(
  async (_request: NextRequest, context?: { params: Record<string, string> }) => {
    await requireAuth();
    const projectId = await getProjectId();
    const id = context?.params?.id;
    if (!id) return apiError("Suite ID required", 400);

    const suite = await prisma.evalSuite.findFirst({ where: { id, projectId } });
    if (!suite) return apiError("Suite not found", 404);

    const runs = await prisma.evalRun.findMany({
      where: { suiteId: id },
      orderBy: { startedAt: "desc" },
    });

    return apiResponse({ runs });
  }
);
