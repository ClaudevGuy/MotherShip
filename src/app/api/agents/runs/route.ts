import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireAuth,
  getProjectId,
  apiResponse,
  parsePagination,
} from "@/lib/api-helpers";

// ── GET /api/agents/runs ──
// Cross-agent run feed. Returns recent runs across all agents in this project,
// joined with agent name + model so the UI can render without extra lookups.

export const GET = withErrorHandler(async (request: NextRequest) => {
  await requireAuth();
  const projectId = await getProjectId();
  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = parsePagination(searchParams);

  const statusFilter = searchParams.get("status"); // "success" | "failed" | "running"
  const agentIdFilter = searchParams.get("agentId");

  // Collect every agent id in this project first, so we can filter runs by them.
  const projectAgents = await prisma.agent.findMany({
    where: { projectId },
    select: { id: true, name: true, model: true },
  });
  const projectAgentIds = projectAgents.map((a) => a.id);
  const agentLookup = new Map(projectAgents.map((a) => [a.id, a]));

  if (projectAgentIds.length === 0) {
    return apiResponse({
      runs: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    });
  }

  const statusMap: Record<string, string> = {
    success: "RUN_SUCCESS",
    failed: "RUN_FAILED",
    running: "RUN_RUNNING",
  };

  const where = {
    agentId: agentIdFilter
      ? (projectAgentIds.includes(agentIdFilter) ? agentIdFilter : "___no_match___")
      : { in: projectAgentIds },
    ...(statusFilter && statusMap[statusFilter]
      ? { status: statusMap[statusFilter] as "RUN_SUCCESS" | "RUN_FAILED" | "RUN_RUNNING" }
      : {}),
  };

  const [runs, total] = await Promise.all([
    prisma.agentRun.findMany({
      where,
      skip,
      take: limit,
      orderBy: { startedAt: "desc" },
    }),
    prisma.agentRun.count({ where }),
  ]);

  const enriched = runs.map((r) => {
    const agent = agentLookup.get(r.agentId);
    return {
      ...r,
      agentName: agent?.name ?? "(unknown)",
      agentModel: agent?.model ?? null,
    };
  });

  return apiResponse({
    runs: enriched,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});
