import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireAuth,
  getProjectId,
  apiResponse,
  apiError,
} from "@/lib/api-helpers";

// ── PUT /api/prompts/[id]/activate — set this version as active ──

export const PUT = withErrorHandler(
  async (_request: NextRequest, context?: { params: Record<string, string> }) => {
    await requireAuth();
    const projectId = await getProjectId();
    const id = context?.params?.id;
    if (!id) return apiError("Prompt ID is required", 400);

    const prompt = await prisma.promptVersion.findFirst({
      where: { id, projectId },
    });
    if (!prompt) return apiError("Prompt not found", 404);

    // Deactivate all versions with this name
    await prisma.promptVersion.updateMany({
      where: { projectId, name: prompt.name },
      data: { isActive: false },
    });

    // Activate this specific version
    await prisma.promptVersion.update({
      where: { id },
      data: { isActive: true },
    });

    return apiResponse({ success: true, activatedVersion: prompt.version });
  }
);
