import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireRole,
  getProjectId,
  apiResponse,
  ApiError,
} from "@/lib/api-helpers";

export const DELETE = withErrorHandler(async (
  _request: NextRequest,
  context?: { params: Record<string, string> }
) => {
  await requireRole("admin");
  const projectId = await getProjectId();
  const inviteId = context?.params?.id;

  if (!inviteId) throw new ApiError("Invite ID is required", 400);

  const invite = await prisma.teamInvite.findFirst({
    where: { id: inviteId, projectId },
  });
  if (!invite) throw new ApiError("Invite not found", 404);

  await prisma.teamInvite.delete({
    where: { id: inviteId },
  });

  return apiResponse({ deleted: true });
});
