"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Plus, X, ArrowDown, Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useWorkflowsStore } from "@/stores/workflows-store";
import type { Workflow } from "@/stores/workflows-store";

interface Agent {
  id: string;
  name: string;
  model: string;
  status: string;
}

interface NewWorkflowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewWorkflowModal({ open, onOpenChange }: NewWorkflowModalProps) {
  const addWorkflow = useWorkflowsStore((s) => s.addWorkflow);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [name, setName] = useState("");
  const [steps, setSteps] = useState<Agent[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch("/api/agents")
      .then((r) => r.json())
      .then(({ data }) => setAgents(data.agents ?? []))
      .catch(() => toast.error("Failed to load agents"));
  }, [open]);

  const handleClose = () => {
    onOpenChange(false);
    setName("");
    setSteps([]);
  };

  const addStep = (agent: Agent) => {
    if (steps.find((s) => s.id === agent.id)) return; // no duplicates
    setSteps((prev) => [...prev, agent]);
  };

  const removeStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const moveStep = (from: number, to: number) => {
    setSteps((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Workflow name is required");
    if (steps.length < 2) return toast.error("Add at least 2 agents");

    setIsSaving(true);
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: "",
          steps: steps.map((a, i) => ({ agentId: a.id, agentName: a.name, position: i })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create workflow");

      // Normalise status to lowercase for the store
      const workflow: Workflow = {
        ...json.data,
        status: (json.data.status as string).toLowerCase() as Workflow["status"],
      };
      addWorkflow(workflow);
      toast.success(`Workflow "${name}" created`);
      handleClose();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const availableAgents = agents.filter((a) => !steps.find((s) => s.id === a.id));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="size-4 text-green-400" />
            New Workflow
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Workflow name</p>
            <Input
              placeholder="e.g. Review → Scan → Deploy"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Pipeline builder */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left: agent picker */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Available agents</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {availableAgents.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">All agents added</p>
                ) : (
                  availableAgents.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => addStep(a)}
                      className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 text-xs hover:border-green-500/40 hover:bg-green-500/5 transition-colors"
                    >
                      <span className="font-medium text-foreground truncate">{a.name}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant="outline" className="text-[9px] px-1 py-0">{a.model}</Badge>
                        <Plus className="size-3 text-green-400" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Right: pipeline */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Pipeline{steps.length > 0 ? ` (${steps.length} steps)` : ""}
              </p>
              {steps.length === 0 ? (
                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                  Add agents →
                </div>
              ) : (
                <div className="space-y-1">
                  {steps.map((step, i) => (
                    <div key={step.id}>
                      <div className="flex items-center gap-1.5 rounded-lg border border-green-500/20 bg-green-500/5 px-2.5 py-1.5">
                        <span className="text-[10px] font-mono text-green-400/60 w-4">{i + 1}</span>
                        <span className="flex-1 text-xs font-medium text-foreground truncate">{step.name}</span>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {i > 0 && (
                            <button
                              onClick={() => moveStep(i, i - 1)}
                              className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                              title="Move up"
                            >
                              <ChevronRight className="size-3 -rotate-90" />
                            </button>
                          )}
                          {i < steps.length - 1 && (
                            <button
                              onClick={() => moveStep(i, i + 1)}
                              className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                              title="Move down"
                            >
                              <ChevronRight className="size-3 rotate-90" />
                            </button>
                          )}
                          <button
                            onClick={() => removeStep(i)}
                            className="rounded p-0.5 text-muted-foreground hover:text-red-400"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      </div>
                      {i < steps.length - 1 && (
                        <div className="flex justify-center py-0.5">
                          <ArrowDown className="size-3 text-green-400/40" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {steps.length >= 2 && (
            <p className="text-[11px] text-muted-foreground">
              Each step&apos;s output will be piped as input to the next agent.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || steps.length < 2 || isSaving}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <GitBranch className="size-3.5 mr-1.5" />
                Create Workflow
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
