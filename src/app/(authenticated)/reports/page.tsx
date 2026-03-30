"use client";

import { useActiveCampaign } from "@/hooks/use-campaign";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GiftTable } from "@/components/gift-table";
import { PledgeTable } from "@/components/pledge-table";
import { PhaseProgressBar } from "@/components/phase-progress-bar";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsPage() {
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground">Campaign analytics and progress reports</p>
      </div>

      <PhaseProgressBar campaignId={campaignId} />

      <Tabs defaultValue="gifts" className="w-full">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="gifts">Gifts</TabsTrigger>
          <TabsTrigger value="pledges">Pledges</TabsTrigger>
        </TabsList>
        <TabsContent value="gifts" className="mt-4">
          <GiftTable campaignId={campaignId} />
        </TabsContent>
        <TabsContent value="pledges" className="mt-4">
          <PledgeTable campaignId={campaignId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
