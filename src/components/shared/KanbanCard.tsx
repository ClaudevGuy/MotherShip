"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { GlassPanel } from "./GlassPanel";
import { StatusBadge } from "./StatusBadge";

export interface KanbanCardData {
  id: string;
  title: string;
  subtitle?: string;
  status?: string;
  metadata?: Record<string, string>;
}

interface KanbanCardProps {
  card: KanbanCardData;
  className?: string;
}

export function KanbanCard({ card, className }: KanbanCardProps) {
  return (
    <GlassPanel hover padding="sm" className={cn("cursor-default", className)}>
      <div className="space-y-2">
        <div>
          <h4 className="text-sm font-medium text-foreground leading-tight">
            {card.title}
          </h4>
          {card.subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
              {card.subtitle}
            </p>
          )}
        </div>

        {card.status && <StatusBadge status={card.status} size="sm" />}

        {card.metadata && Object.keys(card.metadata).length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 border-t border-border/50">
            {Object.entries(card.metadata).map(([key, value]) => (
              <div key={key} className="text-[10px]">
                <span className="text-muted-foreground">{key}: </span>
                <span className="text-foreground font-mono">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
