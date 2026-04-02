"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatNumber } from "@/lib/format";

interface AreaChartWidgetProps {
  data: { name: string; value: number }[];
  color?: string;
  height?: number;
  formatValue?: (value: number) => string;
}

function ChartTooltip({
  active,
  payload,
  label,
  formatValue,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  formatValue: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card/95 backdrop-blur-xl px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-mono font-medium text-foreground">
        {formatValue(payload[0].value)}
      </p>
    </div>
  );
}

export function AreaChartWidget({
  data,
  color = "#00d992",
  height = 200,
  formatValue = formatNumber,
}: AreaChartWidgetProps) {
  const gradientId = `area-gradient-${color.replace("#", "")}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.04)"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatValue(v)}
        />
        <Tooltip
          content={<ChartTooltip formatValue={formatValue} />}
          cursor={{ stroke: "rgba(255,255,255,0.1)" }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, fill: color, stroke: "#0E0E13", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
