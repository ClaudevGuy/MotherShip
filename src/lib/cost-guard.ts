import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/create-notification";

/**
 * Check if an agent's hourly spend exceeds the auto-pause threshold.
 * If so, pause the agent and create a notification.
 * Returns true if the agent was paused.
 */
export async function checkCostAnomaly(agentId: string, projectId: string): Promise<boolean> {
  // Read threshold from project settings (stored in DB or defaults)
  // For now, check via a simple hourly spend query
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const hourlyRuns = await prisma.agentRun.findMany({
    where: {
      agentId,
      startedAt: { gte: oneHourAgo },
    },
    select: { cost: true },
  });

  const hourlySpend = hourlyRuns.reduce((sum, r) => sum + (r.cost || 0), 0);

  // Default threshold: $10/hour (can be overridden per-project in future)
  const threshold = 10;

  if (hourlySpend > threshold) {
    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (agent && agent.status !== "PAUSED") {
      await prisma.agent.update({
        where: { id: agentId },
        data: { status: "PAUSED" as never },
      });

      await createNotification({
        projectId,
        title: "Agent auto-paused",
        message: `${agent.name} was auto-paused. Hourly spend ($${hourlySpend.toFixed(2)}) exceeded the $${threshold} threshold.`,
        type: "warning",
        category: "cost",
        link: `/agents/${agentId}`,
      });

      return true;
    }
  }

  return false;
}
