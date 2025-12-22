import { memo } from "react";

interface TimerDisplayProps {
  submissionDate: string;
  now: number; // Pass timestamp to trigger updates
}

const calculateTimer = (dateStr: string, currentTime: number) => {
  const sub = new Date(dateStr);
  const diff = currentTime - sub.getTime();

  if (diff < 0) return "0d, 0h, 0m, 0s";

  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);

  return `${d}d, ${h}h, ${m}m, ${s}s`;
};

/**
 * Memoized timer display component
 * Only re-renders when submissionDate or now changes
 */
export const TimerDisplay = memo<TimerDisplayProps>(
  ({ submissionDate, now }) => {
    return (
      <span className="font-bold text-red-600">
        {calculateTimer(submissionDate, now)}
      </span>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if time difference is significant (5+ seconds)
    const timeDiff = Math.abs(nextProps.now - prevProps.now);
    const dateChanged = prevProps.submissionDate !== nextProps.submissionDate;

    // Re-render if date changed OR if 5+ seconds have passed
    return !dateChanged && timeDiff < 5000;
  }
);

TimerDisplay.displayName = "TimerDisplay";
