"use client";

import React from "react";
import { useDeploymentsStore } from "@/stores/deployments-store";
import { GlassPanel } from "@/components/shared";
import { Switch } from "@/components/ui/switch";
import type { Environment } from "@/types/common";

const ENVS: { key: Environment; label: string }[] = [
  { key: "development", label: "Dev" },
  { key: "staging", label: "Staging" },
  { key: "production", label: "Prod" },
];

export function FeatureFlags() {
  const featureFlags = useDeploymentsStore((s) => s.featureFlags);
  const toggleFeatureFlag = useDeploymentsStore((s) => s.toggleFeatureFlag);

  return (
    <GlassPanel padding="none">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Feature Flags</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Toggle feature availability across environments
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Flag</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Description</th>
              {ENVS.map((env) => (
                <th key={env.key} className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">
                  {env.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {featureFlags.map((flag) => (
              <tr key={flag.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <span className="text-sm font-mono font-medium text-foreground">{flag.name}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-muted-foreground">{flag.description}</span>
                </td>
                {ENVS.map((env) => (
                  <td key={env.key} className="px-4 py-3 text-center">
                    <Switch
                      size="sm"
                      checked={flag.environments[env.key]}
                      onCheckedChange={() => toggleFeatureFlag(flag.id, env.key)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassPanel>
  );
}
