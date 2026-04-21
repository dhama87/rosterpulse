"use client";

import { useState } from "react";
import type { PlayoffScenario, Team } from "@/types";

const PLAYOFF_IMPLICATIONS_START_WEEK = 12;

interface PlayoffPictureProps {
  scenarios: PlayoffScenario[];
  teams: Team[];
  currentWeek: number;
}

function ConferenceColumn({
  conference,
  scenarios,
  teams,
}: {
  conference: "AFC" | "NFC";
  scenarios: PlayoffScenario[];
  teams: Team[];
}) {
  const confScenarios = scenarios.filter((s) => {
    const team = teams.find((t) => t.id === s.teamId);
    return team?.conference === conference;
  });

  const seeds = confScenarios
    .filter((s) => s.seed != null && s.seed <= 7)
    .sort((a, b) => (a.seed ?? 99) - (b.seed ?? 99));

  const inHunt = confScenarios.filter(
    (s) => s.status === "in_hunt" && (s.seed == null || s.seed > 7)
  );

  const eliminated = confScenarios.filter((s) => s.status === "eliminated");

  return (
    <div className="flex-1 min-w-0">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-[2px] text-text-muted">
        {conference}
      </h3>

      {/* Playoff seeds */}
      <div className="space-y-1 mb-4">
        {seeds.map((s) => {
          const team = teams.find((t) => t.id === s.teamId);
          if (!team) return null;
          const statusColor =
            s.status === "clinched_division" || s.status === "clinched_playoff"
              ? "text-status-green"
              : "text-text-primary";
          return (
            <div key={s.teamId} className="flex items-center gap-2 py-1">
              <span className="w-5 text-center font-mono text-[10px] text-text-muted">
                {s.seed}
              </span>
              <span className={`flex-1 text-sm font-medium ${statusColor}`}>
                {team.name}
              </span>
              <span className="font-mono text-[11px] text-text-muted">
                {team.record}
              </span>
            </div>
          );
        })}
      </div>

      {/* In the hunt */}
      {inHunt.length > 0 && (
        <div className="mb-4">
          <div className="mb-1 text-[9px] font-bold uppercase tracking-[1.5px] text-status-amber">
            In the Hunt
          </div>
          <div className="space-y-1">
            {inHunt.map((s) => {
              const team = teams.find((t) => t.id === s.teamId);
              if (!team) return null;
              return (
                <div key={s.teamId} className="py-1">
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-sm text-text-secondary">
                      {team.name}
                    </span>
                    <span className="font-mono text-[11px] text-text-muted">
                      {team.record}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-text-muted">
                    {s.scenarioText}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Eliminated */}
      {eliminated.length > 0 && (
        <div>
          <div className="mb-1 text-[9px] font-bold uppercase tracking-[1.5px] text-text-muted/50">
            Eliminated
          </div>
          <div className="space-y-0.5">
            {eliminated.map((s) => {
              const team = teams.find((t) => t.id === s.teamId);
              if (!team) return null;
              return (
                <div
                  key={s.teamId}
                  className="flex items-center gap-2 py-0.5 opacity-40"
                >
                  <span className="flex-1 text-sm text-text-muted line-through">
                    {team.name}
                  </span>
                  <span className="font-mono text-[11px] text-text-muted">
                    {team.record}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function PlayoffPicture({
  scenarios,
  teams,
  currentWeek,
}: PlayoffPictureProps) {
  const [expanded, setExpanded] = useState(false);

  if (currentWeek < PLAYOFF_IMPLICATIONS_START_WEEK) return null;
  if (scenarios.length === 0) return null;

  return (
    <div className="mb-6 rounded-lg border border-border bg-bg-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-xs font-bold uppercase tracking-[2px] text-text-muted">
          Playoff Picture
        </span>
        <span className="text-text-muted text-sm">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-4">
          <div className="flex gap-8">
            <ConferenceColumn
              conference="AFC"
              scenarios={scenarios}
              teams={teams}
            />
            <ConferenceColumn
              conference="NFC"
              scenarios={scenarios}
              teams={teams}
            />
          </div>
        </div>
      )}
    </div>
  );
}
