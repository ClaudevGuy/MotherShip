import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireAuth,
  getProjectId,
  apiResponse,
} from "@/lib/api-helpers";

// ── GET /api/costs/agent-costs ──
// Computes real cost data from Agent records (which track totalCost, tasksCompleted)

export const GET = withErrorHandler(async () => {
  await requireAuth();
  const projectId = await getProjectId();

  // Get agents with their actual cost data
  const agents = await prisma.agent.findMany({
    where: { projectId },
    select: {
      id: true,
      name: true,
      totalCost: true,
      tasksCompleted: true,
    },
    orderBy: { totalCost: "desc" },
  });

  // Also check AgentCost table for any seeded/legacy data
  const legacyCosts = await prisma.agentCost.findMany({
    where: { projectId },
    orderBy: { totalCost: "desc" },
  });

  // Merge: prefer live agent data, fall back to legacy AgentCost
  const costMap = new Map<string, { agentId: string; agentName: string; costPerRun: number; totalRuns: number; totalCost: number; trend: number }>();

  for (const agent of agents) {
    if (agent.totalCost > 0 || agent.tasksCompleted > 0) {
      costMap.set(agent.id, {
        agentId: agent.id,
        agentName: agent.name,
        costPerRun: agent.tasksCompleted > 0 ? agent.totalCost / agent.tasksCompleted : 0,
        totalRuns: agent.tasksCompleted,
        totalCost: agent.totalCost,
        trend: 0,
      });
    }
  }

  for (const lc of legacyCosts) {
    if (!costMap.has(lc.agentId || lc.id)) {
      costMap.set(lc.agentId || lc.id, {
        agentId: lc.agentId || lc.id,
        agentName: lc.agentName,
        costPerRun: lc.totalRuns > 0 ? lc.totalCost / lc.totalRuns : 0,
        totalRuns: lc.totalRuns,
        totalCost: lc.totalCost,
        trend: lc.trend,
      });
    }
  }

  const costs = Array.from(costMap.values()).sort((a, b) => b.totalCost - a.totalCost);

  return apiResponse({
    costs,
    pagination: { page: 1, limit: 50, total: costs.length, totalPages: 1 },
  });
});
