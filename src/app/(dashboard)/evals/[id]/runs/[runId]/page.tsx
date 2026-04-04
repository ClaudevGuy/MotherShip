"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronRight, Clock, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-client";
import { formatRelativeTime } from "@/lib/format";

function scoreColor(s: number | null | undefined) {
  if (s == null) return "text-muted-foreground/30";
  if (s >= 80) return "text-green-400";
  if (s >= 60) return "text-amber-400";
  return "text-red-400";
}

interface CriterionResult { criterion: string; passed: boolean; method: string }
interface CaseResult {
  caseId: string; input: string; output: string;
  criteriaResults: CriterionResult[];
  passed: boolean; tokensIn: number; tokensOut: number; cost: number; duration: number;
}
interface Run {
  id: string; suiteId: string; status: string; score: number | null;
  results: CaseResult[] | { error: string; caseResults: CaseResult[] };
  model: string | null; totalCost: number | null; duration: number | null;
  startedAt: string; completedAt: string | null;
  suite: { name: string; agentId: string };
}

export default function EvalRunResultsPage() {
  const params = useParams();
  const suiteId = params.id as string;
  const runId = params.runId as string;
  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    apiFetch(`/api/evals/runs/${runId}`).then(r => r.json()).then(({ data }) => {
      setRun(data.run);
      // Auto-expand failed cases
      const results = Array.isArray(data.run?.results) ? data.run.results : [];
      const failedIdxs = new Set<number>();
      results.forEach((r: CaseResult, i: number) => { if (!r.passed) failedIdxs.add(i); });
      setExpanded(failedIdxs);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [runId]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="size-5 animate-spin text-muted-foreground/30" /></div>;
  if (!run) return <div className="py-20 text-center text-muted-foreground">Run not found</div>;

  const results: CaseResult[] = Array.isArray(run.results) ? run.results : (run.results as { caseResults?: CaseResult[] })?.caseResults || [];
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;

  const toggleExpand = (i: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href={`/evals/${suiteId}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="size-3" /> Back to {run.suite.name}
        </Link>
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-foreground">Run Results</h1>
          <span className={cn("text-2xl font-bold font-mono", scoreColor(run.score))}>{run.score != null ? `${run.score}%` : "—"}</span>
          <span className={cn("text-[10px] rounded-full px-2 py-0.5 font-medium", run.status === "completed" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400")}>{run.status}</span>
        </div>
        <div className="flex items-center gap-4 mt-1 text-[10px] text-muted-foreground/40">
          <span suppressHydrationWarning>{formatRelativeTime(run.startedAt)}</span>
          {run.duration && <span className="flex items-center gap-1"><Clock className="size-2.5" />{run.duration}ms</span>}
          {run.totalCost != null && <span className="flex items-center gap-1"><DollarSign className="size-2.5" />${run.totalCost.toFixed(4)}</span>}
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-4 rounded-xl border border-border p-3">
        <span className="text-xs font-medium text-green-400">{passedCount} passed</span>
        <span className="text-xs font-medium text-red-400">{failedCount} failed</span>
        <span className="text-xs text-muted-foreground/50">{results.length} total</span>
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden flex">
          <div className="bg-green-500 h-full" style={{ width: `${results.length > 0 ? (passedCount / results.length) * 100 : 0}%` }} />
          <div className="bg-red-500 h-full" style={{ width: `${results.length > 0 ? (failedCount / results.length) * 100 : 0}%` }} />
        </div>
        {run.totalCost != null && <span className="text-xs font-mono text-muted-foreground/40">${run.totalCost.toFixed(4)}</span>}
      </div>

      {/* Case-by-case breakdown */}
      <div className="space-y-2">
        {results.map((r, i) => {
          const isExpanded = expanded.has(i);
          const passedCriteria = r.criteriaResults.filter(c => c.passed).length;
          return (
            <div key={i} className={cn("rounded-xl border overflow-hidden", !r.passed ? "border-red-500/20" : "border-border/50")}>
              {/* Collapsed row */}
              <button
                onClick={() => toggleExpand(i)}
                className={cn("w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/10 transition-colors", !r.passed && "border-l-2 border-l-red-500")}
              >
                {isExpanded ? <ChevronDown className="size-3 text-muted-foreground/30 shrink-0" /> : <ChevronRight className="size-3 text-muted-foreground/30 shrink-0" />}
                <span className="text-[10px] font-mono text-muted-foreground/20 w-6">#{i + 1}</span>
                {r.passed ? <CheckCircle2 className="size-4 text-green-400 shrink-0" /> : <XCircle className="size-4 text-red-400 shrink-0" />}
                <span className="text-xs text-foreground flex-1 truncate">{r.input.substring(0, 80)}{r.input.length > 80 ? "..." : ""}</span>
                <span className="text-[10px] text-muted-foreground/40 shrink-0">{passedCriteria}/{r.criteriaResults.length} criteria</span>
                <span className="text-[10px] font-mono text-muted-foreground/30 shrink-0">${r.cost.toFixed(4)}</span>
                <span className="text-[10px] font-mono text-muted-foreground/30 shrink-0">{r.duration}ms</span>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-border/30 p-4 space-y-4">
                  {/* Input */}
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider mb-1">Input</p>
                    <pre className="rounded-lg bg-[#050507] border border-[#3d3a39]/30 p-3 text-[11px] font-mono text-[#f2f2f2] whitespace-pre-wrap max-h-[150px] overflow-auto">{r.input}</pre>
                  </div>
                  {/* Output */}
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider mb-1">Agent Output</p>
                    <pre className="rounded-lg bg-[#050507] border border-[#3d3a39]/30 p-3 text-[11px] font-mono text-[#f2f2f2] whitespace-pre-wrap max-h-[200px] overflow-auto">{r.output}</pre>
                  </div>
                  {/* Criteria table */}
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider mb-1">Criteria Results</p>
                    <div className="rounded-lg border border-border/30 overflow-hidden">
                      <table className="w-full text-xs">
                        <thead><tr className="border-b border-border/20 bg-muted/10">
                          <th className="text-left px-3 py-1.5 text-muted-foreground/50 font-medium">Criterion</th>
                          <th className="text-left px-3 py-1.5 text-muted-foreground/50 font-medium w-20">Result</th>
                          <th className="text-left px-3 py-1.5 text-muted-foreground/50 font-medium w-24">Method</th>
                        </tr></thead>
                        <tbody>
                          {r.criteriaResults.map((cr, j) => (
                            <tr key={j} className="border-b border-border/10 last:border-0">
                              <td className="px-3 py-1.5 text-foreground">{cr.criterion}</td>
                              <td className="px-3 py-1.5">
                                {cr.passed
                                  ? <span className="text-green-400 font-medium">✓ PASS</span>
                                  : <span className="text-red-400 font-medium">✗ FAIL</span>}
                              </td>
                              <td className="px-3 py-1.5 text-muted-foreground/40">{cr.method}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* Token info */}
                  <div className="flex gap-4 text-[10px] text-muted-foreground/30">
                    <span>{r.tokensIn} tokens in</span>
                    <span>{r.tokensOut} tokens out</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
