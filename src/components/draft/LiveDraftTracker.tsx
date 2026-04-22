"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import type { DraftPick, DraftLiveResponse, Team } from "@/types";
import { DraftPickCard } from "./DraftPickCard";

interface LiveDraftTrackerProps {
  initialPicks: DraftPick[];
  teams: Team[];
}

const POLL_INTERVAL_MS = 5_000;

export function LiveDraftTracker({ initialPicks, teams }: LiveDraftTrackerProps) {
  const [picks, setPicks] = useState<DraftPick[]>(initialPicks.filter((p) => p.playerName !== ""));
  const [newPickIds, setNewPickIds] = useState<Set<string>>(new Set());
  const [onTheClock, setOnTheClock] = useState<{ teamId: string; timeRemaining: number } | null>(null);
  const [currentPick, setCurrentPick] = useState(initialPicks.filter((p) => p.playerName !== "").length + 1);
  const [isActive, setIsActive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [connectionError, setConnectionError] = useState(false);
  const lastTimestamp = useRef<string | null>(null);

  const teamMap = new Map(teams.map((t) => [t.id, t]));

  const poll = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (lastTimestamp.current) params.set("since", lastTimestamp.current);

      const res = await fetch(`/api/draft/live?${params.toString()}`);
      if (!res.ok) throw new Error("Poll failed");

      const data = (await res.json()) as DraftLiveResponse;

      if (data.picks.length > 0) {
        const newIds = new Set(data.picks.map((p) => p.id));
        setNewPickIds(newIds);

        setPicks((prev) => {
          const existing = new Set(prev.map((p) => p.id));
          const fresh = data.picks
            .filter((p) => !existing.has(p.id))
            .sort((a, b) => b.pickNumber - a.pickNumber); // newest first
          return [...fresh, ...prev];
        });

        setTimeout(() => setNewPickIds(new Set()), 3000);

        const latestPick = data.picks[data.picks.length - 1];
        if (latestPick?.timestamp) {
          lastTimestamp.current = latestPick.timestamp;
        }
      }

      setOnTheClock(data.onTheClock);
      setCurrentPick(data.currentPick);
      setIsActive(data.isActive);
      setLastUpdated(data.lastUpdated);
      setConnectionError(false);
    } catch {
      setConnectionError(true);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [poll]);

  // Determine current round from the highest pick number
  const maxRound = picks.length > 0
    ? Math.max(...picks.map((p) => p.round))
    : 1;
  const picksInRound = picks.filter((p) => p.round === maxRound);

  const clockTeam = onTheClock ? teamMap.get(onTheClock.teamId) : null;

  return (
    <div>
      {clockTeam && (
        <div className="mb-6 rounded-lg border border-status-green/30 bg-status-green-bg/10 p-4">
          <div className="text-center">
            <span className="text-[10px] font-semibold text-status-green uppercase tracking-wider">
              On the Clock — Pick {currentPick}
            </span>
            <div className="mt-2 flex items-center justify-center gap-3">
              <Image
                src={clockTeam.logo}
                alt={clockTeam.name}
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
              <span className="text-xl font-bold text-text-primary">{clockTeam.fullName}</span>
            </div>
          </div>
        </div>
      )}

      {connectionError && (
        <div className="mb-4 rounded-lg border border-status-amber/30 bg-status-amber-bg/10 px-3 py-2 text-center text-xs text-status-amber">
          Connection lost — retrying...
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-secondary">
          Round {maxRound} — {picksInRound.length}/32 picks
        </h2>
        {!isActive && (
          <span className="text-xs text-text-muted">Between rounds</span>
        )}
        <span className="text-[10px] text-text-muted font-mono">
          Updated {new Date(lastUpdated).toLocaleTimeString()}
        </span>
      </div>

      <div className="mb-6 h-1.5 rounded-full bg-bg-card-hover">
        <div
          className="h-full rounded-full bg-status-green transition-all duration-500"
          style={{ width: `${(picksInRound.length / 32) * 100}%` }}
        />
      </div>

      <div className="space-y-2">
        {picks.map((pick) => (
          <DraftPickCard
            key={pick.id}
            pick={pick}
            team={teamMap.get(pick.teamId)}
            isNew={newPickIds.has(pick.id)}
            showRound
          />
        ))}
      </div>

      {picks.length === 0 && (
        <div className="text-center py-12 text-text-muted text-sm">
          Waiting for picks...
        </div>
      )}
    </div>
  );
}
