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
import { formatCurrency, formatDate } from "@/lib/utils";

interface RecentGiftsTableProps {
  campaignId: Id<"campaigns">;
}

export function RecentGiftsTable({ campaignId }: RecentGiftsTableProps) {
  const gifts = useQuery(api.dashboard.getRecentGifts, { campaignId });

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Gifts</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {gifts === undefined ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : gifts.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-sm">No gifts recorded yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Donor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Acknowledgment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gifts.map((gift) => (
                <TableRow key={gift._id} className="border-border">
                  <TableCell className="font-medium">
                    {gift.isAnonymous ? "Anonymous" : gift.donorName ?? "Unknown"}
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">
                    {formatCurrency(gift.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {gift.giftType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(gift.giftDate)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        gift.acknowledgmentStatus === "Sent"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : gift.acknowledgmentStatus === "Pending"
                          ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          : "bg-muted text-muted-foreground"
                      }
                      variant="outline"
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
