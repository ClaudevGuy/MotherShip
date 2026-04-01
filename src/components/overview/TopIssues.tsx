"use client";

import React from "react";
import { GlassPanel, StatusBadge } from "@/components/shared";
import { useIncidentsStore } from "@/stores/incidents-store";
import { formatRelativeTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

const severityColors: Record<string, string> = {
  P1: "bg-red-500/20 text-red-400 border-red-500/30",
  P2: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  P3: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

export function TopIssues() {
  const incidents = useIncidentsStore((s) => s.incidents).filter((i) => i.status !== "resolved");

  return (
    <GlassPanel padding="lg">
      <h3 className="font-heading text-sm font-semibold text-foreground mb-3">Top Issues</h3>
      <div className="space-y-2">
        {incidents.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No open incidents</p>
        ) : (
          incidents.map((incident) => (
            <div key={incident.id} className="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-muted/30 transition-colors">
              <Badge variant="outline" className={severityColors[incident.severity]}>
                {incident.severity}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{incident.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <StatusBadge status={incident.status} size="sm" />
                  <span className="text-[10px] text-muted-foreground">{incident.assignee}</span>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{formatRelativeTime(incident.createdAt)}</span>
            </div>
          ))
        )}
      </div>
    </GlassPanel>
  );
}
