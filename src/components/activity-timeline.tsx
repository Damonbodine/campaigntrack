"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, cn } from "@/lib/utils";
import {
  Phone,
  Users,
  Eye,
  Mail,
  Calendar,
  FileText,
  Heart,
  MailOpen,
  HelpCircle,
} from "lucide-react";

interface ActivityTimelineProps {
  donorId: Id<"donors">;
}

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

export function ActivityTimeline({ donorId }: ActivityTimelineProps) {
  const activities = useQuery(api.cultivationActivities.listByDonor, { donorId });

  if (activities === undefined) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <Skeleton className="h-20 flex-1 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No activities logged yet.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-4">
      {/* Vertical line */}
      <div className="absolute left-5 top-5 bottom-0 w-px bg-border" />

      {activities.map((activity, idx) => {
        const Icon = ACTIVITY_ICONS[activity.activityType] ?? HelpCircle;
        return (
          <div key={activity._id} className="relative flex gap-4">
            {/* Icon */}
            <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-card border border-border">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Content */}
            <Card className="flex-1 bg-card border-border">
              <CardContent className="p-4">
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
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                {activity.nextStepDescription && (
                  <div className="mt-3 p-2.5 rounded-md bg-muted/50 border border-border/50">
                    <p className="text-xs font-medium text-foreground mb-0.5">Next Step</p>
                    <p className="text-xs text-muted-foreground">{activity.nextStepDescription}</p>
                    {activity.nextStepDate && (
                      <p className="text-xs text-primary mt-1">{formatDate(activity.nextStepDate)}</p>
                    )}
                  </div>
                )}
                {activity.loggedByName && (
                  <p className="mt-2 text-xs text-muted-foreground">Logged by {activity.loggedByName}</p>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
