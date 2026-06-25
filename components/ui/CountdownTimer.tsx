import { useEffect, useState } from "react";
import { getCountdown, type CountdownResult } from "@/lib/countdown";

interface CountdownTimerProps {
  startDate: string;
  endDate: string;
  compact?: boolean;
  className?: string;
}

export function CountdownTimer({ startDate, endDate, compact = false, className }: CountdownTimerProps) {
  const [countdown, setCountdown] = useState<CountdownResult | null>(null);

  useEffect(() => {
    // Initial run
    setCountdown(getCountdown(startDate, endDate));

    const interval = setInterval(() => {
      const result = getCountdown(startDate, endDate);
      setCountdown(result);
    }, 1000);

    return () => clearInterval(interval);
  }, [startDate, endDate]);

  if (!countdown || countdown.status === "past") {
    return null;
  }

  const { status, days, hours, minutes, seconds, label } = countdown;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className || ""}`}>
      <p className="text-[11px] uppercase tracking-wider text-muted">{label}</p>
      <div className="flex items-center gap-1 font-mono text-2xl sm:text-3xl font-bold text-accent tabular-nums">
        <span>{pad(days)}</span>
        <span className="text-muted/40">:</span>
        <span>{pad(hours)}</span>
        <span className="text-muted/40">:</span>
        <span>{pad(minutes)}</span>
        <span className="text-muted/40">:</span>
        <span>{pad(seconds)}</span>
      </div>
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted/70">
        <span className="w-[26px] text-center">days</span>
        <span className="w-[10px]" />
        <span className="w-[26px] text-center">hrs</span>
        <span className="w-[10px]" />
        <span className="w-[26px] text-center">min</span>
        <span className="w-[10px]" />
        <span className="w-[26px] text-center">sec</span>
      </div>
    </div>
  );
}
