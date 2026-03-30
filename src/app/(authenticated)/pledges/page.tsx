"use client";

import { useState } from "react";
import { useActiveCampaign } from "@/hooks/use-campaign";
import { PledgeTable } from "@/components/pledge-table";
import { PledgeForm } from "@/components/pledge-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";

export default function PledgesPage() {
  const campaignId = useActiveCampaign();
  const [showForm, setShowForm] = useState(false);

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
          <h1 className="text-2xl font-bold text-foreground">Pledges</h1>
          <p className="text-sm text-muted-foreground">Track multi-year pledge commitments</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Pledge
        </Button>
      </div>
      <PledgeTable campaignId={campaignId} />
      <PledgeForm open={showForm} onOpenChange={setShowForm} campaignId={campaignId} />
    </div>
  );
}
