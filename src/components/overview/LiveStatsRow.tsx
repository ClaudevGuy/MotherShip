"use client";

import React, { useState } from "react";
import { useAgentsStore } from "@/stores/agents-store";
import { useDeploymentsStore } from "@/stores/deployments-store";
import { useIncidentsStore } from "@/stores/incidents-store";
import { useCostsStore } from "@/stores/costs-store";
import { Bot, AlertCircle, DollarSign, Activity, Zap, Coins, Rocket, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  pulse?: boolean;
}

function StatCard({ label, value, icon: Icon, color, pulse }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3 transition-colors hover:bg-card/80">
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-lg relative"
        style={{ background: `${color}15` }}
      >
        <div style={{ color }}>
          <Icon className="size-4" />
        </div>
        {pulse && (
          <span className="absolute -top-0.5 -right-0.5 flex size-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }} />
            <span className="relative inline-flex rounded-full size-2.5" style={{ backgroundColor: color }} />
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold font-mono text-foreground mt-0.5 leading-none">{value}</p>
      </div>
    </div>
  );
}

export function LiveStatsRow() {
  const [showMore, setShowMore] = useState(false);
  const agents = useAgentsStore((s) => s.agents);
  const deployments = useDeploymentsStore((s) => s.deployments);
  const incidents = useIncidentsStore((s) => s.incidents);
  const dailyCosts = useCostsStore((s) => s.dailyCosts);

  const activeAgents = agents.filter((a) => a.status === "running").length;
  const failingAgents = agents.filter((a) => a.status === "error").length;
  const prodDeploys = deployments.filter((d) => d.environment === "production" && d.status === "success").length;
  const openIncidents = incidents.filter((i) => i.status === "open" || i.status === "investigating").length;
  const todayCost = dailyCosts.length > 0 ? dailyCosts[dailyCosts.length - 1].value : 0;
  const totalTokens = agents.reduce((sum, a) => sum + (a.tokenUsage || 0), 0);
  const apiCalls = totalTokens > 0 ? Math.ceil(totalTokens / 2000) : 0;
  const totalRuns = agents.reduce((sum, a) => sum + (a.tasksCompleted || 0), 0);

  return (
    <div className="space-y-2">
      {/* Primary stats — the 4 that matter */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Active Agents" value={activeAgents} icon={Bot} color="#22C55E" pulse={activeAgents > 0} />
        <StatCard label="Failing Agents" value={failingAgents} icon={AlertCircle} color={failingAgents > 0 ? "#EF4444" : "#8b949e"} pulse={failingAgents > 0} />
        <StatCard label="Cost Today" value={todayCost > 0 ? `$${todayCost.toFixed(2)}` : "$0"} icon={DollarSign} color="#F59E0B" />
        <StatCard label="Runs Today" value={totalRuns} icon={Activity} color="#f5f1e8" />
      </div>

      {/* Collapsible secondary stats */}
      <button
        onClick={() => setShowMore(!showMore)}
        className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors px-1"
      >
        {showMore ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
        {showMore ? "Less" : "More stats"}
      </button>

      {showMore && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <StatCard label="API Calls 24h" value={apiCalls > 0 ? apiCalls.toLocaleString() : "0"} icon={Zap} color="#f5f1e8" />
          <StatCard label="Tokens 24h" value={totalTokens > 0 ? `${(totalTokens / 1000).toFixed(1)}k` : "0"} icon={Coins} color="#A855F7" />
          <StatCard label="Deploys Live" value={prodDeploys} icon={Rocket} color="#f5f1e8" />
          <StatCard label="Incidents Open" value={openIncidents} icon={AlertTriangle} color="#EF4444" />
        </div>
      )}
    </div>
  );
}
