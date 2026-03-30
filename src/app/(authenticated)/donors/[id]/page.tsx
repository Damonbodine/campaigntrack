"use client";

import { use } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { DonorDetailView } from "@/components/donor-detail-view";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DonorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="space-y-4">
      <Link href="/donors">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Donors
        </Button>
      </Link>
      <DonorDetailView donorId={id as Id<"donors">} />
    </div>
  );
}
