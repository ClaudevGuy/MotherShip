"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { KanbanCard, type KanbanCardData } from "./KanbanCard";

export interface KanbanColumnData {
  id: string;
  title: string;
  items: KanbanCardData[];
}

interface KanbanColumnProps {
  column: KanbanColumnData;
  className?: string;
}

export function KanbanColumn({ column, className }: KanbanColumnProps) {
  return (
    <div
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl bg-muted/30 border border-border/50",
        className
      )}
    >
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50">
        <h3 className="text-sm font-medium text-foreground">{column.title}</h3>
        <Badge variant="secondary" className="h-5 text-[10px] px-1.5">
          {column.items.length}
        </Badge>
      </div>

      <div className="flex flex-col gap-2 p-2 overflow-y-auto max-h-[500px]">
        {column.items.map((item) => (
          <KanbanCard key={item.id} card={item} />
        ))}
        {column.items.length === 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">
            No items
          </p>
        )}
      </div>
    </div>
  );
}
