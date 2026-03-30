"use client";

import { useState } from "react";
import { useActiveCampaign } from "@/hooks/use-campaign";
import { CampaignForm } from "@/components/campaign-form";
import { PhaseForm } from "@/components/phase-form";
import { MilestoneForm } from "@/components/milestone-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus, Settings } from "lucide-react";

export default function SettingsPage() {
  const campaignId = useActiveCampaign();
  const campaigns = useQuery(api.campaigns.list);
  const phases = useQuery(
    api.campaignPhases.listByCampaign,
    campaignId ? { campaignId } : "skip"
  );
  const milestones = useQuery(
    api.milestones.listByCampaign,
    campaignId ? { campaignId } : "skip"
  );

  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [showPhaseForm, setShowPhaseForm] = useState(false);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);

  if (campaignId === undefined) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure campaigns, phases, and milestones</p>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="phases">Phases</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowCampaignForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </div>
          {campaigns === undefined ? (
            <Skeleton className="h-32 w-full" />
          ) : campaigns.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No campaigns yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {campaigns.map((campaign) => (
                <Card key={campaign._id} className="bg-card border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground">{campaign.status}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="phases" className="mt-4 space-y-4">
          {campaignId && (
            <div className="flex justify-end">
              <Button onClick={() => setShowPhaseForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Phase
              </Button>
            </div>
          )}
          {phases === undefined ? (
            <Skeleton className="h-32 w-full" />
          ) : !phases || phases.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No phases configured.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {phases.map((phase) => (
                <Card key={phase._id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <p className="font-medium text-foreground">{phase.name}</p>
                    <p className="text-sm text-muted-foreground">{phase.status}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="milestones" className="mt-4 space-y-4">
          {campaignId && (
            <div className="flex justify-end">
              <Button onClick={() => setShowMilestoneForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Milestone
              </Button>
            </div>
          )}
          {milestones === undefined ? (
            <Skeleton className="h-32 w-full" />
          ) : !milestones || milestones.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No milestones configured.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {milestones.map((milestone) => (
                <Card key={milestone._id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <p className="font-medium text-foreground">{milestone.name}</p>
                    <p className="text-sm text-muted-foreground">{milestone.status}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CampaignForm open={showCampaignForm} onOpenChange={setShowCampaignForm} />
      {campaignId && (
        <>
          <PhaseForm open={showPhaseForm} onOpenChange={setShowPhaseForm} campaignId={campaignId} />
          <MilestoneForm open={showMilestoneForm} onOpenChange={setShowMilestoneForm} campaignId={campaignId} />
        </>
      )}
    </div>
  );
}
