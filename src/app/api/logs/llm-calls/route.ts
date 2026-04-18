import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireAuth,
  getProjectId,
  apiResponse,
  parsePagination,
} from "@/lib/api-helpers";

// ── GET /api/logs/llm-calls ──
//
// Query params:
//   since=today | 24h | 7d | 30d | all   (default: today)
//   model=<string>                         (optional)
//   agentId=<string>                       (optional)
//   page=<n> limit=<n>                     (pagination)
//
// Returns:
//   { calls: LlmCall[],
//     pagination: { page, limit, total, totalPages },
//     stats: { calls, tokensIn, tokensOut, totalCost, avgLatency, errorRate } }
//
// Stats are scoped to the same time window as the returned calls so the
// "Calls Today" metric card and the list below it never disagree.

function startOfRange(range: string): Date | null {
  const now = new Date();
  switch (range) {
    case "today": {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "24h":
      return new Date(now.getTime() - 24 * 3600 * 1000);
    case "7d":
      return new Date(now.getTime() - 7 * 86400 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 86400 * 1000);
    case "all":
      return null;
    default:
      return null;
  }
}

export const GET = withErrorHandler(async (request: NextRequest) => {
  await requireAuth();
  const projectId = await getProjectId();
  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = parsePagination(searchParams);

  const since = searchParams.get("since") ?? "today";
  const model = searchParams.get("model");
  const agentId = searchParams.get("agentId");
  const sinceDate = startOfRange(since);

  const where = {
    projectId,
    ...(model && { model }),
    ...(agentId && { agentId }),
    ...(sinceDate && { timestamp: { gte: sinceDate } }),
  };

  const [calls, total, agg] = await Promise.all([
    prisma.llmCall.findMany({
      where,
      skip,
      take: limit,
      orderBy: { timestamp: "desc" },
    }),
    prisma.llmCall.count({ where }),
    prisma.llmCall.aggregate({
      where,
      _sum: { cost: true, tokensIn: true, tokensOut: true },
      _avg: { latency: true },
    }),
  ]);

  return apiResponse({
    calls,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    stats: {
      calls: total,
      tokensIn: agg._sum.tokensIn ?? 0,
      tokensOut: agg._sum.tokensOut ?? 0,
      totalCost: Math.round((agg._sum.cost ?? 0) * 10000) / 10000,
      avgLatency: Math.round(agg._avg.latency ?? 0),
      since,
    },
  });
});
