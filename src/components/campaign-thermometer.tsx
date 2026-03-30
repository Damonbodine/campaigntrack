"use client";

import { cn, formatCurrency } from "@/lib/utils";

interface CampaignThermometerProps {
  goalAmount: number;
  currentAmount: number;
}

export function CampaignThermometer({ goalAmount, currentAmount }: CampaignThermometerProps) {
  const percentage = goalAmount > 0 ? Math.min((currentAmount / goalAmount) * 100, 100) : 0;

  const fillColor =
    percentage >= 75
      ? "bg-green-500"
      : percentage >= 50
      ? "bg-yellow-500"
      : percentage >= 25
      ? "bg-orange-500"
      : "bg-red-500";

  const glowColor =
    percentage >= 75
      ? "shadow-green-500/40"
      : percentage >= 50
      ? "shadow-yellow-500/40"
      : percentage >= 25
      ? "shadow-orange-500/40"
      : "shadow-red-500/40";

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Goal label */}
      <div className="text-sm font-medium text-muted-foreground tracking-wider uppercase">
        Goal: {formatCurrency(goalAmount)}
      </div>

      {/* Thermometer body */}
      <div className="relative flex flex-col items-center">
        {/* Tube */}
        <div className="relative w-16 h-72 rounded-full bg-muted border border-border overflow-hidden flex flex-col-reverse">
          {/* Fill */}
          <div
            className={cn(
              "w-full rounded-full transition-all duration-1000 ease-out shadow-lg",
              fillColor,
              glowColor
            )}
            style={{ height: `${percentage}%` }}
          />
          {/* Tick marks */}
          {[25, 50, 75].map((tick) => (
            <div
              key={tick}
              className="absolute left-0 right-0 border-t border-border/50"
              style={{ bottom: `${tick}%` }}
            />
          ))}
        </div>

        {/* Bulb */}
        <div
          className={cn(
            "w-16 h-16 rounded-full border-4 border-border flex items-center justify-center shadow-xl",
            fillColor,
            glowColor
          )}
        >
          <span className="text-xs font-bold text-white">
            {Math.round(percentage)}%
          </span>
        </div>

        {/* Tick labels */}
        <div className="absolute right-[-3.5rem] top-0 h-72 flex flex-col-reverse justify-between py-1">
          {[0, 25, 50, 75, 100].map((tick) => (
            <span key={tick} className="text-xs text-muted-foreground">
              {tick}%
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="text-center space-y-1">
        <p className={cn("text-3xl font-bold", fillColor.replace("bg-", "text-"))}>
          {formatCurrency(currentAmount)}
        </p>
        <p className="text-sm text-muted-foreground">
          raised of {formatCurrency(goalAmount)} goal
        </p>
        <p className="text-lg font-semibold text-foreground">
          {percentage.toFixed(1)}% complete
        </p>
      </div>
    </div>
  );
}
