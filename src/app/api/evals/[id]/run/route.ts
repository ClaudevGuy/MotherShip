import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withErrorHandler, requireAuth, getProjectId,
  apiResponse, apiError, ApiError,
} from "@/lib/api-helpers";
import { createNotification } from "@/lib/create-notification";
import Anthropic from "@anthropic-ai/sdk";

// ── Simple criterion matchers ──

function matchSimpleCriterion(criterion: string, output: string): { matched: boolean; passed: boolean } {
  const c = criterion.toLowerCase().trim();
  const o = output.toLowerCase();

  // "mentions [X]" or "contains [X]"
  let m = c.match(/^(?:mentions|contains)\s+(.+)$/);
  if (m) return { matched: true, passed: o.includes(m[1]) };

  // "under [N] words"
  m = c.match(/^under\s+(\d+)\s+words$/);
  if (m) return { matched: true, passed: output.split(/\s+/).length < parseInt(m[1]) };

  // "includes code" or "includes code block"
  if (c === "includes code" || c === "includes code block")
    return { matched: true, passed: output.includes("```") };

  // "starts with [X]"
  m = c.match(/^starts\s+with\s+(.+)$/);
  if (m) return { matched: true, passed: o.startsWith(m[1]) };

  // "ends with [X]"
  m = c.match(/^ends\s+with\s+(.+)$/);
  if (m) return { matched: true, passed: o.endsWith(m[1]) };

  // "is shorter than [N] chars"
  m = c.match(/^is\s+shorter\s+than\s+(\d+)\s+chars?$/);
  if (m) return { matched: true, passed: output.length < parseInt(m[1]) };

  // "does not mention [X]"
  m = c.match(/^does\s+not\s+mention\s+(.+)$/);
  if (m) return { matched: true, passed: !o.includes(m[1]) };

  return { matched: false, passed: false };
}

// ── AI Judge ──

async function judgeWithAI(criterion: string, output: string, apiKey: string): Promise<boolean> {
  try {
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 10,
      temperature: 0,
      system: "You are an evaluation judge. Respond with only PASS or FAIL.",
      messages: [{
        role: "user",
        content: `Criterion: ${criterion}\nAgent output: ${output}\nDoes the output meet this criterion? Answer only PASS or FAIL.`,
      }],
    });
    const text = msg.content.filter((b): b is Anthropic.TextBlock => b.type === "text").map(b => b.text).join("");
    return text.toUpperCase().includes("PASS");
  } catch {
    return false;
  }
}

// ── POST /api/evals/[id]/run — execute eval suite ──

export const POST = withErrorHandler(
  async (_request: NextRequest, context?: { params: Record<string, string> }) => {
    await requireAuth();
    const projectId = await getProjectId();
    const id = context?.params?.id;
    if (!id) return apiError("Suite ID required", 400);

    const suite = await prisma.evalSuite.findFirst({
      where: { id, projectId },
      include: { cases: { orderBy: { createdAt: "asc" } } },
    });
    if (!suite) return apiError("Suite not found", 404);
    if (suite.cases.length === 0) return apiError("Suite has no test cases", 400);

    // Resolve API key (DB-first, env-fallback, logs which source won)
    const { resolveProviderKey } = await import("@/lib/integrations/resolve-key");
    const resolved = await resolveProviderKey(projectId, "Anthropic", "ANTHROPIC_API_KEY");
    if (!resolved) return apiError("No Anthropic API key configured", 400);
    const apiKey = resolved.apiKey;

    // Create run record
    const startTime = Date.now();
    const evalRun = await prisma.evalRun.create({
      data: { suiteId: id, status: "running" },
    });

    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const caseResults: {
      caseId: string; input: string; output: string;
      criteriaResults: { criterion: string; passed: boolean; method: string }[];
      passed: boolean; tokensIn: number; tokensOut: number; cost: number; duration: number;
    }[] = [];

    let totalCost = 0;

    try {
      for (const evalCase of suite.cases) {
        const caseStart = Date.now();

        // Call execute-sync for this agent
        const res = await fetch(`${baseUrl}/api/agents/${suite.agentId}/execute-sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-project-id": projectId },
          body: JSON.stringify({ input: evalCase.input }),
        });

        let output = "";
        let tokensIn = 0, tokensOut = 0, caseCost = 0;

        if (res.ok) {
          const json = await res.json();
          const d = json.data || {};
          output = d.output || "";
          tokensIn = d.tokensIn || 0;
          tokensOut = d.tokensOut || 0;
          caseCost = d.cost || 0;
        } else {
          const err = await res.json().catch(() => ({ error: "Agent execution failed" }));
          output = `ERROR: ${err.error || res.statusText}`;
        }

        // Score each criterion
        const criteriaResults: { criterion: string; passed: boolean; method: string }[] = [];
        for (const criterion of evalCase.criteria) {
          const simple = matchSimpleCriterion(criterion, output);
          if (simple.matched) {
            criteriaResults.push({ criterion, passed: simple.passed, method: "String match" });
          } else {
            const passed = await judgeWithAI(criterion, output, apiKey!);
            criteriaResults.push({ criterion, passed, method: "AI Judge" });
          }
        }

        const casePassed = criteriaResults.every(r => r.passed);
        const caseDuration = Date.now() - caseStart;
        totalCost += caseCost;

        caseResults.push({
          caseId: evalCase.id,
          input: evalCase.input,
          output,
          criteriaResults,
          passed: casePassed,
          tokensIn, tokensOut,
          cost: caseCost,
          duration: caseDuration,
        });
      }
    } catch (err) {
      const errorMsg = (err as Error).message;
      await prisma.evalRun.update({
        where: { id: evalRun.id },
        data: {
          status: "failed",
          completedAt: new Date(),
          duration: Date.now() - startTime,
          results: { error: errorMsg, caseResults },
        },
      });
      throw new ApiError(`Eval run failed: ${errorMsg}`, 500);
    }

    // Calculate score
    const passedCount = caseResults.filter(r => r.passed).length;
    const score = Math.round((passedCount / caseResults.length) * 100);
    const duration = Date.now() - startTime;

    await prisma.evalRun.update({
      where: { id: evalRun.id },
      data: {
        status: "completed",
        score,
        results: caseResults,
        totalCost,
        duration,
        completedAt: new Date(),
      },
    });

    // Notification
    createNotification({
      projectId,
      title: `Eval completed: ${suite.name}`,
      message: `Scored ${score}% (${passedCount}/${caseResults.length} cases passed)`,
      type: score >= 80 ? "success" : score >= 60 ? "warning" : "error",
      category: "agent",
      link: `/evals/${id}`,
    }).catch(() => {});

    return apiResponse({
      runId: evalRun.id,
      score,
      passed: passedCount,
      total: caseResults.length,
      totalCost,
      duration,
      results: caseResults,
    });
  }
);
