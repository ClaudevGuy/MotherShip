import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler, requireAuth, apiResponse, apiError } from "@/lib/api-helpers";

// ── DELETE /api/evals/[id]/cases/[caseId] ──
export const DELETE = withErrorHandler(
  async (_request: NextRequest, context?: { params: Record<string, string> }) => {
    await requireAuth();
    const caseId = context?.params?.caseId;
    if (!caseId) return apiError("Case ID required", 400);

    await prisma.evalCase.delete({ where: { id: caseId } });
    return apiResponse({ success: true });
  }
);
