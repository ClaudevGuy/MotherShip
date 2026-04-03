import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireAuth,
  apiResponse,
  validateBody,
} from "@/lib/api-helpers";
import { z } from "zod";

// ── GET /api/profile ──

export const GET = withErrorHandler(async () => {
  const sessionUser = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      displayName: true,
      jobTitle: true,
      timezone: true,
      avatar: true,
      image: true,
      role: true,
    },
  });

  return apiResponse({ user });
});

// ── PATCH /api/profile ──

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  displayName: z.string().max(100).optional(),
  jobTitle: z.string().max(100).optional(),
  timezone: z.string().max(50).optional(),
  avatar: z.string().max(500000).optional(), // base64 data URL up to ~375KB image
});

export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const sessionUser = await requireAuth();
  const body = await validateBody(request, updateProfileSchema);

  const user = await prisma.user.update({
    where: { id: sessionUser.id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.displayName !== undefined && { displayName: body.displayName }),
      ...(body.jobTitle !== undefined && { jobTitle: body.jobTitle }),
      ...(body.timezone !== undefined && { timezone: body.timezone }),
      ...(body.avatar !== undefined && { avatar: body.avatar, image: body.avatar }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      displayName: true,
      jobTitle: true,
      timezone: true,
    },
  });

  return apiResponse({ user });
});
