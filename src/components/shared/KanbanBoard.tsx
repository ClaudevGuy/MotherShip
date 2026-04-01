"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { KanbanColumn, type KanbanColumnData } from "./KanbanColumn";

interface KanbanBoardProps {
  columns: KanbanColumnData[];
  className?: string;
}

export function KanbanBoard({ columns, className }: KanbanBoardProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <div className="flex gap-4 min-w-max pb-4">
        {columns.map((column) => (
          <KanbanColumn key={column.id} column={column} />
        ))}
      </div>
    </div>
  );
}
