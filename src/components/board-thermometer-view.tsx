"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CampaignThermometer } from "./campaign-thermometer";
import { PhaseProgressBar } from "./phase-progress-bar";
import { formatCurrency, formatDate, formatEnum, cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface BoardThermometerViewProps {
  campaignId: Id<"campaigns">;
}

export function BoardThermometerView({ campaignId }: BoardThermometerViewProps) {
  const boardView = useQuery(api.dashboard.getBoardView, { campaignId });

  if (boardView === undefined) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 space-y-10">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-96 w-48" />
        <Skeleton className="h-24 w-full max-w-3xl" />
        <Skeleton className="h-48 w-full max-w-3xl" />
      </div>
    );
  }

  if (!boardView) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Campaign not found.</p>
      </div>
    );
  }

  const allMilestones = [...boardView.milestonesAchieved, ...boardView.milestonesPending];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{boardView.campaignName}</h1>
          </div>
          <Badge
            variant="outline"
            className={
              boardView.status === "Active"
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-muted text-muted-foreground"
            }
          >
            {boardView.status}
          </Badge>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {/* Thermometer + summary */}
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="flex-shrink-0">
            <CampaignThermometer
              goalAmount={boardView.goalAmount}
              currentAmount={boardView.thermometerAmount}
            />
          </div>
          <div className="flex-1 space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground uppercase tracking-wider">Campaign Goal</p>
              <p className="text-4xl font-extrabold text-foreground">
                {formatCurrency(boardView.goalAmount)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground uppercase tracking-wider">Raised to Date</p>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(boardView.thermometerAmount)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground uppercase tracking-wider">Remaining</p>
              <p className="text-2xl font-semibold text-foreground">
                {formatCurrency(Math.max(boardView.goalAmount - boardView.thermometerAmount, 0))}
              </p>
            </div>
            <div className="pt-2">
              <p className="text-sm text-muted-foreground mb-2">Current Phase</p>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {formatEnum(boardView.currentPhase)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Phase breakdown */}
        <PhaseProgressBar campaignId={campaignId} />

        {/* Milestone timeline */}
        {allMilestones.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Milestones</h2>
            <div className="relative">
              <div className="absolute left-5 top-5 bottom-0 w-px bg-border" />
              <div className="space-y-4">
                {allMilestones.map((milestone, idx) => {
                  const isAchieved = "achievedDate" in milestone;
                  return (
                    <div key={idx} className="relative flex items-start gap-4">
                      <div
                        className={cn(
                          "relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border",
                          isAchieved
                            ? "bg-green-500/20 border-green-500/50"
                            : "bg-muted border-border"
                        )}
                      >
                        {isAchieved ? (
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 pt-1.5 pb-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className={cn("font-semibold", isAchieved ? "text-foreground" : "text-muted-foreground")}>
                            {milestone.name}
                          </p>
                          <Badge variant="outline" className={isAchieved ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-muted text-muted-foreground"}>
                            {isAchieved ? "Achieved" : "Pending"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                          {"targetAmount" in milestone && milestone.targetAmount && (
                            <span>Target: {formatCurrency(milestone.targetAmount)}</span>
                          )}
                          {"targetDate" in milestone && milestone.targetDate && (
                            <span>By: {formatDate(milestone.targetDate)}</span>
                          )}
                          {"achievedDate" in milestone && milestone.achievedDate && (
                            <span className="text-green-400">Achieved: {formatDate(milestone.achievedDate)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
