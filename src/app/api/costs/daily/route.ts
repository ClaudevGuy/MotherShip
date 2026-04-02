import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireAuth,
  getProjectId,
  apiResponse,
} from "@/lib/api-helpers";

// ── GET /api/costs/daily ──
// Computes daily cost from LlmCall records when DailyCost table is empty

export const GET = withErrorHandler(async (request: NextRequest) => {
  await requireAuth();
  const projectId = await getProjectId();
  const { searchParams } = request.nextUrl;

  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // Try DailyCost table first
  const where = {
    projectId,
    ...(from || to
      ? {
          date: {
            ...(from && { gte: new Date(from) }),
            ...(to && { lte: new Date(to) }),
          },
        }
      : {}),
  };

  const dailyCosts = await prisma.dailyCost.findMany({
    where,
    orderBy: { date: "asc" },
  });

  if (dailyCosts.length > 0) {
    return apiResponse({ costs: dailyCosts });
  }

  // Fall back: aggregate from LlmCall records
  const llmCalls = await prisma.llmCall.findMany({
    where: { projectId },
    select: { timestamp: true, cost: true },
    orderBy: { timestamp: "asc" },
  });

  // Group by date
  const byDate = new Map<string, number>();
  for (const call of llmCalls) {
    const dateKey = call.timestamp.toISOString().split("T")[0];
    byDate.set(dateKey, (byDate.get(dateKey) || 0) + call.cost);
  }

  const costs = Array.from(byDate.entries()).map(([date, value]) => ({
    date,
    value,
  }));

  return apiResponse({ costs });
});
