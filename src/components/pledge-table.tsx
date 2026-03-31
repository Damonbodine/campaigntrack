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
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate, formatEnum, cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface PledgeTableProps {
  campaignId: Id<"campaigns">;
  donorId?: Id<"donors">;
}

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Fulfilled: "bg-green-500/20 text-green-400 border-green-500/30",
  Delinquent: "bg-red-500/20 text-red-400 border-red-500/30",
  Cancelled: "bg-muted text-muted-foreground",
  WrittenOff: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

export function PledgeTable({ campaignId, donorId }: PledgeTableProps) {
  const pledges = useQuery(api.pledges.listByCampaign, { campaignId });

  const filtered = donorId
    ? pledges?.filter((p) => p.donorId === donorId)
    : pledges;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Pledges</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {pledges === undefined ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !filtered || filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-sm">No pledges found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Donor</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((pledge) => {
                const pct =
                  pledge.totalAmount > 0
                    ? Math.round((pledge.amountPaid / pledge.totalAmount) * 100)
                    : 0;
                return (
                  <TableRow key={pledge._id} className="border-border">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1.5">
                        {pledge.status === "Delinquent" && (
                          <AlertTriangle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                        )}
                        {pledge.isAnonymous ? "Anonymous" : pledge.donorName ?? "Unknown"}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(pledge.totalAmount)}</TableCell>
                    <TableCell>{formatCurrency(pledge.amountPaid)}</TableCell>
                    <TableCell className="w-32">
                      <div className="flex items-center gap-2">
                        <Progress value={pct} className="h-1.5" />
                        <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatEnum(pledge.frequency)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(pledge.endDate)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", STATUS_STYLES[pledge.status] ?? "bg-muted text-muted-foreground")}
                      >
                        {formatEnum(pledge.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
