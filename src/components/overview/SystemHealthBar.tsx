"use client";

import React from "react";
import { useIncidentsStore } from "@/stores/incidents-store";
import { ShieldCheck, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function SystemHealthBar() {
  const incidents = useIncidentsStore((s) => s.incidents);
  const openIncidents = incidents.filter((i) => i.status !== "resolved");
  const p1Open = openIncidents.filter((i) => i.severity === "P1");

  const level =
    p1Open.length > 0 ? "critical" : openIncidents.length > 0 ? "degraded" : "operational";

  const config = {
    operational: {
      bg: "bg-green-500/10 border-green-500/20",
      text: "text-green-400",
      icon: ShieldCheck,
      label: "ALL SYSTEMS OPERATIONAL",
    },
    degraded: {
      bg: "bg-amber-500/10 border-amber-500/20",
      text: "text-amber-400",
      icon: AlertTriangle,
      label: `${openIncidents.length} INCIDENT${openIncidents.length > 1 ? "S" : ""} UNDER INVESTIGATION`,
    },
    critical: {
      bg: "bg-red-500/10 border-red-500/20",
      text: "text-red-400",
      icon: XCircle,
      label: `${p1Open.length} CRITICAL INCIDENT${p1Open.length > 1 ? "S" : ""} ACTIVE`,
    },
  }[level];

  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5",
        config.bg,
        level === "operational" && "shadow-[0_0_12px_rgba(57,255,20,0.15)]"
      )}
    >
      <Icon className={cn("size-4", config.text)} />
      <span className={cn("font-heading text-xs font-semibold uppercase tracking-wider", config.text)}>
        {config.label}
      </span>
    </div>
  );
}
