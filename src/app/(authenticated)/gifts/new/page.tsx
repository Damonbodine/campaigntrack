"use client";

import { useActiveCampaign } from "@/hooks/use-campaign";
import { GiftEntryForm } from "@/components/gift-entry-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export default function NewGiftPage() {
  const campaignId = useActiveCampaign();
  const router = useRouter();

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
    <GiftEntryForm
      open={true}
      onOpenChange={(open) => { if (!open) router.push("/gifts"); }}
      campaignId={campaignId}
    />
  );
}
