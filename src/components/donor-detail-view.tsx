"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate, formatEnum } from "@/lib/utils";
import { PledgeTable } from "./pledge-table";
import { GiftTable } from "./gift-table";
import { ActivityTimeline } from "./activity-timeline";
import { useActiveCampaign } from "@/hooks/use-campaign";
import { Mail, Phone, MapPin, User, Building2 } from "lucide-react";

interface DonorDetailViewProps {
  donorId: Id<"donors">;
}

export function DonorDetailView({ donorId }: DonorDetailViewProps) {
  const donor = useQuery(api.donors.get, { donorId });
  const campaignId = useActiveCampaign();

  if (donor === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!donor) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground">Donor not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-foreground">
                  {donor.firstName} {donor.lastName}
                </h1>
                <Badge variant="outline">{formatEnum(donor.cultivationStage)}</Badge>
                <Badge
                  variant="outline"
                  className={
                    donor.status === "Active"
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {donor.status}
                </Badge>
              </div>
              {donor.organizationName && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm">{donor.organizationName}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Tier</span>
              <Badge variant="secondary" className="w-fit">{formatEnum(donor.donorTier)}</Badge>
            </div>
          </div>

          <Separator className="my-4 bg-border" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {donor.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${donor.email}`} className="hover:text-foreground transition-colors">
                  {donor.email}
                </a>
              </div>
            )}
            {donor.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{donor.phone}</span>
              </div>
            )}
            {(donor.city || donor.state) && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  {[donor.city, donor.state].filter(Boolean).join(", ")}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Capacity */}
      {donor.capacity && (
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Giving Capacity</p>
            <p className="mt-1 text-lg font-bold text-foreground">{formatEnum(donor.capacity)}</p>
          </CardContent>
        </Card>
      )}

      {/* Relationship Notes */}
      {donor.relationshipNotes && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Relationship Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{donor.relationshipNotes}</p>
          </CardContent>
        </Card>
      )}

      {/* Pledges */}
      {campaignId && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Pledges</h2>
          <PledgeTable campaignId={campaignId} donorId={donorId} />
        </div>
      )}

      {/* Gifts */}
      {campaignId && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Gifts</h2>
          <GiftTable campaignId={campaignId} donorId={donorId} />
        </div>
      )}

      {/* Activity Timeline */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Activity History</h2>
        <ActivityTimeline donorId={donorId} />
      </div>
    </div>
  );
}
