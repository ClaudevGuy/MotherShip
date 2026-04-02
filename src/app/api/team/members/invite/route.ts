import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireRole,
  getProjectId,
  apiResponse,
  ApiError,
  validateBody,
} from "@/lib/api-helpers";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["viewer", "developer", "agent_manager", "admin"]),
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  await requireRole("admin");
  const projectId = await getProjectId();
  const body = await validateBody(request, inviteSchema);

  // Check if user already a member
  const existingUser = await prisma.user.findFirst({
    where: { email: body.email },
  });
  if (existingUser) {
    const existingMember = await prisma.projectMember.findFirst({
      where: { userId: existingUser.id, projectId },
    });
    if (existingMember) {
      throw new ApiError("This user is already a team member", 409);
    }
  }

  // Check if invite already pending
  const existingInvite = await prisma.teamInvite.findFirst({
    where: { projectId, email: body.email, status: "pending" },
  });
  if (existingInvite) {
    throw new ApiError("An invitation is already pending for this email", 409);
  }

  // Create invite (expires in 7 days)
  const invite = await prisma.teamInvite.create({
    data: {
      projectId,
      email: body.email,
      role: body.role,
      status: "pending",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return apiResponse({ invite }, 201);
});
