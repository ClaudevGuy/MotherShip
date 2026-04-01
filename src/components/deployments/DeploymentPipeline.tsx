"use client";

import React from "react";
import { useDeploymentsStore } from "@/stores/deployments-store";
import { KanbanBoard } from "@/components/shared";
import type { KanbanColumnData } from "@/components/shared/KanbanColumn";
import type { KanbanCardData } from "@/components/shared/KanbanCard";
import type { Deployment } from "@/types/deployments";
import { formatRelativeTime } from "@/lib/format";

const STAGES = [
  { id: "dev", title: "Development" },
  { id: "staging", title: "Staging" },
  { id: "review", title: "Review" },
  { id: "production", title: "Production" },
] as const;

function deploymentToCard(dep: Deployment): KanbanCardData {
  return {
    id: dep.id,
    title: dep.service,
    subtitle: `${dep.version} - ${dep.changelog.slice(0, 60)}`,
    status: dep.status,
    metadata: {
      version: dep.version,
      deployed: formatRelativeTime(dep.timestamp),
      by: `${dep.isAgent ? "\u{1F916}" : "\u{1F464}"} ${dep.triggeredBy}`,
    },
  };
}

export function DeploymentPipeline() {
  const deployments = useDeploymentsStore((s) => s.deployments);

  const columns: KanbanColumnData[] = STAGES.map((stage) => ({
    id: stage.id,
    title: stage.title,
    items: deployments
      .filter((d) => d.stage === stage.id)
      .map(deploymentToCard),
  }));

  return <KanbanBoard columns={columns} />;
}
