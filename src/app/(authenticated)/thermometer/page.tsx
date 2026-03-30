"use client";

import { useActiveCampaign } from "@/hooks/use-campaign";
import { BoardThermometerView } from "@/components/board-thermometer-view";
import { Skeleton } from "@/components/ui/skeleton";

export default function ThermometerPage() {
  const campaignId = useActiveCampaign();

  if (campaignId === undefined) {
    return <Skeleton className="h-screen w-full" />;
  }

  if (!campaignId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No campaigns found.</p>
      </div>
    );
  }

  return <BoardThermometerView campaignId={campaignId} />;
}
