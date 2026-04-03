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
// Uses the sync execute endpoint (not SSE) for internal agent calls.

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
    const startTime = Date.now();
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    // Mark workflow as running
    await prisma.workflow.update({
      where: { id },
      data: { status: "RUNNING" },
    });

    // FIX 2: Create WorkflowRun record
    const workflowRun = await prisma.workflowRun.create({
      data: {
        workflowId: workflow.id,
        status: "running",
        startedAt: new Date(),
        triggeredBy: "manual",
        stepResults: [],
      },
    });

    const stepResults: {
      stepIndex: number;
      agentId: string;
      agentName: string;
      input: string;
      output: string;
      tokensIn: number;
      tokensOut: number;
      cost: number;
      duration: number;
      model: string;
      status: string;
    }[] = [];

    let currentInput = input;

    try {
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];

        // FIX 1: Use execute-sync (JSON) instead of execute (SSE)
        // FIX 3: Pass x-project-id header
        const res = await fetch(
          `${baseUrl}/api/agents/${step.agentId}/execute-sync`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-project-id": projectId,
            },
            body: JSON.stringify({ input: currentInput }),
          }
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Unknown error" }));
          const errorMsg = err.error ?? res.statusText;
          throw new Error(`Step ${i + 1} "${step.agentName}" failed: ${errorMsg}`);
        }

        const json = await res.json();
        const data = json.data;

        const stepResult = {
          stepIndex: i,
          agentId: step.agentId,
          agentName: step.agentName,
          input: currentInput,
          output: data.output ?? "",
          tokensIn: data.tokensIn ?? 0,
          tokensOut: data.tokensOut ?? 0,
          cost: data.cost ?? 0,
          duration: data.duration ?? 0,
          model: data.model ?? "",
          status: "completed",
        };

        stepResults.push(stepResult);

        // Update WorkflowRun with step results after each step
        await prisma.workflowRun.update({
          where: { id: workflowRun.id },
          data: { stepResults },
        });

        // Pipe output to next step
        currentInput = data.output ?? "";
      }
    } catch (err) {
      const errorMsg = (err as Error).message;

      // Update WorkflowRun as failed
      await prisma.workflowRun.update({
        where: { id: workflowRun.id },
        data: {
          status: "failed",
          completedAt: new Date(),
          duration: Date.now() - startTime,
          error: errorMsg,
          stepResults,
        },
      });

      await prisma.workflow.update({
        where: { id },
        data: { status: "FAILED", lastRun: new Date(), totalRuns: { increment: 1 } },
      });

      throw new ApiError(errorMsg, 500);
    }

    const totalDuration = Date.now() - startTime;

    // Update WorkflowRun as completed
    await prisma.workflowRun.update({
      where: { id: workflowRun.id },
      data: {
        status: "completed",
        completedAt: new Date(),
        duration: totalDuration,
        stepResults,
      },
    });

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
      details: `Ran workflow "${workflow.name}" — ${workflow.steps.length} steps, completed in ${totalDuration}ms`,
    });

    return apiResponse({
      workflowId: id,
      runId: workflowRun.id,
      status: "completed",
      steps: stepResults,
      finalOutput: currentInput,
      duration: totalDuration,
    });
  }
);
