"use client";

import React from "react";
import Link from "next/link";
import { GlassPanel, StatusBadge } from "@/components/shared";
import { useAgentsStore } from "@/stores/agents-store";
import { formatRelativeTime, formatTokens } from "@/lib/format";
import { Progress } from "@/components/ui/progress";
import { Bot, Play, TestTube, ArrowRight } from "lucide-react";

export function AgentStatusGrid() {
  const agents = useAgentsStore((s) => s.agents);

  // Empty state — mirrors the grid's visual footprint (3 cards) with onboarding steps
  if (agents.length === 0) {
    const steps = [
      { num: 1, label: "Create an Agent", desc: "Name it, paste a prompt, go", icon: Bot, href: "/agents", cta: "Start here" },
      { num: 2, label: "Run it", desc: "Real-time streaming with cost tracking", icon: Play, href: "/agents" },
      { num: 3, label: "Evaluate it", desc: "Automated test suites with AI judge", icon: TestTube, href: "/evals" },
    ];

    return (
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Agents</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {steps.map((s) => (
            <Link key={s.num} href={s.href} className="block">
              <GlassPanel hover padding="md" className="h-full cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-[#f5f1e8]/10 border border-[#f5f1e8]/20">
                    <s.icon className="size-4 text-[#f5f1e8]" />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground/40">Step {s.num}</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{s.label}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5 mb-3">{s.desc}</p>
                {s.cta && (
                  <div className="flex items-center gap-1 text-[10px] text-[#f5f1e8]">
                    {s.cta} <ArrowRight className="size-3" />
                  </div>
                )}
              </GlassPanel>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Agents</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {agents.map((agent) => (
          <Link key={agent.id} href={`/agents/${agent.id}`}>
            <GlassPanel
              hover
              padding="md"
              glow={agent.status === "running" ? "green" : agent.status === "error" ? "crimson" : undefined}
              className="h-full cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium text-foreground truncate pr-2">{agent.name}</h4>
                <StatusBadge status={agent.status} size="sm" />
              </div>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-1">{agent.model}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Tokens</span>
                  <span className="font-mono text-foreground">{formatTokens(agent.tokenUsage)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Health</span>
                  <span className="font-mono text-foreground">{agent.healthScore}%</span>
                </div>
                <Progress value={agent.healthScore} className="h-1" />
                <div className="text-[10px] text-muted-foreground" suppressHydrationWarning>
                  Last run {formatRelativeTime(agent.lastRun)}
                </div>
              </div>
            </GlassPanel>
          </Link>
        ))}
      </div>
    </div>
  );
}
