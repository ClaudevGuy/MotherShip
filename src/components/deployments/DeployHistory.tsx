"use client";

import React, { useState } from "react";
import { useDeploymentsStore } from "@/stores/deployments-store";
import { DataTable, StatusBadge, ConfirmDialog, GlassPanel } from "@/components/shared";
import { formatRelativeTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Bot, User, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { Deployment } from "@/types/deployments";
import type { Environment, DeployStatus } from "@/types/common";

export function DeployHistory() {
  const {
    getFilteredDeployments,
    environmentFilter,
    statusFilter,
    setEnvironmentFilter,
    setStatusFilter,
  } = useDeploymentsStore();

  const [rollbackTarget, setRollbackTarget] = useState<Deployment | null>(null);

  const deployments = getFilteredDeployments();

  const columns = [
    {
      key: "timestamp",
      label: "Timestamp",
      sortable: true,
      render: (d: Deployment) => (
        <span className="text-xs font-mono text-muted-foreground">
          {formatRelativeTime(d.timestamp)}
        </span>
      ),
    },
    {
      key: "service",
      label: "Service",
      sortable: true,
      render: (d: Deployment) => (
        <span className="text-sm font-medium text-foreground">{d.service}</span>
      ),
    },
    {
      key: "version",
      label: "Version",
      render: (d: Deployment) => (
        <span className="font-mono text-xs text-cyan-400">{d.version}</span>
      ),
    },
    {
      key: "environment",
      label: "Environment",
      sortable: true,
      render: (d: Deployment) => (
        <span className="text-xs capitalize text-muted-foreground">{d.environment}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (d: Deployment) => <StatusBadge status={d.status} size="sm" />,
    },
    {
      key: "duration",
      label: "Duration",
      sortable: true,
      render: (d: Deployment) => (
        <span className="font-mono text-xs text-muted-foreground">
          {d.duration > 0 ? `${d.duration}s` : "--"}
        </span>
      ),
    },
    {
      key: "triggeredBy",
      label: "Triggered By",
      render: (d: Deployment) => (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {d.isAgent ? <Bot className="size-3 text-cyan-400" /> : <User className="size-3" />}
          {d.triggeredBy}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (d: Deployment) =>
        d.status === "success" ? (
          <Button
            variant="ghost"
            size="xs"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setRollbackTarget(d);
            }}
          >
            <RotateCcw className="size-3 mr-1" />
            Rollback
          </Button>
        ) : null,
    },
  ];

  const environments: (Environment | "all")[] = ["all", "development", "staging", "production"];
  const statuses: (DeployStatus | "all")[] = ["all", "success", "failed", "in_progress", "pending", "rolled_back"];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Environment:</span>
          <div className="flex items-center gap-0.5 rounded-lg bg-muted/50 p-0.5">
            {environments.map((env) => (
              <button
                key={env}
                onClick={() => setEnvironmentFilter(env)}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  environmentFilter === env
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {env === "all" ? "All" : env.charAt(0).toUpperCase() + env.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Status:</span>
          <div className="flex items-center gap-0.5 rounded-lg bg-muted/50 p-0.5">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === "all" ? "All" : s.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <GlassPanel padding="none">
        <DataTable
          columns={columns}
          data={deployments}
          pageSize={8}
          emptyMessage="No deployments match the current filters."
        />
      </GlassPanel>

      <ConfirmDialog
        open={!!rollbackTarget}
        onOpenChange={(open) => !open && setRollbackTarget(null)}
        title="Confirm Rollback"
        description={
          rollbackTarget
            ? `Are you sure you want to rollback ${rollbackTarget.service} from ${rollbackTarget.version} in ${rollbackTarget.environment}? This will redeploy the previous stable version.`
            : ""
        }
        confirmLabel="Rollback"
        variant="danger"
        onConfirm={() => {
          if (rollbackTarget) {
            toast.success(`Rollback initiated for ${rollbackTarget.service}`);
            setRollbackTarget(null);
          }
        }}
      />
    </div>
  );
}
