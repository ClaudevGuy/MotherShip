"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/format";

interface WaterfallItem {
  label: string;
  start: number;
  duration: number;
  color: string;
}

interface WaterfallChartProps {
  items: WaterfallItem[];
  className?: string;
}

export function WaterfallChart({ items, className }: WaterfallChartProps) {
  if (items.length === 0) return null;

  const maxEnd = Math.max(...items.map((i) => i.start + i.duration), 1);

  // Generate time scale ticks
  const tickCount = 5;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) =>
    Math.round((maxEnd / tickCount) * i)
  );

  return (
    <div className={cn("space-y-1", className)}>
      {/* Time scale header */}
      <div className="flex items-center ml-36 mb-2">
        {ticks.map((tick, i) => (
          <span
            key={i}
            className="text-[10px] font-mono text-muted-foreground"
            style={{
              position: "absolute",
              left: `calc(9rem + ${(tick / maxEnd) * 100}% * (100% - 9rem) / 100%)`,
            }}
          >
            {formatDuration(tick)}
          </span>
        ))}
        <div className="flex justify-between w-full text-[10px] font-mono text-muted-foreground">
          {ticks.map((tick) => (
            <span key={tick}>{formatDuration(tick)}</span>
          ))}
        </div>
      </div>

      {/* Bars */}
      {items.map((item, idx) => {
        const leftPct = (item.start / maxEnd) * 100;
        const widthPct = Math.max((item.duration / maxEnd) * 100, 0.5);

        return (
          <div key={idx} className="flex items-center gap-3 group">
            <span className="w-32 shrink-0 text-right text-xs text-muted-foreground truncate pr-1">
              {item.label}
            </span>
            <div className="relative flex-1 h-6">
              {/* Track */}
              <div className="absolute inset-0 rounded bg-muted/30" />
              {/* Bar */}
              <div
                className="absolute top-0.5 bottom-0.5 rounded transition-opacity group-hover:opacity-90"
                style={{
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                  backgroundColor: item.color,
                  minWidth: 2,
                }}
              />
              {/* Duration label */}
              <span
                className="absolute top-0.5 text-[10px] font-mono text-foreground/80 leading-5 pl-1 pointer-events-none"
                style={{
                  left: `${leftPct + widthPct}%`,
                }}
              >
                {formatDuration(item.duration)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
