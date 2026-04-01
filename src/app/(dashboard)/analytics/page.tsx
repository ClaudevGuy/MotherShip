"use client";

import React, { useState, useMemo } from "react";
import {
  PageHeader,
  GlassPanel,
  MetricCard,
  AreaChartWidget,
  BarChartWidget,
  HeatmapGrid,
} from "@/components/shared";
import { Users, Clock, MousePointer, ArrowDownUp, Bot, CheckCircle2, Brain, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber, formatCurrency } from "@/lib/format";

/* ═══ DATA ═══ */

const generateDAU = (days: number) => {
  const data: { name: string; value: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    const isWeekend = dow === 0 || dow === 6;
    let base = isWeekend ? 1100 : 1400;
    if (i >= 17 && i <= 21) base += 400;
    base += Math.round((Math.sin(i * 2.7) * 40) + (Math.cos(i * 1.3) * 30));
    data.push({
      name: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: Math.max(800, base),
    });
  }
  return data;
};

const DAU_DATA = generateDAU(30);

const GEO_DATA = [
  { country: "United States", flag: "\u{1F1FA}\u{1F1F8}", users: 8420 },
  { country: "United Kingdom", flag: "\u{1F1EC}\u{1F1E7}", users: 2140 },
  { country: "Germany", flag: "\u{1F1E9}\u{1F1EA}", users: 1680 },
  { country: "Canada", flag: "\u{1F1E8}\u{1F1E6}", users: 1240 },
  { country: "France", flag: "\u{1F1EB}\u{1F1F7}", users: 890 },
  { country: "Australia", flag: "\u{1F1E6}\u{1F1FA}", users: 720 },
  { country: "India", flag: "\u{1F1EE}\u{1F1F3}", users: 580 },
  { country: "Netherlands", flag: "\u{1F1F3}\u{1F1F1}", users: 340 },
  { country: "Japan", flag: "\u{1F1EF}\u{1F1F5}", users: 290 },
  { country: "Brazil", flag: "\u{1F1E7}\u{1F1F7}", users: 210 },
];
const GEO_TOTAL = GEO_DATA.reduce((s, g) => s + g.users, 0);
const GEO_MAX = GEO_DATA[0].users;

const RETENTION = [
  [100, 72, 58, 49, 42, 38, 35],
  [100, 68, 54, 45, 39, 35, 0],
  [100, 74, 61, 52, 44, 0, 0],
  [100, 70, 56, 47, 0, 0, 0],
  [100, 76, 63, 0, 0, 0, 0],
  [100, 71, 0, 0, 0, 0, 0],
];

const FEATURES = [
  { name: "AI Agents", usage: 78 },
  { name: "Logs & Observability", usage: 61 },
  { name: "Deployments", usage: 54 },
  { name: "Analytics", usage: 41 },
  { name: "Codebase", usage: 38 },
  { name: "Costs & Billing", usage: 29 },
];

const SESSION_DIST = [
  { name: "0-2m", value: 340 },
  { name: "2-5m", value: 890 },
  { name: "5-15m", value: 1420 },
  { name: "15-30m", value: 780 },
  { name: "30m+", value: 320 },
];

const ACTIONS_PER_DAY = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  return { name: d.toLocaleDateString("en-US", { weekday: "short" }), value: Math.round(3 + Math.sin(i) * 2 + 2) };
});

const FUNNEL = [
  { stage: "Visitors", count: 48200, pct: 100 },
  { stage: "Signups", count: 8420, pct: 17.5 },
  { stage: "Activated", count: 5640, pct: 67.0 },
  { stage: "Retained", count: 3210, pct: 56.9 },
  { stage: "Paid", count: 890, pct: 27.7 },
];

const CHANNELS = [
  { channel: "Organic Search", users: 4820, conversion: 18.2, ltv: 340 },
  { channel: "Direct", users: 3140, conversion: 24.1, ltv: 420 },
  { channel: "Referral", users: 2340, conversion: 31.4, ltv: 510 },
  { channel: "Twitter/X", users: 1890, conversion: 12.8, ltv: 280 },
  { channel: "Product Hunt", users: 1240, conversion: 22.6, ltv: 390 },
];

