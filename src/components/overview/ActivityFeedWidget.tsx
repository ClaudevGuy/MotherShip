"use client";

import React from "react";
import { GlassPanel, ActivityFeed, LiveIndicator } from "@/components/shared";
import { useNotificationsStore } from "@/stores/notifications-store";
import { Rocket, AlertTriangle, Info } from "lucide-react";

const iconMap = {
  success: Rocket,
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
} as const;

const typeMap = {
  success: "deploy" as const,
  error: "error" as const,
  warning: "agent" as const,
  info: "info" as const,
};

export function ActivityFeedWidget() {
  const notifications = useNotificationsStore((s) => s.notifications);

  const items = notifications.map((n) => ({
    id: n.id,
    icon: iconMap[n.type] || Info,
    actor: n.title.split(":")[0] || "System",
    description: n.message,
    timestamp: n.timestamp,
    type: typeMap[n.type] || ("info" as const),
  }));

  return (
    <GlassPanel padding="lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading text-sm font-semibold text-foreground">Activity Feed</h3>
        <LiveIndicator />
      </div>
      <ActivityFeed items={items} maxItems={5} />
    </GlassPanel>
  );
}
