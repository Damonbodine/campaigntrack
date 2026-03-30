"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

interface GiftTableProps {
  campaignId: Id<"campaigns">;
  donorId?: Id<"donors">;
}

const ACK_STYLES: Record<string, string> = {
  Pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Sent: "bg-green-500/20 text-green-400 border-green-500/30",
  NotRequired: "bg-muted text-muted-foreground",
};

export function GiftTable({ campaignId, donorId }: GiftTableProps) {
  const gifts = useQuery(api.gifts.listByCampaign, { campaignId });

  const filtered = donorId ? gifts?.filter((g) => g.donorId === donorId) : gifts;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Gifts</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {gifts === undefined ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !filtered || filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-sm">No gifts recorded yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Donor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Acknowledgment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((gift) => (
                <TableRow key={gift._id} className="border-border">
                  <TableCell className="font-medium">
                    {gift.isAnonymous ? "Anonymous" : gift.donorName ?? "Unknown"}
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">
                    {formatCurrency(gift.amount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(gift.giftDate)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{gift.giftType}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {gift.designation ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", ACK_STYLES[gift.acknowledgmentStatus] ?? "bg-muted text-muted-foreground")}
                    >
                      {gift.acknowledgmentStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
