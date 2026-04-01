"use client";

import { PageHeader } from "@/components/shared";
import { SystemHealthBar } from "@/components/overview/SystemHealthBar";
import { LiveStatsRow } from "@/components/overview/LiveStatsRow";
import { QuickActions } from "@/components/overview/QuickActions";
import { AgentStatusGrid } from "@/components/overview/AgentStatusGrid";
import { CostBurnChart } from "@/components/overview/CostBurnChart";
import { TopIssues } from "@/components/overview/TopIssues";
import { RecentDeploys } from "@/components/overview/RecentDeploys";
import { ActivityFeedWidget } from "@/components/overview/ActivityFeedWidget";

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Mission Control" description="Real-time operational overview" />
      <SystemHealthBar />
      <LiveStatsRow />
      <QuickActions />
      <AgentStatusGrid />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <CostBurnChart />
        <TopIssues />
        <RecentDeploys />
      </div>
      <ActivityFeedWidget />
    </div>
  );
}
