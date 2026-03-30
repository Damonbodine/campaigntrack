"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down";
}

export function StatCard({ label, value, subtitle, trend }: StatCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <div className="mt-2 flex items-end gap-2">
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <span
              className={cn(
                "mb-1 flex items-center text-sm font-medium",
                trend === "up" ? "text-green-500" : "text-red-500"
              )}
            >
              {trend === "up" ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
