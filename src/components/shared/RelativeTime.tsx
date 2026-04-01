"use client";

import { formatRelativeTime } from "@/lib/format";

export function RelativeTime({ date, className }: { date: string | Date; className?: string }) {
  return (
    <span className={className} suppressHydrationWarning>
      {formatRelativeTime(date)}
    </span>
  );
}
