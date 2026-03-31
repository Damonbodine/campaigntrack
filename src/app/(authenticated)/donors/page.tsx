"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DonorForm } from "@/components/donor-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatEnum } from "@/lib/utils";

export default function DonorsPage() {
  const donors = useQuery(api.donors.list, {});
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Donors</h1>
          <p className="text-sm text-muted-foreground">Manage and track all campaign donors</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Donor
        </Button>
      </div>

      {donors === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : donors.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">No donors yet. Add your first donor to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {donors.map((donor) => (
            <Link key={donor._id} href={`/donors/${donor._id}`}>
              <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      {donor.firstName} {donor.lastName}
                    </p>
                    {donor.organizationName && (
                      <p className="text-sm text-muted-foreground">{donor.organizationName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">{formatEnum(donor.cultivationStage)}</Badge>
                    <Badge variant="secondary" className="text-xs">{formatEnum(donor.donorTier)}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <DonorForm open={showForm} onOpenChange={setShowForm} />
    </div>
  );
}
