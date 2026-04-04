import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler, requireAuth, getProjectId, apiResponse } from "@/lib/api-helpers";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  agentId: z.string().min(1),
  cases: z.array(z.object({
    input: z.string().min(1),
    expectedOutput: z.string().optional(),
    criteria: z.array(z.string()).min(1),
    weight: z.number().int().min(1).default(1),
  })).optional(),
});

// ── GET /api/evals — list all suites ──
export const GET = withErrorHandler(async () => {
  await requireAuth();
  const projectId = await getProjectId();

  const suites = await prisma.evalSuite.findMany({
    where: { projectId },
    include: {
      _count: { select: { cases: true, runs: true } },
      runs: { orderBy: { startedAt: "desc" }, take: 5, select: { score: true, startedAt: true, status: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return apiResponse({ suites });
});

// ── POST /api/evals — create suite ──
export const POST = withErrorHandler(async (request: NextRequest) => {
  await requireAuth();
  const projectId = await getProjectId();
  const body = createSchema.parse(await request.json());

  const suite = await prisma.evalSuite.create({
    data: {
      projectId,
      name: body.name,
      description: body.description || null,
      agentId: body.agentId,
      ...(body.cases?.length ? {
        cases: {
          create: body.cases.map((c) => ({
            input: c.input,
            expectedOutput: c.expectedOutput || null,
            criteria: c.criteria,
            weight: c.weight ?? 1,
          })),
        },
      } : {}),
    },
    include: { _count: { select: { cases: true } } },
  });

  return apiResponse({ suite });
});
