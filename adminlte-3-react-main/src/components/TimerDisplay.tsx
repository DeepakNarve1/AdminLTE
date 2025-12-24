"use client";
import React, { memo } from "react";
import { DateTime } from "luxon";

interface TimerDisplayProps {
  submissionDate: string;
  now: number;
}

export const TimerDisplay = memo(
  ({ submissionDate, now }: TimerDisplayProps) => {
    if (!submissionDate) return <span>-</span>;

    const start = DateTime.fromISO(submissionDate);
    const end = DateTime.fromMillis(now);
    const diff = end.diff(start, ["days", "hours", "minutes"]);

    const days = Math.floor(diff.days);
    const hours = Math.floor(diff.hours);
    const minutes = Math.floor(diff.minutes);

    let colorClass = "text-green-600";
    if (days >= 7) colorClass = "text-red-600 font-bold";
    else if (days >= 3) colorClass = "text-yellow-600 font-semibold";

    return (
      <div className={`flex items-center gap-1 text-sm ${colorClass}`}>
        <span className="tabular-nums">
          {days > 0 ? `${days}d ` : ""}
          {hours > 0 ? `${hours}h ` : ""}
          {minutes}m
        </span>
      </div>
    );
  }
);

TimerDisplay.displayName = "TimerDisplay";
