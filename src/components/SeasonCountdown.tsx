"use client";

import { useState, useEffect } from "react";

// 2026 NFL Season Kickoff — Thursday, September 10, 2026 at 8:20 PM ET
const KICKOFF = new Date("2026-09-10T20:20:00-04:00").getTime();

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft | null {
  const diff = KICKOFF - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function SeasonCountdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(getTimeLeft());
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted || !timeLeft) return null;

  return (
    <div className="flex items-center gap-2 rounded-md border border-border/50 px-2.5 py-1">
      <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
        Kickoff
      </span>
      <div className="flex items-center gap-1 font-mono text-[11px] text-text-secondary">
        <span>{timeLeft.days}<span className="text-text-muted">d</span></span>
        <span>{String(timeLeft.hours).padStart(2, "0")}<span className="text-text-muted">h</span></span>
        <span>{String(timeLeft.minutes).padStart(2, "0")}<span className="text-text-muted">m</span></span>
        <span>{String(timeLeft.seconds).padStart(2, "0")}<span className="text-text-muted">s</span></span>
      </div>
    </div>
  );
}
