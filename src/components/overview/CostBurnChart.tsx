"use client";

import React from "react";
import { ChartCard, AreaChartWidget } from "@/components/shared";
import { useCostsStore } from "@/stores/costs-store";
import { formatCurrency } from "@/lib/format";

export function CostBurnChart() {
  const dailyCosts = useCostsStore((s) => s.dailyCosts);
  const last7 = dailyCosts.slice(-7).map((d) => ({
    name: new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
    value: d.value,
  }));

  return (
    <ChartCard title="Cost Burn (7 days)" onTimeRangeChange={() => {}}>
      <AreaChartWidget data={last7} color="#F59E0B" height={180} formatValue={formatCurrency} />
    </ChartCard>
  );
}
