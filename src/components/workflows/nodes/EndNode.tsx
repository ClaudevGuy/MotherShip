"use client";

import React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function EndNode({ selected }: NodeProps) {
  // Theme-aware success/terminal color — neon on dark, emerald on paper.
  // See --color-end-rgb in globals.css.
  return (
    <div
      className={cn(
        "relative flex items-center gap-2 rounded-xl border px-4 py-3 transition-all",
        selected
          ? "border-[rgb(var(--color-end-rgb)/0.5)] bg-[rgb(var(--color-end-rgb)/0.06)] shadow-[0_0_16px_rgb(var(--color-end-rgb)/0.15)]"
          : "border-[rgb(var(--color-end-rgb)/0.25)] bg-[rgb(var(--color-end-rgb)/0.04)] hover:border-[rgb(var(--color-end-rgb)/0.4)]"
      )}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!size-3 !rounded-full !border-2 !border-[rgb(var(--color-end-rgb)/0.45)] !bg-[rgb(var(--color-end-rgb)/0.25)] hover:!bg-[rgb(var(--color-end-rgb)/1)] hover:!border-[rgb(var(--color-end-rgb)/1)] transition-colors"
      />

      <CircleCheck
        className="size-4"
        strokeWidth={2}
        style={{ color: "rgb(var(--color-end-rgb) / 0.85)" }}
      />
      <span
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: "rgb(var(--color-end-rgb) / 0.95)" }}
      >
        End
      </span>
    </div>
  );
}
