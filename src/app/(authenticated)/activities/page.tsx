"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useActiveCampaign } from "@/hooks/use-campaign";
import { CultivationActivityForm } from "@/components/cultivation-activity-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Phone, Users, Mail, Calendar, FileText, Heart, MailOpen, Eye, HelpCircle } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  PhoneCall: Phone,
  Meeting: Users,
  Tour: Eye,
  Email: Mail,
  Event: Calendar,
  Proposal: FileText,
  ThankYou: Heart,
  Letter: MailOpen,
  Other: HelpCircle,
};

const OUTCOME_STYLES: Record<string, string> = {
  Positive: "bg-green-500/20 text-green-400 border-green-500/30",
  Neutral: "bg-muted text-muted-foreground",
  Negative: "bg-red-500/20 text-red-400 border-red-500/30",
  NeedsFollowUp: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

export default function ActivitiesPage() {
  const campaignId = useActiveCampaign();
  const activities = useQuery(
    api.cultivationActivities.listByCampaign,
    campaignId ? { campaignId } : "skip"
  );
  const [showForm, setShowForm] = useState(false);

  if (campaignId === undefined) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Activities</h1>
          <p className="text-sm text-muted-foreground">Log cultivation activities and interactions</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Log Activity
        </Button>
      </div>

      {activities === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">No activities logged yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => {
            const Icon = ACTIVITY_ICONS[activity.activityType] ?? HelpCircle;
            return (
              <Card key={activity._id} className="bg-card border-border">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted border border-border">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">{activity.activityType}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(activity.activityDate)}</span>
                      {activity.outcome && (
                        <Badge
                          variant="outline"
                          className={cn("text-xs", OUTCOME_STYLES[activity.outcome] ?? "bg-muted text-muted-foreground")}
                        >
                          {activity.outcome}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {campaignId && (
        <CultivationActivityForm open={showForm} onOpenChange={setShowForm} campaignId={campaignId} />
      )}
    </div>
  );
}
