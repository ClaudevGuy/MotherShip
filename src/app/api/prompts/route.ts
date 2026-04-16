import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireAuth,
  getProjectId,
  apiResponse,
} from "@/lib/api-helpers";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  content: z.string().min(1),
  agentId: z.string().optional(),
  notes: z.string().optional(),
});

// Rough token estimate: ~4 chars per token
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// ── GET /api/prompts — list all prompts (latest version per name) ──

export const GET = withErrorHandler(async () => {
  await requireAuth();
  const projectId = await getProjectId();

  // Get all prompt versions, grouped by name — return latest version per name
  const allVersions = await prisma.promptVersion.findMany({
    where: { projectId },
    orderBy: [{ name: "asc" }, { version: "desc" }],
  });

  // Dedupe: keep the highest version per name, and also find the active one
  const promptMap = new Map<string, {
    latest: typeof allVersions[0];
    activeVersion: number | null;
    versions: number;
  }>();

  for (const v of allVersions) {
    const existing = promptMap.get(v.name);
    if (!existing) {
      promptMap.set(v.name, {
        latest: v,
        activeVersion: v.isActive ? v.version : null,
        versions: 1,
      });
    } else {
      existing.versions++;
      if (v.isActive) existing.activeVersion = v.version;
    }
  }

  const prompts = Array.from(promptMap.values()).map(({ latest, activeVersion, versions }) => ({
    id: latest.id,
    name: latest.name,
    agentId: latest.agentId,
    version: latest.version,
    activeVersion,
    versions,
    tokenCount: latest.tokenCount,
    isActive: latest.isActive,
    createdAt: latest.createdAt,
    createdBy: latest.createdBy,
    notes: latest.notes,
  }));

  return apiResponse({ prompts });
});

// ── POST /api/prompts — create new prompt (v1) ──

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await requireAuth();
  const projectId = await getProjectId();
  const body = createSchema.parse(await request.json());

  const prompt = await prisma.promptVersion.create({
    data: {
      projectId,
      name: body.name,
      content: body.content,
      agentId: body.agentId || null,
      version: 1,
      isActive: true,
      tokenCount: estimateTokens(body.content),
      createdBy: user.name || user.id,
      notes: body.notes || "Initial version",
    },
  });

  return apiResponse({ prompt });
});
