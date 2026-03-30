"use client";

import { DonorPipelineKanban } from "@/components/donor-pipeline-kanban";

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Donor Pipeline</h1>
        <p className="text-sm text-muted-foreground">Drag donors between cultivation stages</p>
      </div>
      <DonorPipelineKanban />
    </div>
  );
}
