import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireAuth,
  getProjectId,
  apiResponse,
} from "@/lib/api-helpers";

// ── POST /api/notifications/read-all ──

export const POST = withErrorHandler(async () => {
  const user = await requireAuth();
  const projectId = await getProjectId();

  const result = await prisma.notification.updateMany({
    where: { projectId, userId: user.id, read: false },
    data: { read: true },
  });

  return apiResponse({ success: true, updated: result.count });
});
