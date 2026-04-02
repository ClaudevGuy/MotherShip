"use client";

import React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Clock, Webhook, Hand, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const TRIGGER_ICONS: Record<string, typeof Clock> = {
  schedule: Clock,
  webhook: Webhook,
  manual: Hand,
  event: Zap,
};

export function TriggerNode({ data, selected }: NodeProps) {
  const triggerType = (data?.type as string) || "manual";
  const Icon = TRIGGER_ICONS[triggerType] || Hand;

  return (
    <div
      className={cn(
        "relative flex items-center gap-3 rounded-xl border px-4 py-3 min-w-[160px] transition-all",
        selected
          ? "border-[#A855F7]/60 bg-[#A855F7]/[0.08] shadow-[0_0_16px_rgba(168,85,247,0.2)]"
          : "border-[#A855F7]/25 bg-[#A855F7]/[0.04] hover:border-[#A855F7]/40"
      )}
    >
      {/* Trigger icon */}
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#A855F7]/15">
        <Icon className="size-4 text-[#A855F7]" strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A855F7]">Trigger</p>
        <p className="text-xs text-foreground/70 capitalize">{triggerType}</p>
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!size-3 !rounded-full !border-2 !border-[#A855F7]/50 !bg-[#A855F7]/30 hover:!bg-[#A855F7] hover:!border-[#A855F7] transition-colors"
      />
    </div>
  );
}
