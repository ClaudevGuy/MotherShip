import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  getProjectId,
  apiError,
  ApiError,
} from "@/lib/api-helpers";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";

const testSchema = z.object({
  userMessage: z.string().min(1),
  model: z.string().default("claude-sonnet-4-6"),
  temperature: z.number().min(0).max(1).default(0.7),
  maxTokens: z.number().min(1).max(8192).default(1000),
});

// ── POST /api/prompts/[id]/test — stream test response via SSE ──

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const projectId = await getProjectId();
    const { id } = await context.params;

    const prompt = await prisma.promptVersion.findFirst({
      where: { id, projectId },
    });
    if (!prompt) return apiError("Prompt not found", 404);

    const body = testSchema.parse(await request.json());

    // Resolve API key
    let apiKey: string | null = null;
    const integration = await prisma.integration.findFirst({
      where: { projectId, name: "Anthropic", status: "CONNECTED" },
    });
    if (integration) {
      const rawConfig = (integration.config as Record<string, string>) || {};
      for (const [, value] of Object.entries(rawConfig)) {
        try {
          const { decrypt } = await import("@/lib/encryption");
          apiKey = decrypt(value);
          break;
        } catch {
          apiKey = value;
          break;
        }
      }
    }
    if (!apiKey) apiKey = process.env.ANTHROPIC_API_KEY || null;
    if (!apiKey) return apiError("No Anthropic API key configured", 400);

    const client = new Anthropic({ apiKey });
    const startTime = Date.now();
    const encoder = new TextEncoder();

    // Cost rates for common models
    const rates: Record<string, { input: number; output: number }> = {
      "claude-haiku-4-5": { input: 0.25, output: 1.25 },
      "claude-sonnet-4-6": { input: 3, output: 15 },
      "claude-opus-4-6": { input: 15, output: 75 },
    };
    const rate = rates[body.model] || rates["claude-sonnet-4-6"];

    const responseStream = new ReadableStream({
      async start(controller) {
        const send = (data: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        send({ type: "info", model: body.model });

        try {
          const stream = client.messages.stream({
            model: body.model,
            max_tokens: body.maxTokens,
            temperature: body.temperature,
            system: prompt.content,
            messages: [{ role: "user", content: body.userMessage }],
          });

          stream.on("text", (text) => {
            send({ type: "delta", content: text });
          });

          const finalMessage = await stream.finalMessage();
          const duration = Date.now() - startTime;
          const tokensIn = finalMessage.usage.input_tokens;
          const tokensOut = finalMessage.usage.output_tokens;
          const cost = (tokensIn * rate.input + tokensOut * rate.output) / 1_000_000;

          send({
            type: "done",
            tokensIn,
            tokensOut,
            cost: Math.round(cost * 10000) / 10000,
            duration,
            model: body.model,
          });
        } catch (err) {
          send({ type: "error", message: (err as Error).message });
        }

        controller.close();
      },
    });

    return new NextResponse(responseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    if (err instanceof ApiError) return apiError(err.message, err.status);
    if (err instanceof z.ZodError) return apiError(err.issues.map((e) => e.message).join(", "), 422);
    console.error("Prompt test error:", err);
    return apiError("Internal server error", 500);
  }
}
