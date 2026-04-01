import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireRole,
  getProjectId,
  apiResponse,
  apiError,
  ApiError,
  validateBody,
} from "@/lib/api-helpers";
import { runWorkflowSchema } from "@/lib/validations/workflows";
import { logAuditEvent } from "@/lib/audit";

// ── POST /api/workflows/[id]/run ──
// Executes the workflow pipeline: each step's output feeds the next step's input.

export const POST = withErrorHandler(
  async (request: NextRequest, context?: { params: Record<string, string> }) => {
    const user = await requireRole("developer");
    const projectId = await getProjectId();
    const id = context?.params?.id;
    if (!id) return apiError("Workflow ID is required", 400);

    const workflow = await prisma.workflow.findFirst({
      where: { id, projectId },
      include: { steps: { orderBy: { position: "asc" } } },
    });
    if (!workflow) throw new ApiError("Workflow not found", 404);
    if (workflow.steps.length === 0) return apiError("Workflow has no steps", 400);

    const { input } = await validateBody(request, runWorkflowSchema);

    // Mark workflow as running
    await prisma.workflow.update({
      where: { id },
      data: { status: "RUNNING" },
    });

    const stepResults: { agentName: string; output: string }[] = [];
    let currentInput = input;
    let finalStatus: "COMPLETED" | "FAILED" = "COMPLETED";

    try {
      for (const step of workflow.steps) {
        const res = await fetch(
          `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/agents/${step.agentId}/execute`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-internal-run": "1" },
            body: JSON.stringify({ input: currentInput }),
          }
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(`Step "${step.agentName}" failed: ${err.error ?? res.statusText}`);
        }

        const json = await res.json();
        const output: string = json.data?.response ?? json.data?.content ?? String(json.data ?? "");
        stepResults.push({ agentName: step.agentName, output });
        currentInput = output; // pipe output to next step
      }
    } catch (err) {
      finalStatus = "FAILED";
      await prisma.workflow.update({
        where: { id },
        data: { status: "FAILED", lastRun: new Date(), totalRuns: { increment: 1 } },
      });
      throw err;
    }

    await prisma.workflow.update({
      where: { id },
      data: { status: "COMPLETED", lastRun: new Date(), totalRuns: { increment: 1 } },
    });

    await logAuditEvent({
      projectId,
      userId: user.id,
      userName: user.name,
      action: "workflow.run",
      target: workflow.name,
      details: `Ran workflow "${workflow.name}" — ${workflow.steps.length} steps, status: ${finalStatus}`,
    });

    return apiResponse({
      workflowId: id,
      status: finalStatus,
      steps: stepResults,
      finalOutput: currentInput,
    });
  }
);
