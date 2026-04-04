import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler, requireAuth, getProjectId, apiResponse, apiError } from "@/lib/api-helpers";

// ── GET /api/evals/[id] — get suite with cases + runs ──
export const GET = withErrorHandler(
  async (_request: NextRequest, context?: { params: Record<string, string> }) => {
    await requireAuth();
    const projectId = await getProjectId();
    const id = context?.params?.id;
    if (!id) return apiError("ID required", 400);

    const suite = await prisma.evalSuite.findFirst({
      where: { id, projectId },
      include: {
        cases: { orderBy: { createdAt: "asc" } },
        runs: { orderBy: { startedAt: "desc" }, take: 20 },
      },
    });
    if (!suite) return apiError("Suite not found", 404);

    return apiResponse({ suite });
  }
);

// ── DELETE /api/evals/[id] ──
export const DELETE = withErrorHandler(
  async (_request: NextRequest, context?: { params: Record<string, string> }) => {
    await requireAuth();
    const projectId = await getProjectId();
    const id = context?.params?.id;
    if (!id) return apiError("ID required", 400);

    await prisma.evalSuite.deleteMany({ where: { id, projectId } });
    return apiResponse({ success: true });
  }
);
