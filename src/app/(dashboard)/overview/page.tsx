"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader, GlassPanel } from "@/components/shared";
import { SystemHealthBar } from "@/components/overview/SystemHealthBar";
import { LiveStatsRow } from "@/components/overview/LiveStatsRow";
import { QuickActions } from "@/components/overview/QuickActions";
import { AgentStatusGrid } from "@/components/overview/AgentStatusGrid";
import { CostBurnChart } from "@/components/overview/CostBurnChart";
import { TopIssues } from "@/components/overview/TopIssues";
import { ExternalAgentsWidget } from "@/components/overview/ExternalAgents";
import { useAgentsStore } from "@/stores/agents-store";
import { useDeploymentsStore } from "@/stores/deployments-store";
import { useIncidentsStore } from "@/stores/incidents-store";
import { useCostsStore } from "@/stores/costs-store";
import { useNotificationsStore } from "@/stores/notifications-store";
import { TrendingDown, Plug, ArrowRight, Copy } from "lucide-react";
import { toast } from "sonner";
// ─────────────────────────────────────────────────────────────
// Using the Zustand hook directly (not via selector) so we can read agents count

function SavingsBanner() {
  const [savings, setSavings] = useState<{ actual: number; tier1: number; saved: number; percent: number } | null>(null);

  useEffect(() => {
    fetch("/api/costs/model-savings")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data && data.tier1Cost > 0) {
          const saved = data.tier1Cost - data.actualCost;
          setSavings({
            actual: data.actualCost,
            tier1: data.tier1Cost,
            saved: Math.max(0, saved),
            percent: Math.round((saved / data.tier1Cost) * 100),
          });
        }
      })
      .catch(() => {});
  }, []);

  if (!savings || savings.saved <= 0) return null;

  return (
    <div className="rounded-xl border border-[#00d992]/20 bg-[#00d992]/[0.04] p-4 flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#00d992]/10">
        <TrendingDown className="size-5 text-[#00d992]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#00d992]">
          Auto-selection saved you ${savings.saved.toFixed(2)} this month
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {savings.percent}% less than always using premium models &middot; Actual: ${savings.actual.toFixed(2)} vs ${savings.tier1.toFixed(2)} at Tier 1
        </p>
      </div>
      <Link href="/costs" className="text-[10px] text-[#00d992] hover:underline shrink-0">View details</Link>
    </div>
  );
}

function ConnectExternalAgentsCTA() {
  const snippet = `import { Mothership } from '@mothership/sdk'

const mc = new Mothership({
  url: '${typeof window !== "undefined" ? window.location.origin : "https://your-app.com"}',
  apiKey: 'mc_your_key',
  source: 'my-app',
})

await mc.trackRun({
  agent: { id: 'agent-1', name: 'MyAgent' },
  status: 'completed',
  cost: 0.05,
})`;

  return (
    <GlassPanel padding="md">
      <div className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20">
          <Plug className="size-5 text-purple-400" />
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Connect Your Existing Agents</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Track agents from CrewAI, LangGraph, Paperclip, or any custom framework in MOTHERSHIP
            </p>
          </div>
          <div className="relative">
            <pre className="rounded-lg bg-[#050507] border border-border p-3 text-[10px] font-mono text-[#8b949e] overflow-x-auto leading-relaxed">
              {snippet}
            </pre>
            <button
              onClick={() => { navigator.clipboard.writeText(snippet); toast.success("Copied to clipboard"); }}
              className="absolute top-2 right-2 p-1.5 rounded-md bg-[#050507] border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              <Copy className="size-3" />
            </button>
          </div>
          <Link href="/tutorial?section=external-agents" className="inline-flex items-center gap-1 text-[10px] text-purple-400 hover:underline">
            Full SDK documentation <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </GlassPanel>
  );
}

export default function OverviewPage() {
  const agents = useAgentsStore((s) => s.agents);
  const fetchAgents = useAgentsStore((s) => s.fetch);
  const fetchDeployments = useDeploymentsStore((s) => s.fetch);
  const fetchIncidents = useIncidentsStore((s) => s.fetch);
  const fetchCosts = useCostsStore((s) => s.fetch);
  const fetchNotifications = useNotificationsStore((s) => s.fetch);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchAgents();
    fetchDeployments();
    fetchIncidents();
    fetchCosts();
    fetchNotifications();
  }, []);

  const hasAgents = agents.length > 0;

  // Unified layout: QuickActions only appears once there are agents to act on.
  // Before that, the Step 1 card in AgentStatusGrid is the single clear CTA.
  return (
    <div className="space-y-6">
      <PageHeader title="MOTHERSHIP" description="Real-time operational overview" />
      <SystemHealthBar />
      <LiveStatsRow />
      <SavingsBanner />
      {hasAgents && <QuickActions />}
      <AgentStatusGrid />
      <ExternalAgentsWidget />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CostBurnChart />
        <TopIssues />
      </div>
      <ConnectExternalAgentsCTA />
    </div>
  );
}
