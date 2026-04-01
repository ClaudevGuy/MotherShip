"use client";

import React, { useState } from "react";
import { ConfirmDialog } from "@/components/shared";
import { Rocket, FlaskConical, GitBranch, Power } from "lucide-react";
import { toast } from "sonner";

const actions = [
  { icon: Rocket, label: "Deploy Agent", color: "#00D4FF", glowClass: "glow-cyan" },
  { icon: FlaskConical, label: "Run Eval", color: "#A855F7", glowClass: "glow-purple" },
  { icon: GitBranch, label: "New Workflow", color: "#39FF14", glowClass: "glow-green" },
];

export function QuickActions() {
  const [killOpen, setKillOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.label}
              onClick={() => toast.success(`${a.label} initiated`)}
              className={`${a.glowClass} group flex flex-col items-center gap-2 rounded-xl border border-border bg-card/80 p-4 transition-all hover:border-border hover:scale-[1.02] active:scale-[0.98]`}
            >
              <Icon className="size-6" style={{ color: a.color }} />
              <span className="text-xs font-medium text-foreground">{a.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setKillOpen(true)}
          className="glow-crimson shadow-[0_0_12px_rgba(239,68,68,0.3)] group flex flex-col items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-4 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Power className="size-6 text-red-500" />
          <span className="text-xs font-medium text-red-400">Kill Switch</span>
        </button>
      </div>

      <ConfirmDialog
        open={killOpen}
        onOpenChange={setKillOpen}
        title="Emergency Kill Switch"
        description="This will immediately stop ALL running agents. This action cannot be undone. Are you sure?"
        confirmLabel="Stop All Agents"
        variant="danger"
        onConfirm={() => toast.error("All agents stopped")}
      />
    </>
  );
}
