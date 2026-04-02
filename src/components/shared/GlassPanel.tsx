"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  glow?: "cyan" | "green" | "amber" | "crimson" | "purple";
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const glowMap: Record<NonNullable<GlassPanelProps["glow"]>, string> = {
  cyan: "glow-cyan",
  green: "glow-green",
  amber: "glow-amber",
  crimson: "glow-crimson",
  purple: "glow-purple",
};

const paddingMap: Record<NonNullable<GlassPanelProps["padding"]>, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export function GlassPanel({
  children,
  className,
  glow,
  hover = false,
  padding = "md",
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "rounded-lg backdrop-blur-xl transition-all duration-200",
        glow && glowMap[glow],
        hover && "hover:border-[var(--glass-hover-border)]",
        paddingMap[padding],
        className
      )}
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        boxShadow: glow ? undefined : "var(--card-shadow)",
      }}
    >
      {children}
    </div>
  );
}
