import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassPanel } from "./GlassPanel";

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <GlassPanel padding="lg" className={className}>
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-3 w-16" />
      </div>
    </GlassPanel>
  );
}
