import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireAuth,
  getProjectId,
  apiResponse,
  apiError,
} from "@/lib/api-helpers";

// ── DELETE /api/notifications/[id] ──

export const DELETE = withErrorHandler(
  async (_request: NextRequest, context?: { params: Record<string, string> }) => {
    const user = await requireAuth();
    const projectId = await getProjectId();
    const id = context?.params?.id;
    if (!id) return apiError("Notification ID is required", 400);

    await prisma.notification.deleteMany({
      where: { id, projectId, userId: user.id },
    });

    return apiResponse({ success: true });
  }
);
