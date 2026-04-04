import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireAuth,
  getProjectId,
  apiResponse,
  apiError,
} from "@/lib/api-helpers";

// ── PUT /api/notifications/[id]/read ──

export const PUT = withErrorHandler(
  async (_request: NextRequest, context?: { params: Record<string, string> }) => {
    const user = await requireAuth();
    const projectId = await getProjectId();
    const id = context?.params?.id;
    if (!id) return apiError("Notification ID is required", 400);

    await prisma.notification.updateMany({
      where: { id, projectId, userId: user.id },
      data: { read: true },
    });

    return apiResponse({ success: true });
  }
);
