"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";

const CULTIVATION_STAGES = [
  "Prospect",
  "Identified",
  "Qualified",
  "Cultivated",
  "Solicited",
  "Pledged",
  "Stewarding",
] as const;

type CultivationStage = (typeof CULTIVATION_STAGES)[number];

const STAGE_COLORS: Record<CultivationStage, string> = {
  Prospect: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  Identified: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Qualified: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  Cultivated: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  Solicited: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Pledged: "bg-green-500/20 text-green-400 border-green-500/30",
  Stewarding: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export function DonorPipelineKanban() {
  const donors = useQuery(api.donors.list);
  const updateDonor = useMutation(api.donors.update);
  const router = useRouter();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOverStage = useRef<CultivationStage | null>(null);

  const handleDragStart = (donorId: string) => {
    setDraggingId(donorId);
  };

  const handleDragOver = (e: React.DragEvent, stage: CultivationStage) => {
    e.preventDefault();
    dragOverStage.current = stage;
  };

  const handleDrop = async (stage: CultivationStage) => {
    if (!draggingId) return;
    try {
      await updateDonor({ id: draggingId as Id<"donors">, cultivationStage: stage });
    } catch (err) {
      console.error("Failed to update cultivation stage", err);
    } finally {
      setDraggingId(null);
      dragOverStage.current = null;
    }
  };

  if (donors === undefined) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {CULTIVATION_STAGES.map((stage) => (
          <div key={stage} className="flex-shrink-0 w-52">
            <Skeleton className="h-8 w-full mb-2" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const byStage = CULTIVATION_STAGES.reduce<Record<CultivationStage, typeof donors>>(
    (acc, stage) => {
      acc[stage] = donors.filter((d) => d.cultivationStage === stage);
      return acc;
    },
    {} as Record<CultivationStage, typeof donors>
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {CULTIVATION_STAGES.map((stage) => (
        <div
          key={stage}
          className="flex-shrink-0 w-52"
          onDragOver={(e) => handleDragOver(e, stage)}
          onDrop={() => handleDrop(stage)}
        >
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-sm font-semibold text-foreground">{stage}</h3>
            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              {byStage[stage].length}
            </span>
          </div>
          <div className="space-y-2 min-h-[4rem]">
            {byStage[stage].length === 0 ? (
              <div className="h-16 rounded-lg border border-dashed border-border flex items-center justify-center">
                <span className="text-xs text-muted-foreground">No donors</span>
              </div>
            ) : (
              byStage[stage].map((donor) => (
                <Card
                  key={donor._id}
                  draggable
                  onDragStart={() => handleDragStart(donor._id)}
                  onClick={() => router.push(`/donors/${donor._id}`)}
                  className={cn(
                    "bg-card border-border cursor-pointer hover:border-primary/50 transition-colors select-none",
                    draggingId === donor._id && "opacity-50"
                  )}
                >
                  <CardContent className="p-3">
                    <p className="text-sm font-medium text-foreground truncate">
                      {donor.firstName} {donor.lastName}
                    </p>
                    {donor.organizationName && (
                      <p className="text-xs text-muted-foreground truncate">{donor.organizationName}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant="outline" className={cn("text-xs", STAGE_COLORS[stage])}>
                        {donor.donorTier}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
