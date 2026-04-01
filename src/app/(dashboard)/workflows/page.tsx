"use client";

import React, { useEffect, useState } from "react";
import { GitBranch, Play, Trash2, Plus, Loader2, ArrowRight } from "lucide-react";
import { useWorkflowsStore, type Workflow } from "@/stores/workflows-store";
import { PageHeader, StatusBadge, GlassPanel } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { NewWorkflowModal } from "@/components/overview/NewWorkflowModal";
import { formatRelativeTime } from "@/lib/format";
import { toast } from "sonner";

const statusMap: Record<Workflow["status"], string> = {
  idle: "idle",
  running: "running",
  completed: "success",
  failed: "error",
};

function RunWorkflowPanel({ workflow, onClose }: { workflow: Workflow; onClose: () => void }) {
  const updateStatus = useWorkflowsStore((s) => s.updateWorkflowStatus);
  const [input, setInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{ agentName: string; output: string }[] | null>(null);

  const handleRun = async () => {
    if (!input.trim()) return toast.error("Input is required");
    setIsRunning(true);
    setResults(null);
    updateStatus(workflow.id, "running");
    try {
      const res = await fetch(`/api/workflows/${workflow.id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Run failed");
      setResults(json.data.steps);
      updateStatus(workflow.id, "completed");
      toast.success("Workflow completed");
    } catch (err) {
      updateStatus(workflow.id, "failed");
      toast.error((err as Error).message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Play className="size-4 text-green-400" />
            <span className="text-sm font-semibold">Run: {workflow.name}</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Pipeline preview */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-muted/20 p-3">
            {workflow.steps.map((step, i) => (
              <React.Fragment key={step.id}>
                <span className="rounded bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-xs font-medium text-green-300">
                  {step.agentName}
                </span>
                {i < workflow.steps.length - 1 && (
                  <ArrowRight className="size-3 text-muted-foreground/50" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Input */}
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Initial input</p>
            <textarea
              className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-green-500/50 resize-none"
              rows={3}
              placeholder="Enter the initial prompt for the pipeline..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          {/* Results */}
          {results && (
            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={i} className="rounded-lg border border-border bg-muted/20 p-3">
                  <p className="text-[10px] font-semibold text-green-400 mb-1">Step {i + 1}: {r.agentName}</p>
                  <p className="text-xs text-foreground/80 whitespace-pre-wrap max-h-24 overflow-y-auto">{r.output}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
          <Button variant="outline" onClick={onClose} disabled={isRunning}>Cancel</Button>
          <Button
            onClick={handleRun}
            disabled={!input.trim() || isRunning}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isRunning ? (
              <><Loader2 className="size-3.5 mr-1.5 animate-spin" />Running…</>
            ) : (
              <><Play className="size-3.5 mr-1.5" />Run Pipeline</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowsPage() {
  const { workflows, isLoading, fetch, removeWorkflow } = useWorkflowsStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [runTarget, setRunTarget] = useState<Workflow | null>(null);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleDelete = async (w: Workflow) => {
    if (!confirm(`Delete workflow "${w.name}"?`)) return;
    await removeWorkflow(w.id);
    toast.success(`"${w.name}" deleted`);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Workflows"
        description="Multi-agent pipelines that chain outputs between agents"
      >
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          <Plus className="size-3.5 mr-1.5" />
          New Workflow
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
          <Loader2 className="size-4 mr-2 animate-spin" />
          Loading workflows…
        </div>
      ) : workflows.length === 0 ? (
        <GlassPanel padding="lg">
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <GitBranch className="size-10 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">No workflows yet</p>
            <p className="text-xs text-muted-foreground/60">
              Create a workflow to chain multiple agents into a pipeline.
            </p>
            <Button
              onClick={() => setCreateOpen(true)}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              <Plus className="size-3.5 mr-1.5" />
              Create your first workflow
            </Button>
          </div>
        </GlassPanel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {workflows.map((w) => (
            <GlassPanel key={w.id} padding="md">
              <div className="flex flex-col gap-3 h-full">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{w.name}</p>
                    {w.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{w.description}</p>
                    )}
                  </div>
                  <StatusBadge status={statusMap[w.status] as Parameters<typeof StatusBadge>[0]["status"]} size="sm" />
                </div>

                {/* Pipeline preview */}
                <div className="flex flex-wrap items-center gap-1">
                  {w.steps.map((step, i) => (
                    <React.Fragment key={step.id}>
                      <span className="rounded bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 text-[10px] font-medium text-green-300 truncate max-w-[80px]">
                        {step.agentName}
                      </span>
                      {i < w.steps.length - 1 && (
                        <ArrowRight className="size-2.5 text-muted-foreground/40 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>{w.steps.length} steps</span>
                  <span>{w.totalRuns} run{w.totalRuns !== 1 ? "s" : ""}</span>
                  {w.lastRun && <span>Last: {formatRelativeTime(w.lastRun)}</span>}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-auto pt-1">
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white h-7 text-xs"
                    onClick={() => setRunTarget(w)}
                  >
                    <Play className="size-3 mr-1" />
                    Run
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400 hover:border-red-500/30"
                    onClick={() => handleDelete(w)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            </GlassPanel>
          ))}
        </div>
      )}

      <NewWorkflowModal open={createOpen} onOpenChange={setCreateOpen} />
      {runTarget && <RunWorkflowPanel workflow={runTarget} onClose={() => setRunTarget(null)} />}
    </div>
  );
}
