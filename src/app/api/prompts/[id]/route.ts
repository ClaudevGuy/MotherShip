import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireAuth,
  getProjectId,
  apiResponse,
  apiError,
} from "@/lib/api-helpers";

// ── GET /api/prompts/[id] — get prompt with all versions ──

export const GET = withErrorHandler(
  async (_request: NextRequest, context?: { params: Record<string, string> }) => {
    await requireAuth();
    const projectId = await getProjectId();
    const id = context?.params?.id;
    if (!id) return apiError("Prompt ID is required", 400);

    // Find the prompt by ID to get its name
    const prompt = await prisma.promptVersion.findFirst({
      where: { id, projectId },
    });
    if (!prompt) return apiError("Prompt not found", 404);

    // Get all versions for this prompt name
    const versions = await prisma.promptVersion.findMany({
      where: { projectId, name: prompt.name },
      orderBy: { version: "desc" },
    });

    return apiResponse({ prompt, versions });
  }
);

// ── DELETE /api/prompts/[id] — delete prompt and all its versions ──

export const DELETE = withErrorHandler(
  async (_request: NextRequest, context?: { params: Record<string, string> }) => {
    await requireAuth();
    const projectId = await getProjectId();
    const id = context?.params?.id;
    if (!id) return apiError("Prompt ID is required", 400);

    const prompt = await prisma.promptVersion.findFirst({
      where: { id, projectId },
    });
    if (!prompt) return apiError("Prompt not found", 404);

    // Delete all versions with this name
    await prisma.promptVersion.deleteMany({
      where: { projectId, name: prompt.name },
    });

    return apiResponse({ success: true });
  }
);
