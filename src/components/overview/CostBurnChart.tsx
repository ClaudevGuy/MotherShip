"use client";

import React, { useEffect, useState } from "react";
import { ChartCard, AreaChartWidget } from "@/components/shared";
import { formatCurrency } from "@/lib/format";
import { BarChart3, TrendingDown, TrendingUp, Minus, Loader2 } from "lucide-react";

type Range = "7d" | "14d" | "30d" | "90d";

const RANGE_DAYS: Record<Range, number> = { "7d": 7, "14d": 14, "30d": 30, "90d": 90 };

interface DailyPoint {
  date: string;
  value: number;
}

/**
 * Self-fetches daily cost data scoped to the selected range. Bypasses the
 * costs store cache so the chart is always live — important because cost
 * data drifts into "today" on charts if the series is sparse or stale.
 *
 * The API returns a dense series (one entry per calendar day in the window,
 * zeros for days with no activity), so labels like "Thu/Fri" can't
 * masquerade as adjacent when they're actually weeks apart.
 */
export function CostBurnChart() {
  const [range, setRange] = useState<Range>("7d");
  const [window, setWindow] = useState<DailyPoint[]>([]);
  const [prior, setPrior] = useState<DailyPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const days = RANGE_DAYS[range];
        // Fetch 2× the window so we can compute the prior-period delta from
        // the same response rather than a second request.
        const res = await fetch(`/api/costs/daily?days=${days * 2}`);
        if (!res.ok) return;
        const data = await res.json();
        const all: DailyPoint[] = data.data?.costs ?? [];
        if (cancelled) return;
        setWindow(all.slice(-days));
        setPrior(all.slice(-days * 2, -days));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    // Auto-refresh every 30s so the chart tracks production spend live
    const id = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [range]);

  // Label format — always include a real date identifier so stale points
  // can't pose as adjacent (the old "Thu/Fri" bug). For 7d/14d use weekday
  // + day-of-month; longer windows use month-day to stay readable.
  const labelFormat: Intl.DateTimeFormatOptions =
    RANGE_DAYS[range] <= 14
      ? { weekday: "short", day: "numeric" }
      : { month: "short", day: "numeric" };

  const series = window.map((d) => ({
    name: new Date(d.date).toLocaleDateString("en-US", labelFormat),
    value: d.value,
  }));

  const total = window.reduce((sum, d) => sum + d.value, 0);
  const priorTotal = prior.reduce((sum, d) => sum + d.value, 0);
  const deltaPct = priorTotal > 0 ? ((total - priorTotal) / priorTotal) * 100 : null;

  const hasData = series.length > 0 && series.some((d) => d.value > 0);

  const TrendIcon = deltaPct === null ? Minus : deltaPct > 0 ? TrendingUp : TrendingDown;
  const trendColor =
    deltaPct === null
      ? "text-muted-foreground"
      : deltaPct > 0
        ? "text-amber-400"
        : "text-emerald-400";

  return (
    <ChartCard
      title="Cost Burn"
      subtitle={hasData ? formatCurrency(total) : undefined}
      timeRange={range}
      onTimeRangeChange={(r) => setRange(r as Range)}
    >
      {loading && !hasData ? (
        <div className="flex items-center justify-center h-[180px]">
          <Loader2 className="size-4 text-muted-foreground/40 animate-spin" />
        </div>
      ) : hasData ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            {deltaPct !== null ? (
              <div className={`flex items-center gap-1.5 text-xs font-mono ${trendColor}`}>
                <TrendIcon className="size-3.5" />
                <span>
                  {deltaPct > 0 ? "+" : ""}
                  {deltaPct.toFixed(1)}% vs prior {range}
                </span>
              </div>
            ) : <span />}
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 rounded-full bg-emerald-500/60 animate-ping" />
                <span className="relative size-1.5 rounded-full bg-emerald-500" />
              </span>
              Live · 30s
            </div>
          </div>
          <AreaChartWidget
            data={series}
            color="#F59E0B"
            height={180}
            formatValue={formatCurrency}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[180px] text-center">
          <BarChart3 className="size-8 text-muted-foreground/20 mb-2" />
          <p className="text-xs text-muted-foreground/60">
            No activity in the last {RANGE_DAYS[range]} days
          </p>
          <p className="text-[10px] text-muted-foreground/40 mt-0.5">
            Costs will appear as agents run
          </p>
        </div>
      )}
    </ChartCard>
  );
}
