"use client";

import { useActiveCampaign } from "@/hooks/use-campaign";
import { GiftTable } from "@/components/gift-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function GiftsPage() {
  const campaignId = useActiveCampaign();

  if (campaignId === undefined) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!campaignId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No campaigns found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gifts</h1>
          <p className="text-sm text-muted-foreground">Record and track all received gifts</p>
        </div>
        <Link href="/gifts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Record Gift
          </Button>
        </Link>
      </div>
      <GiftTable campaignId={campaignId} />
    </div>
  );
}
