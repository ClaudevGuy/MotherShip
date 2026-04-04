import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler, requireAuth, getProjectId, apiResponse, apiError } from "@/lib/api-helpers";
import { z } from "zod";

const caseSchema = z.object({
  input: z.string().min(1),
  expectedOutput: z.string().optional(),
  criteria: z.array(z.string()).min(1),
  weight: z.number().int().min(1).default(1),
});

// ── POST /api/evals/[id]/cases — add test case ──
export const POST = withErrorHandler(
  async (request: NextRequest, context?: { params: Record<string, string> }) => {
    await requireAuth();
    const projectId = await getProjectId();
    const id = context?.params?.id;
    if (!id) return apiError("Suite ID required", 400);

    const suite = await prisma.evalSuite.findFirst({ where: { id, projectId } });
    if (!suite) return apiError("Suite not found", 404);

    const body = caseSchema.parse(await request.json());

    const evalCase = await prisma.evalCase.create({
      data: {
        suiteId: id,
        input: body.input,
        expectedOutput: body.expectedOutput || null,
        criteria: body.criteria,
        weight: body.weight ?? 1,
      },
    });

    return apiResponse({ case: evalCase });
  }
);
