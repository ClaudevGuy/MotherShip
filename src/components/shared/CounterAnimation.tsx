"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  formatNumber,
  formatCurrency,
  formatPercent,
  formatTokens,
} from "@/lib/format";

interface CounterAnimationProps {
  value: number;
  format?: "number" | "currency" | "percent" | "tokens";
  duration?: number;
  className?: string;
}

const formatters: Record<
  NonNullable<CounterAnimationProps["format"]>,
  (v: number) => string
> = {
  number: formatNumber,
  currency: formatCurrency,
  percent: formatPercent,
  tokens: formatTokens,
};

export function CounterAnimation({
  value,
  format = "number",
  className,
}: CounterAnimationProps) {
  const formatter = formatters[format];

  return (
    <span className={cn("font-mono tabular-nums transition-all", className)}>
      {formatter(value)}
    </span>
  );
}
