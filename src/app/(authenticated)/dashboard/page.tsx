"use client";

import { useActiveCampaign } from "@/hooks/use-campaign";
import { DashboardStatsRow } from "@/components/dashboard-stats-row";
import { CampaignThermometer } from "@/components/campaign-thermometer";
import { PhaseProgressBar } from "@/components/phase-progress-bar";
import { RecentGiftsTable } from "@/components/recent-gifts-table";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const campaignId = useActiveCampaign();
  const campaigns = useQuery(api.campaigns.list);

  if (campaignId === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!campaignId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No campaigns found. Create a campaign in Settings.</p>
      </div>
    );
  }

  const campaign = campaigns?.find((c) => c._id === campaignId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        {campaign && (
          <p className="text-sm text-muted-foreground">{campaign.name}</p>
        )}
      </div>
      <DashboardStatsRow campaignId={campaignId} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex justify-center">
          {campaign && (
            <CampaignThermometer
              goalAmount={campaign.goalAmount}
              currentAmount={campaign.thermometerAmount ?? 0}
            />
          )}
        </div>
        <div className="lg:col-span-2">
          <PhaseProgressBar campaignId={campaignId} />
        </div>
      </div>
      <RecentGiftsTable campaignId={campaignId} />
    </div>
  );
}
