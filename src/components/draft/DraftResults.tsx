"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { DraftPick, TeamNeed, Team } from "@/types";

interface DraftResultsProps {
  picks: DraftPick[];
  teamNeeds: TeamNeed[];
  teams: Team[];
}

type ViewMode = "team" | "round" | "position";

export function DraftResults({ picks, teamNeeds, teams }: DraftResultsProps) {
  const [view, setView] = useState<ViewMode>("team");
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const filledPicks = picks.filter((p) => p.playerName !== "");

  const needsByTeam = new Map<string, Set<string>>();
  for (const need of teamNeeds) {
    const existing = needsByTeam.get(need.teamId) ?? new Set();
    existing.add(need.position);
    needsByTeam.set(need.teamId, existing);
  }

  return (
    <div>
      <div className="mb-6 rounded-lg border border-border bg-bg-card p-4 text-center">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
          2026 NFL Draft Results
        </h2>
        <p className="mt-1 text-xs text-text-muted">
          {filledPicks.length} picks across {new Set(filledPicks.map((p) => p.round)).size} rounds
        </p>
      </div>

      <div className="mb-4 flex gap-1 rounded-lg border border-border bg-bg-card p-1">
        {(["team", "round", "position"] as ViewMode[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              view === v
                ? "bg-bg-card-hover text-text-primary"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {v === "team" ? "By Team" : v === "round" ? "By Round" : "By Position"}
          </button>
        ))}
      </div>

      {view === "team" && (
        <div className="space-y-4">
          {teams
            .filter((t) => filledPicks.some((p) => p.teamId === t.id))
            .map((team) => {
              const teamPicks = filledPicks.filter((p) => p.teamId === team.id);
              const needs = needsByTeam.get(team.id) ?? new Set();
              const addressed = new Set(teamPicks.map((p) => p.position));
              const needsMet = [...needs].filter((n) => addressed.has(n));

              return (
                <div key={team.id} className="rounded-lg border border-border bg-bg-card overflow-hidden">
                  <Link
                    href={`/team/${team.id}`}
                    className="flex items-center gap-3 px-4 py-3 border-b border-border hover:bg-bg-card-hover transition-colors"
                  >
                    <Image src={team.logo} alt={team.name} width={28} height={28} className="h-7 w-7 object-contain" />
                    <span className="text-sm font-semibold text-text-primary">{team.fullName}</span>
                    <span className="ml-auto text-xs text-text-muted">{teamPicks.length} picks</span>
                    {needsMet.length > 0 && (
                      <span className="text-[10px] text-status-green">
                        {needsMet.length} needs addressed
                      </span>
                    )}
                  </Link>
                  <div className="divide-y divide-border/50">
                    {teamPicks.map((pick) => (
                      <div key={pick.id} className="flex items-center gap-3 px-4 py-2">
                        <span className="w-16 text-xs text-text-muted font-mono">
                          Rd {pick.round} · #{pick.pickNumber}
                        </span>
                        <span className="text-sm font-semibold text-text-primary">{pick.playerName}</span>
                        <span className="text-xs text-text-secondary">{pick.position}</span>
                        <span className="text-xs text-text-muted">{pick.college}</span>
                        {pick.isTradeUp && (
                          <span className="ml-auto rounded-full bg-status-amber-bg px-2 py-0.5 text-[10px] font-semibold text-status-amber">
                            TRADE
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {view === "round" && (
        <div className="space-y-6">
          {Array.from(new Set(filledPicks.map((p) => p.round)))
            .sort((a, b) => a - b)
            .map((round) => {
              const roundPicks = filledPicks.filter((p) => p.round === round);
              return (
                <div key={round}>
                  <h3 className="mb-2 text-sm font-semibold text-text-secondary">
                    Round {round} ({roundPicks.length} picks)
                  </h3>
                  <div className="space-y-1.5">
                    {roundPicks.map((pick) => {
                      const team = teamMap.get(pick.teamId);
                      return (
                        <div key={pick.id} className="flex items-center gap-3 rounded-lg border border-border bg-bg-card px-3 py-2">
                          <span className="w-8 text-center font-mono text-sm font-bold text-text-muted">
                            {pick.pickNumber}
                          </span>
                          {team && (
                            <Image src={team.logo} alt={team.name} width={24} height={24} className="h-6 w-6 object-contain" />
                          )}
                          <span className="text-sm font-semibold text-text-primary">{pick.playerName}</span>
                          <span className="text-xs text-text-secondary">{pick.position}</span>
                          <span className="ml-auto text-xs text-text-muted">{pick.college}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {view === "position" && (
        <div className="space-y-6">
          {Array.from(new Set(filledPicks.map((p) => p.position)))
            .sort()
            .map((pos) => {
              const posPicks = filledPicks.filter((p) => p.position === pos);
              return (
                <div key={pos}>
                  <h3 className="mb-2 text-sm font-semibold text-text-secondary">
                    {pos} ({posPicks.length} drafted)
                  </h3>
                  <div className="space-y-1.5">
                    {posPicks.map((pick) => {
                      const team = teamMap.get(pick.teamId);
                      return (
                        <div key={pick.id} className="flex items-center gap-3 rounded-lg border border-border bg-bg-card px-3 py-2">
                          <span className="w-8 text-center font-mono text-sm font-bold text-text-muted">
                            {pick.pickNumber}
                          </span>
                          {team && (
                            <Image src={team.logo} alt={team.name} width={24} height={24} className="h-6 w-6 object-contain" />
                          )}
                          <span className="text-sm font-semibold text-text-primary">{pick.playerName}</span>
                          <span className="ml-auto text-xs text-text-muted">{team?.name} · {pick.college}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
