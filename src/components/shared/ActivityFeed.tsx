"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import { type LucideIcon } from "lucide-react";

interface ActivityItem {
  id: string;
  icon: LucideIcon;
  actor: string;
  description: string;
  timestamp: string | Date;
  type: "deploy" | "error" | "agent" | "info";
}

interface ActivityFeedProps {
  items: ActivityItem[];
  maxItems?: number;
  className?: string;
}

const typeColors: Record<ActivityItem["type"], string> = {
  deploy: "text-cyan-400",
  error: "text-red-400",
  agent: "text-green-400",
  info: "text-muted-foreground",
};

const typeBg: Record<ActivityItem["type"], string> = {
  deploy: "bg-cyan-400/10",
  error: "bg-red-400/10",
  agent: "bg-green-400/10",
  info: "bg-muted/40",
};

export function ActivityFeed({
  items,
  maxItems = 10,
  className,
}: ActivityFeedProps) {
  const visible = items.slice(0, maxItems);

  return (
    <div className={cn("space-y-1", className)}>
      {visible.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/30 transition-colors"
          >
            <div
              className={cn(
                "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
                typeBg[item.type]
              )}
            >
              <Icon className={cn("size-3.5", typeColors[item.type])} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-medium">{item.actor}</span>{" "}
                <span className="text-muted-foreground">{item.description}</span>
              </p>
            </div>

            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {formatRelativeTime(item.timestamp)}
            </span>
          </div>
        );
      })}

      {items.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No recent activity
        </p>
      )}
    </div>
  );
}
