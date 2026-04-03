import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireAuth,
  getProjectId,
  apiResponse,
} from "@/lib/api-helpers";

// ── GET /api/agents/external ──
// Returns all external agents registered via the ingest API

export const GET = withErrorHandler(async () => {
  await requireAuth();
  const projectId = await getProjectId();

  const agents = await prisma.externalAgent.findMany({
    where: { projectId },
    orderBy: { lastEventAt: "desc" },
  });

  // Get recent event counts per agent (last 24h)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentEvents = await prisma.ingestEvent.groupBy({
    by: ["agentId"],
    where: {
      projectId,
      timestamp: { gte: oneDayAgo },
    },
    _count: { id: true },
  });

  const eventCountMap = new Map(
    recentEvents.map((r) => [r.agentId, r._count.id])
  );

  const enriched = agents.map((agent) => ({
    ...agent,
    recentEvents24h: eventCountMap.get(agent.externalId) || 0,
  }));

  return apiResponse({
    agents: enriched,
    total: agents.length,
  });
});
