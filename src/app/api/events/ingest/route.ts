import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ── Validation ──

const eventSchema = z.object({
  type: z.enum([
    "agent.run.started",
    "agent.run.completed",
    "agent.run.failed",
    "agent.status.changed",
    "cost.incurred",
  ]),
  source: z.string().min(1, "Source is required (e.g. 'paperclip', 'crewai')"),
  agent: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),
    model: z.string().optional(),
  }),
  data: z.object({
    status: z.string().optional(),
    tokensIn: z.number().int().optional(),
    tokensOut: z.number().int().optional(),
    cost: z.number().optional(),
    duration: z.number().int().optional(),
    error: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }).optional(),
});

const batchSchema = z.object({
  events: z.array(eventSchema).min(1).max(100),
});

// ── Auth: API key from header ──

async function authenticateIngest(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);

  // Check against API keys in the database
  const { createHash } = await import("crypto");
  const hash = createHash("sha256").update(token).digest("hex");

  const apiKey = await prisma.apiKey.findFirst({
    where: { hashedKey: hash, status: "active" },
  });

  if (!apiKey) return null;

  // Update last used
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsed: new Date() },
  });

  return apiKey.projectId;
}

// Fallback: use default project if no auth (for development)
async function getDefaultProjectId(): Promise<string | null> {
  const project = await prisma.project.findFirst();
  return project?.id || null;
}

// ── Process a single event ──

async function processEvent(
  projectId: string,
  event: z.infer<typeof eventSchema>
) {
  const { type, source, agent, data } = event;

  // 1. Upsert the external agent
  const externalAgent = await prisma.externalAgent.upsert({
    where: {
      projectId_source_externalId: {
        projectId,
        source,
        externalId: agent.id,
      },
    },
    create: {
      projectId,
      externalId: agent.id,
      source,
      name: agent.name,
      description: agent.description || null,
      model: agent.model || null,
      status: data?.status || "idle",
      lastEventAt: new Date(),
    },
    update: {
      name: agent.name,
      ...(agent.description && { description: agent.description }),
      ...(agent.model && { model: agent.model }),
      ...(data?.status && { status: data.status }),
      lastEventAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // 2. Store the raw event
  await prisma.ingestEvent.create({
    data: {
      projectId,
      type,
      source,
      agentId: agent.id,
      agentName: agent.name,
      model: agent.model || null,
      tokensIn: data?.tokensIn || null,
      tokensOut: data?.tokensOut || null,
      cost: data?.cost || null,
      duration: data?.duration || null,
      status: data?.status || null,
      error: data?.error || null,
      metadata: data?.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
    },
  });

  // 3. Update agent aggregates based on event type
  if (type === "agent.run.completed") {
    await prisma.externalAgent.update({
      where: { id: externalAgent.id },
      data: {
        status: "idle",
        totalRuns: { increment: 1 },
        ...(data?.cost && { totalCost: { increment: data.cost } }),
        ...(data?.tokensIn && data?.tokensOut && {
          totalTokens: { increment: (data.tokensIn || 0) + (data.tokensOut || 0) },
        }),
      },
    });
  } else if (type === "agent.run.failed") {
    await prisma.externalAgent.update({
      where: { id: externalAgent.id },
      data: {
        status: "error",
        totalRuns: { increment: 1 },
        errorCount: { increment: 1 },
      },
    });
  } else if (type === "agent.run.started") {
    await prisma.externalAgent.update({
      where: { id: externalAgent.id },
      data: { status: "running" },
    });
  }

  return externalAgent;
}

// ── POST /api/events/ingest ──
// Accepts a single event or a batch of up to 100 events

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    let projectId = await authenticateIngest(request);
    if (!projectId) {
      // Fallback for development (no API key required)
      projectId = await getDefaultProjectId();
      if (!projectId) {
        return NextResponse.json(
          { error: "Unauthorized. Provide a valid API key via Authorization: Bearer <key>" },
          { status: 401 }
        );
      }
    }

    const body = await request.json();

    // Handle single event or batch
    let events: z.infer<typeof eventSchema>[];

    if (body.events) {
      // Batch format: { events: [...] }
      const parsed = batchSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation error", details: parsed.error.issues },
          { status: 422 }
        );
      }
      events = parsed.data.events;
    } else {
      // Single event format
      const parsed = eventSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation error", details: parsed.error.issues },
          { status: 422 }
        );
      }
      events = [parsed.data];
    }

    // Process all events
    const results = [];
    for (const event of events) {
      const agent = await processEvent(projectId, event);
      results.push({ eventType: event.type, agentId: agent.externalId, agentName: agent.name });
    }

    return NextResponse.json({
      ok: true,
      processed: results.length,
      events: results,
    }, { status: 200 });

  } catch (err) {
    console.error("Ingest error:", err);
    return NextResponse.json(
      { error: "Internal server error", message: (err as Error).message },
      { status: 500 }
    );
  }
}
