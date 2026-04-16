import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireRole,
  getProjectId,
  apiResponse,
  apiError,
  ApiError,
} from "@/lib/api-helpers";
import { logAuditEvent } from "@/lib/audit";

// ── DELETE /api/agents/external/[id] ──
// Removes an external agent registration + its ingest events.

export const DELETE = withErrorHandler(
  async (request: NextRequest, context?: { params: Record<string, string> }) => {
    const user = await requireRole("admin");
    const projectId = await getProjectId();
    const id = context?.params?.id;

    if (!id) {
      return apiError("External agent ID is required", 400);
    }

    // Verify the external agent exists in this project
    const agent = await prisma.externalAgent.findFirst({
      where: { id, projectId },
    });

    if (!agent) {
      throw new ApiError("External agent not found", 404);
    }

    // Clean up related ingest events (matched by externalId + source, not FK)
    await prisma.ingestEvent.deleteMany({
      where: {
        projectId,
        agentId: agent.externalId,
        source: agent.source,
      },
    });

    await prisma.externalAgent.delete({ where: { id } });

    await logAuditEvent({
      projectId,
      userId: user.id,
      userName: user.name,
      action: "external_agent.delete",
      target: agent.name,
      details: `Deleted external agent "${agent.name}" from source "${agent.source}"`,
    });

    return apiResponse({ success: true, id });
  }
);
