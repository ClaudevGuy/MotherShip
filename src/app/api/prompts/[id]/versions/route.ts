import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireAuth,
  getProjectId,
  apiResponse,
  apiError,
} from "@/lib/api-helpers";
import { z } from "zod";

const versionSchema = z.object({
  content: z.string().min(1),
  notes: z.string().min(1, "Version notes are required"),
  agentId: z.string().optional(),
});

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// ── POST /api/prompts/[id]/versions — save new version ──

export const POST = withErrorHandler(
  async (request: NextRequest, context?: { params: Record<string, string> }) => {
    const user = await requireAuth();
    const projectId = await getProjectId();
    const id = context?.params?.id;
    if (!id) return apiError("Prompt ID is required", 400);

    const prompt = await prisma.promptVersion.findFirst({
      where: { id, projectId },
    });
    if (!prompt) return apiError("Prompt not found", 404);

    const body = versionSchema.parse(await request.json());

    // Get the latest version number for this prompt name
    const latest = await prisma.promptVersion.findFirst({
      where: { projectId, name: prompt.name },
      orderBy: { version: "desc" },
    });
    const nextVersion = (latest?.version ?? 0) + 1;

    const newVersion = await prisma.promptVersion.create({
      data: {
        projectId,
        name: prompt.name,
        content: body.content,
        agentId: body.agentId ?? prompt.agentId,
        version: nextVersion,
        isActive: false,
        tokenCount: estimateTokens(body.content),
        createdBy: user.name || user.id,
        notes: body.notes,
      },
    });

    return apiResponse({ version: newVersion });
  }
);
