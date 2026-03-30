"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { StatCard } from "./stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatPercent } from "@/lib/utils";

interface DashboardStatsRowProps {
  campaignId: Id<"campaigns">;
}

export function DashboardStatsRow({ campaignId }: DashboardStatsRowProps) {
  const stats = useQuery(api.dashboard.getStats, { campaignId });

  if (stats === undefined) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Gifts This Month" value="—" subtitle="No data available" />
        <StatCard label="Fulfillment Rate" value="—" />
        <StatCard label="Active Pledges" value="—" />
        <StatCard label="Milestones" value="—" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Gifts This Month"
        value={formatCurrency(stats.giftsThisMonth ?? 0)}
        subtitle={`${stats.giftCountThisMonth ?? 0} gifts received`}
        trend={stats.giftsThisMonth > 0 ? "up" : undefined}
      />
      <StatCard
        label="Fulfillment Rate"
        value={formatPercent(stats.fulfillmentRate ?? 0)}
        subtitle="of pledged dollars received"
      />
      <StatCard
        label="Active Pledges"
        value={stats.activePledgeCount ?? 0}
        subtitle={formatCurrency(stats.activePledgeTotal ?? 0) + " total pledged"}
      />
      <StatCard
        label="Milestones"
        value={`${stats.milestonesAchieved ?? 0} / ${stats.milestonesTotal ?? 0}`}
        subtitle={`${stats.milestonesPending ?? 0} pending`}
      />
    </div>
  );
}
