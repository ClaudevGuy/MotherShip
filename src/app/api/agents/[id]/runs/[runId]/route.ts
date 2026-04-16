import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireAuth,
  getProjectId,
  apiResponse,
  apiError,
  ApiError,
} from "@/lib/api-helpers";

// ── GET /api/agents/[id]/runs/[runId] ──
// Returns a single run with full detail + the matching LlmCall record
// (joined loosely by agentId + closest startedAt timestamp) for tier/model info.

export const GET = withErrorHandler(
  async (_request: NextRequest, context?: { params: Record<string, string> }) => {
    await requireAuth();
    const projectId = await getProjectId();
    const agentId = context?.params?.id;
    const runId = context?.params?.runId;

    if (!agentId || !runId) {
      return apiError("Agent ID and Run ID are required", 400);
    }

    // Verify agent belongs to project
    const agent = await prisma.agent.findFirst({
      where: { id: agentId, projectId },
      select: { id: true, name: true, model: true, systemPrompt: true },
    });

    if (!agent) {
      throw new ApiError("Agent not found", 404);
    }

    const run = await prisma.agentRun.findFirst({
      where: { id: runId, agentId },
    });

    if (!run) {
      throw new ApiError("Run not found", 404);
    }

    // Try to find the matching LlmCall for richer selection metadata.
    // LlmCalls aren't FK-linked to AgentRuns; match by agentId + ~1s window
    // around startedAt (the execute route creates both records near-simultaneously).
    const windowStart = new Date(run.startedAt.getTime() - 2000);
    const windowEnd = new Date(run.startedAt.getTime() + run.duration + 2000);
    const llmCall = await prisma.llmCall.findFirst({
      where: {
        projectId,
        agentId,
        timestamp: { gte: windowStart, lte: windowEnd },
      },
      orderBy: { timestamp: "asc" },
      select: {
        selectedTier: true,
        selectionReason: true,
        wasUpgraded: true,
        originalTier: true,
        selectionDurationMs: true,
        model: true,
      },
    });

    return apiResponse({
      run,
      agent: { id: agent.id, name: agent.name, model: agent.model, systemPrompt: agent.systemPrompt },
      selection: llmCall ?? null,
    });
  }
);
