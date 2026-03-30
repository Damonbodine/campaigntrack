"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency, cn } from "@/lib/utils";

interface PhaseProgressBarProps {
  campaignId: Id<"campaigns">;
}

const PHASE_PALETTE = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
];

const STATUS_BADGE: Record<string, string> = {
  Upcoming: "bg-muted text-muted-foreground",
  Active: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Completed: "bg-green-500/20 text-green-400 border-green-500/30",
};

export function PhaseProgressBar({ campaignId }: PhaseProgressBarProps) {
  const phases = useQuery(api.campaignPhases.listByCampaign, { campaignId });

  if (phases === undefined) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Phase Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-full rounded-full" />
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!phases || phases.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Phase Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">No phases configured.</p>
        </CardContent>
      </Card>
    );
  }

  const totalGoal = phases.reduce((sum, p) => sum + (p.goalAmount ?? 0), 0);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Phase Progress</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stacked bar */}
        <TooltipProvider>
          <div className="flex h-8 w-full overflow-hidden rounded-full border border-border">
            {phases.map((phase, idx) => {
              const widthPct =
                totalGoal > 0 ? ((phase.goalAmount ?? 0) / totalGoal) * 100 : 0;
              const raisedPct =
                phase.goalAmount > 0
                  ? Math.min(((phase.raisedAmount ?? 0) / phase.goalAmount) * 100, 100)
                  : 0;
              const color = PHASE_PALETTE[idx % PHASE_PALETTE.length];
              return (
                <Tooltip key={phase._id}>
                  <TooltipTrigger asChild>
                    <div
                      className="relative overflow-hidden flex-shrink-0 cursor-default"
                      style={{ width: `${widthPct}%` }}
                    >
                      {/* Background */}
                      <div className={cn("absolute inset-0 opacity-20", color)} />
                      {/* Fill */}
                      <div
                        className={cn("absolute inset-y-0 left-0 transition-all", color)}
                        style={{ width: `${raisedPct}%` }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-popover border-border">
                    <p className="font-semibold">{phase.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(phase.raisedAmount ?? 0)} / {formatCurrency(phase.goalAmount ?? 0)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {phases.map((phase, idx) => {
            const color = PHASE_PALETTE[idx % PHASE_PALETTE.length];
            const raisedPct =
              phase.goalAmount > 0
                ? Math.round(((phase.raisedAmount ?? 0) / phase.goalAmount) * 100)
                : 0;
            return (
              <div key={phase._id} className="rounded-lg border border-border p-3 space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className={cn("h-2.5 w-2.5 rounded-full flex-shrink-0", color)} />
                  <p className="text-xs font-medium text-foreground truncate">{phase.name}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {formatCurrency(phase.raisedAmount ?? 0)}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    of {formatCurrency(phase.goalAmount ?? 0)}
                  </p>
                  <Badge
                    variant="outline"
                    className={cn("text-xs", STATUS_BADGE[phase.status] ?? "bg-muted text-muted-foreground")}
                  >
                    {phase.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
