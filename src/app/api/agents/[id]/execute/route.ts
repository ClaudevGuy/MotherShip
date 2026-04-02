import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import {
  requireRole,
  getProjectId,
  apiError,
  ApiError,
} from "@/lib/api-helpers";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { selectModel, getTierConfig, type Tier, type ProviderKey } from "@/lib/model-selector";
import { profileTask } from "@/lib/agent-profiler";

const executeSchema = z.object({
  input: z.string().min(1, "Input is required"),
});

// Default model per provider (used for "manual" strategy)
const PROVIDER_DEFAULT_MODEL: Record<string, string> = {
  CLAUDE: "claude-sonnet-4-6",
  GPT4: "gpt-4o",
  GEMINI: "gemini-2.0-flash",
};

// ── POST /api/agents/[id]/execute — Streaming SSE ──

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole("developer");
    const ip = (await headers()).get("x-forwarded-for") ?? "anon";
    const rl = rateLimit(`execute:${user.id}:${ip}`, { limit: 20, windowMs: 60_000 });
    if (!rl.success) {
      return apiError("Rate limit exceeded — max 20 executions per minute", 429);
    }

    const projectId = await getProjectId();
    const { id: agentId } = await context.params;
    if (!agentId) return apiError("Agent ID is required", 400);

    // Load agent
    const agent = await prisma.agent.findFirst({
      where: { id: agentId, projectId },
    });
    if (!agent) throw new ApiError("Agent not found", 404);

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return apiError("Add ANTHROPIC_API_KEY to your .env file", 500);
    }

    // Parse body
    const body = executeSchema.parse(await request.json());

    // ── Resolve model based on strategy ──
    const providerKey = agent.model;
    const strategy = (agent as Record<string, unknown>).modelStrategy as string ?? "auto";
    const selectionStart = Date.now();
    let resolvedModelId: string;
    let selectedTier: number | null = null;
    let selectionReason: string | null = null;

    if (strategy === "manual" || providerKey !== "CLAUDE") {
      resolvedModelId = PROVIDER_DEFAULT_MODEL[providerKey] || "claude-sonnet-4-6";
      selectionReason = "Manual strategy — using provider default";
    } else if (strategy === "cost_first") {
      const tierConfig = getTierConfig(providerKey as ProviderKey, 3);
      resolvedModelId = tierConfig?.modelId ?? "claude-haiku-4-5";
      selectedTier = 3;
      selectionReason = "Cost-first strategy — always tier 3";
    } else if (strategy === "quality_first") {
      const tierConfig = getTierConfig(providerKey as ProviderKey, 1);
      resolvedModelId = tierConfig?.modelId ?? "claude-opus-4-6";
      selectedTier = 1;
      selectionReason = "Quality-first strategy — always tier 1";
    } else {
      const profile = profileTask(
        {
          name: agent.name,
          model: providerKey,
          tags: agent.tags,
          tools: [],
          systemPrompt: agent.systemPrompt,
          temperature: agent.temperature,
          maxTokens: agent.maxTokens,
          tasksCompleted: agent.tasksCompleted,
        },
        body.input
      );
      const selection = selectModel(profile);
      resolvedModelId = selection.modelId;
      selectedTier = selection.tier;
      selectionReason = selection.reason;
    }
    const selectionDurationMs = Date.now() - selectionStart;

    // Cost rates
    let inputRate = 0.003 / 1000;
    let outputRate = 0.015 / 1000;
    if (selectedTier) {
      const tierConfig = getTierConfig(providerKey as ProviderKey, selectedTier as Tier);
      if (tierConfig) {
        inputRate = tierConfig.inputCostPerMillion / 1_000_000;
        outputRate = tierConfig.outputCostPerMillion / 1_000_000;
      }
    }

    // Update agent to running
    await prisma.agent.update({
      where: { id: agentId },
      data: { status: "RUNNING" as never },
    });

    const startTime = Date.now();
    const client = new Anthropic({ apiKey });

    // Build messages
    const userMessages: Anthropic.MessageParam[] = [
      { role: "user", content: body.input },
    ];

    // ── Stream response via SSE ──
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        // Send model selection info first
        send({
          type: "info",
          model: resolvedModelId,
          tier: selectedTier,
          reason: selectionReason,
          selectionMs: selectionDurationMs,
        });

        let fullContent = "";
        let tokensIn = 0;
        let tokensOut = 0;

        try {
          const stream = client.messages.stream({
            model: resolvedModelId,
            max_tokens: agent.maxTokens,
            temperature: agent.temperature,
            system: agent.systemPrompt || undefined,
            messages: userMessages,
          });

          stream.on("text", (text) => {
            fullContent += text;
            send({ type: "delta", content: text });
          });

          const finalMessage = await stream.finalMessage();
          tokensIn = finalMessage.usage.input_tokens;
          tokensOut = finalMessage.usage.output_tokens;

          const duration = Date.now() - startTime;
          const cost = tokensIn * inputRate + tokensOut * outputRate;

          // Send completion event
          send({
            type: "done",
            tokensIn,
            tokensOut,
            cost: Math.round(cost * 10000) / 10000,
            duration,
            model: resolvedModelId,
          });

          // ── Save to DB (async, don't block stream) ──
          const dbOps = async () => {
            await prisma.llmCall.create({
              data: {
                projectId,
                model: resolvedModelId,
                prompt: `[system] ${agent.systemPrompt}\n[user] ${body.input}`,
                response: fullContent,
                tokensIn,
                tokensOut,
                latency: duration,
                cost,
                agentId,
                agentName: agent.name,
                selectedTier,
                selectionReason,
                selectionDurationMs,
                wasUpgraded: false,
                originalTier: null,
              },
            });

            await prisma.agentRun.create({
              data: {
                agentId,
                duration,
                status: "RUN_SUCCESS" as never,
                tokensUsed: tokensIn + tokensOut,
                cost,
                output: fullContent,
              },
            });

            await prisma.agent.update({
              where: { id: agentId },
              data: {
                status: "IDLE" as never,
                lastRun: new Date(),
                tokenUsage: { increment: tokensIn + tokensOut },
                totalCost: { increment: cost },
                tasksCompleted: { increment: 1 },
              },
            });
          };

          dbOps().catch((err) => console.error("DB save error:", err));
        } catch (err) {
          const errorMsg = (err as Error).message;
          send({ type: "error", message: errorMsg });

          // Record failure
          prisma.agentRun.create({
            data: {
              agentId,
              duration: Date.now() - startTime,
              status: "RUN_FAILED" as never,
              tokensUsed: 0,
              cost: 0,
              output: `Error: ${errorMsg}`,
            },
          }).catch(() => {});

          prisma.agent.update({
            where: { id: agentId },
            data: { status: "ERROR" as never, lastRun: new Date() },
          }).catch(() => {});
        }

        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return apiError(err.message, err.status);
    }
    if (err instanceof z.ZodError) {
      return apiError(`Validation error: ${err.issues.map((e) => e.message).join(", ")}`, 422);
    }
    console.error("Execute error:", err);
    return apiError("Internal server error", 500);
  }
}
