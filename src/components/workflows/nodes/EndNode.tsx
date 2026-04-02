"use client";

import React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function EndNode({ selected }: NodeProps) {
  return (
    <div
      className={cn(
        "relative flex items-center gap-2 rounded-xl border px-4 py-3 transition-all",
        selected
          ? "border-[#39FF14]/50 bg-[#39FF14]/[0.06] shadow-[0_0_16px_rgba(57,255,20,0.15)]"
          : "border-[#39FF14]/20 bg-[#39FF14]/[0.03] hover:border-[#39FF14]/35"
      )}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!size-3 !rounded-full !border-2 !border-[#39FF14]/40 !bg-[#39FF14]/20 hover:!bg-[#39FF14] hover:!border-[#39FF14] transition-colors"
      />

      <CircleCheck className="size-4 text-[#39FF14]/70" strokeWidth={2} />
      <span className="text-xs font-semibold uppercase tracking-wider text-[#39FF14]/80">End</span>
    </div>
  );
}
