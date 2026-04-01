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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Agent {
  id: string;
  name: string;
  model: string;
  status: string;
}

interface RunEvalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RunEvalDialog({ open, onOpenChange }: RunEvalDialogProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/agents")
      .then((r) => r.json())
      .then(({ data }) => {
        setAgents(data.agents ?? []);
        if (data.agents?.length) setSelectedId(data.agents[0].id);
      })
      .catch(() => toast.error("Failed to load agents"));
  }, [open]);

  const handleClose = () => {
    onOpenChange(false);
    setResult(null);
    setInput("");
  };

  const handleRun = async () => {
    if (!selectedId || !input.trim()) return;
    setIsRunning(true);
    setResult(null);
    try {
      const res = await fetch(`/api/agents/${selectedId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Eval failed");
      const content = json.data?.response ?? json.data?.content ?? JSON.stringify(json.data);
      setResult(content);
      toast.success("Eval completed");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsRunning(false);
    }
  };

  const selectedAgent = agents.find((a) => a.id === selectedId);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="size-4 text-purple-400" />
            Run Eval
          </DialogTitle>
        </DialogHeader>

        {agents.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No agents found. Deploy an agent first.
          </p>
        ) : (
          <div className="space-y-4">
            {/* Agent selector */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Select agent</p>
              <div className="flex flex-wrap gap-2">
                {agents.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedId(a.id)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                      selectedId === a.id
                        ? "border-purple-500/60 bg-purple-500/10 text-purple-300"
                        : "border-border bg-card/60 text-muted-foreground hover:border-border hover:text-foreground"
                    }`}
                  >
                    {a.name}
                    <Badge variant="outline" className="text-[9px] px-1 py-0">
                      {a.model}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Test input</p>
              <Textarea
                placeholder="Enter a test prompt for the agent..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={3}
                className="resize-none text-sm"
              />
            </div>

            {/* Result */}
            {result && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Response</p>
                <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs text-foreground whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {result}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isRunning}>
            {result ? "Close" : "Cancel"}
          </Button>
          {agents.length > 0 && (
            <Button
              onClick={handleRun}
              disabled={!selectedId || !input.trim() || isRunning}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isRunning ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  Running…
                </>
              ) : (
                <>
                  <FlaskConical className="size-3.5 mr-1.5" />
                  {result ? "Run Again" : `Run on ${selectedAgent?.name ?? "agent"}`}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
