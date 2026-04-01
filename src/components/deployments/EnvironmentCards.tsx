"use client";

import React from "react";
import { useDeploymentsStore } from "@/stores/deployments-store";
import { GlassPanel, StatusBadge } from "@/components/shared";
import { formatRelativeTime } from "@/lib/format";
import type { HealthStatus } from "@/types/common";

const healthGlow: Record<HealthStatus, "green" | "amber" | "crimson"> = {
  healthy: "green",
  degraded: "amber",
  down: "crimson",
};

const envLabels: Record<string, string> = {
  production: "Production",
  staging: "Staging",
  development: "Development",
};

export function EnvironmentCards() {
  const environments = useDeploymentsStore((s) => s.environments);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {environments.map((env) => (
        <GlassPanel key={env.name} glow={healthGlow[env.status]} padding="lg">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                {envLabels[env.name] ?? env.name}
              </h3>
              <StatusBadge status={env.status} size="sm" />
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Uptime</p>
                <p className="text-lg font-mono font-semibold text-foreground">{env.uptime}%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Active Users</p>
                <p className="text-lg font-mono font-semibold text-foreground">{env.activeUsers.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Last Deploy</p>
                <p className="text-xs font-mono text-muted-foreground">{formatRelativeTime(env.lastDeploy)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Version</p>
                <p className="text-xs font-mono text-cyan-400">{env.currentVersion}</p>
              </div>
            </div>

            {/* Health Checks */}
            <div className="border-t border-border pt-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Health Checks</p>
              <div className="space-y-1.5">
                {env.healthChecks.map((check) => (
                  <div key={check.name} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{check.name}</span>
                    <span
                      className={`size-2 rounded-full ${
                        check.status === "healthy"
                          ? "bg-green-500"
                          : check.status === "degraded"
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassPanel>
      ))}
    </div>
  );
}