/* ═══ PAGE ═══ */
export default function AnalyticsPage() {
  const [tab, setTab] = useState<"users" | "engagement" | "growth">("users");
  const [dauRange, setDauRange] = useState<"7D" | "30D" | "90D" | "1Y">("30D");

  const tabs = [
    { id: "users" as const, label: "Users" },
    { id: "engagement" as const, label: "Engagement" },
    { id: "growth" as const, label: "Growth" },
  ];

  const dauSliced = useMemo(() => {
    const days = dauRange === "7D" ? 7 : dauRange === "30D" ? 30 : dauRange === "90D" ? 90 : 365;
    return DAU_DATA.slice(-Math.min(days, DAU_DATA.length));
  }, [dauRange]);

  const cohortXLabels = ["W0", "W1", "W2", "W3", "W4", "W5", "W6"];
  const cohortYLabels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (i + 1) * 7);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="User metrics, engagement patterns, and growth intelligence" />

      <div className="border-b border-border">
        <div className="flex gap-6">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={cn("pb-2.5 text-sm font-medium transition-colors relative", tab === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground/70")}>
              {t.label}
              {tab === t.id && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00D4FF]" />}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ USERS ═══ */}
      {tab === "users" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <MetricCard label="DAU" value={1400} format="number" trend={8.2} icon={Users} color="#00D4FF" />
            <MetricCard label="WAU" value={5800} format="number" trend={4.1} icon={Users} color="#A855F7" />
            <MetricCard label="MAU" value={18000} format="number" trend={12.3} icon={Users} color="#39FF14" />
            <MetricCard label="Avg Session" value={14.5} format="number" icon={Clock} color="#F59E0B" />
            <MetricCard label="Pages/Session" value={4.7} format="number" icon={MousePointer} color="#EC4899" />
            <MetricCard label="Bounce Rate" value={23.4} format="percent" trend={-2.1} icon={ArrowDownUp} color="#00D4FF" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <GlassPanel padding="lg" className="lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-sm font-semibold text-foreground">Daily Active Users</h3>
                <div className="flex items-center gap-0.5 rounded-lg bg-muted/50 p-0.5">
                  {(["7D", "30D", "90D", "1Y"] as const).map((r) => (
                    <button key={r} onClick={() => setDauRange(r)} className={cn("rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors", dauRange === r ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <AreaChartWidget data={dauSliced} color="#00D4FF" height={220} formatValue={formatNumber} />
            </GlassPanel>

            <GlassPanel padding="lg" className="lg:col-span-2">
              <h3 className="font-heading text-sm font-semibold text-foreground mb-4">Users by Country</h3>
              <div className="space-y-2.5">
                {GEO_DATA.map((g, i) => {
                  const barWidth = (g.users / GEO_MAX) * 100;
                  const opacity = 1 - (i * 0.08);
                  return (
                    <div key={g.country}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground"><span className="mr-1.5">{g.flag}</span>{g.country}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-foreground">{g.users.toLocaleString()}</span>
                          <span className="font-mono text-[10px] text-muted-foreground w-10 text-right">{((g.users / GEO_TOTAL) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted/40">
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${barWidth}%`, background: `rgba(0,212,255,${opacity})` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassPanel>
          </div>

          <GlassPanel padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-sm font-semibold text-foreground">Retention Cohorts</h3>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm" style={{ background: "rgba(0,212,255,0.1)" }} /> 0%</span>
                <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm" style={{ background: "rgba(0,212,255,0.5)" }} /> 50%</span>
                <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm" style={{ background: "rgba(0,212,255,1)" }} /> 100%</span>
              </div>
            </div>
            <HeatmapGrid data={RETENTION} xLabels={cohortXLabels} yLabels={cohortYLabels} colorScale="cyan" />
          </GlassPanel>
        </div>
      )}

      {/* ═══ ENGAGEMENT ═══ */}
      {tab === "engagement" && (
        <div className="space-y-6">
          <GlassPanel padding="lg">
            <h3 className="font-heading text-sm font-semibold text-foreground mb-4">Feature Usage</h3>
            <div className="space-y-3">
              {FEATURES.map((f) => (
                <div key={f.name}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-foreground font-medium">{f.name}</span>
                    <span className="font-mono text-[#00D4FF]">{f.usage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted/50">
                    <div className="h-2 rounded-full bg-[#00D4FF] transition-all" style={{ width: `${f.usage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GlassPanel padding="lg">
              <h3 className="font-heading text-sm font-semibold text-foreground mb-4">Session Duration</h3>
              <BarChartWidget data={SESSION_DIST} color="#A855F7" height={200} formatValue={(v) => `${v}`} />
            </GlassPanel>
            <GlassPanel padding="lg">
              <h3 className="font-heading text-sm font-semibold text-foreground mb-4">Actions per Session (14d)</h3>
              <BarChartWidget data={ACTIONS_PER_DAY} color="#00D4FF" height={200} formatValue={(v) => `${v}`} />
            </GlassPanel>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="Avg Tasks/Session" value={3.2} format="number" icon={Bot} color="#00D4FF" />
            <MetricCard label="Agent Success Rate" value={94.7} format="percent" icon={CheckCircle2} color="#39FF14" />
            <MetricCard label="Avg Context Used" value={67} format="percent" icon={Brain} color="#A855F7" />
            <MetricCard label="Human-in-Loop" value={12} format="percent" trend={-3.2} icon={UserCheck} color="#F59E0B" />
          </div>
        </div>
      )}

      {/* ═══ GROWTH ═══ */}
      {tab === "growth" && (
        <div className="space-y-6">
          <GlassPanel padding="lg">
            <h3 className="font-heading text-sm font-semibold text-foreground mb-4">Conversion Funnel</h3>
            <div className="space-y-2">
              {FUNNEL.map((step, i) => {
                const widthPct = (step.count / FUNNEL[0].count) * 100;
                const convLabel = i === 0 ? "" : `${step.pct}%`;
                return (
                  <div key={step.stage} className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground w-20 shrink-0 text-right">{step.stage}</span>
                    <div className="flex-1">
                      <div
                        className="h-8 rounded-md flex items-center px-3"
                        style={{
                          width: `${Math.max(widthPct, 8)}%`,
                          background: `rgba(0,212,255,${0.08 + (1 - i / FUNNEL.length) * 0.15})`,
                          borderLeft: "3px solid rgba(0,212,255,0.5)",
                        }}
                      >
                        <span className="font-mono text-xs text-foreground">{step.count.toLocaleString()}</span>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground w-12 shrink-0 text-right">{convLabel}</span>
                  </div>
                );
              })}
            </div>
          </GlassPanel>

          <GlassPanel padding="lg">
            <h3 className="font-heading text-sm font-semibold text-foreground mb-4">Growth (6 months)</h3>
            <AreaChartWidget
              data={[
                { name: "Oct", value: 8200 },
                { name: "Nov", value: 9400 },
                { name: "Dec", value: 11200 },
                { name: "Jan", value: 13800 },
                { name: "Feb", value: 15900 },
                { name: "Mar", value: 18000 },
              ]}
              color="#00D4FF"
              height={220}
              formatValue={formatNumber}
            />
          </GlassPanel>

          <GlassPanel padding="none">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="font-heading text-sm font-semibold text-foreground">Top Acquisition Channels</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Channel", "Users", "Conversion %", "Avg LTV"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CHANNELS.map((ch) => (
                  <tr key={ch.channel} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-foreground">{ch.channel}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{ch.users.toLocaleString()}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted/50">
                          <div className="h-1.5 rounded-full bg-[#00D4FF]" style={{ width: `${ch.conversion}%` }} />
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">{ch.conversion}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs">{formatCurrency(ch.ltv)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
