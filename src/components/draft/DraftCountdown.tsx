"use client";

import { useState, useEffect } from "react";

interface DraftCountdownProps {
  targetDate: string;
}

function getTimeRemaining(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

export function DraftCountdown({ targetDate }: DraftCountdownProps) {
  const target = new Date(targetDate);
  const [time, setTime] = useState(getTimeRemaining(target));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeRemaining(target));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (time.expired) {
    return (
      <div className="text-center">
        <span className="text-sm font-semibold text-status-green">Draft is LIVE</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <TimeUnit value={time.days} label="DAYS" />
      <span className="text-xl font-bold text-text-muted">:</span>
      <TimeUnit value={time.hours} label="HRS" />
      <span className="text-xl font-bold text-text-muted">:</span>
      <TimeUnit value={time.minutes} label="MIN" />
      <span className="text-xl font-bold text-text-muted">:</span>
      <TimeUnit value={time.seconds} label="SEC" />
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl sm:text-3xl font-bold font-mono text-text-primary tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] text-text-muted tracking-wider">{label}</span>
    </div>
  );
}
