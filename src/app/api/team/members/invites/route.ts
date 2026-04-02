import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireAuth,
  getProjectId,
  apiResponse,
} from "@/lib/api-helpers";

export const GET = withErrorHandler(async () => {
  await requireAuth();
  const projectId = await getProjectId();

  const invites = await prisma.teamInvite.findMany({
    where: { projectId, status: "pending" },
    orderBy: { createdAt: "desc" },
  });

  return apiResponse({ invites });
});
