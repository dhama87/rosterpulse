"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { DraftPick, DraftProspect, TeamNeed, Team } from "@/types";
import { DraftCountdown } from "./DraftCountdown";
import { DraftPickCard } from "./DraftPickCard";

interface PreDraftHubProps {
  draftOrder: DraftPick[];
  prospects: DraftProspect[];
  teamNeeds: TeamNeed[];
  teams: Team[];
  draftStartDate: string;
  prospectsSource?: string;
  needsSource?: string;
}

type Tab = "order" | "needs" | "prospects";

const PRIORITY_COLORS: Record<number, string> = {
  1: "bg-status-red text-white",
  2: "bg-status-amber text-black",
  3: "bg-bg-card-hover text-text-muted",
};

export function PreDraftHub({
  draftOrder,
  prospects,
  teamNeeds,
  teams,
  draftStartDate,
  prospectsSource,
  needsSource,
}: PreDraftHubProps) {
  const [tab, setTab] = useState<Tab>("order");
  const teamMap = new Map(teams.map((t) => [t.id, t]));

  const needsByTeam = new Map<string, TeamNeed[]>();
  for (const need of teamNeeds) {
    const existing = needsByTeam.get(need.teamId) ?? [];
    existing.push(need);
    needsByTeam.set(need.teamId, existing);
  }

  return (
    <div>
      {/* Countdown */}
      <div className="mb-6 rounded-lg border border-border bg-bg-card p-6 text-center">
        <h2 className="mb-1 text-sm font-semibold text-text-muted uppercase tracking-wider">
          2026 NFL Draft
        </h2>
        <p className="mb-4 text-xs text-text-muted">April 23-25, 2026</p>
        <DraftCountdown targetDate={draftStartDate} />
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-lg border border-border bg-bg-card p-1">
        {(["order", "needs", "prospects"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === t
                ? "bg-bg-card-hover text-text-primary"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {t === "order" ? "Draft Order" : t === "needs" ? "Team Needs" : "Top Prospects"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "order" && (
        <div className="space-y-2">
          {draftOrder.map((pick) => (
            <DraftPickCard
              key={pick.id}
              pick={pick}
              team={teamMap.get(pick.teamId)}
              showRound
            />
          ))}
        </div>
      )}

      {tab === "needs" && (
        <div className="space-y-2">
          {draftOrder.map((pick) => {
            const team = teamMap.get(pick.teamId);
            const needs = needsByTeam.get(pick.teamId) ?? [];
            if (!team) return null;

            return (
              <Link
                key={pick.id}
                href={`/team/${team.id}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-bg-card px-3 py-2.5 hover:bg-bg-card-hover transition-colors"
              >
                <span className="w-8 text-center font-mono text-sm font-bold text-text-muted">
                  {pick.pickNumber}
                </span>
                <Image src={team.logo} alt={team.name} width={28} height={28} className="h-7 w-7 object-contain" />
                <span className="text-sm font-semibold text-text-primary">{team.name}</span>
                <div className="ml-auto flex gap-1.5">
                  {needs.sort((a, b) => a.priority - b.priority).map((n) => (
                    <span
                      key={n.position}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_COLORS[n.priority]}`}
                    >
                      {n.position}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
          {needsSource && (
            <p className="mt-3 text-xs text-text-muted text-center">
              Source: {needsSource}
            </p>
          )}
        </div>
      )}

      {tab === "prospects" && (
        <div className="space-y-2">
          {prospects.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-bg-card px-3 py-2.5"
            >
              <span className="w-8 text-center font-mono text-sm font-bold text-text-muted">
                {p.rank}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text-primary">{p.name}</div>
                <div className="text-xs text-text-muted">{p.college}</div>
              </div>
              <span className="rounded-full bg-bg-card-hover px-2 py-0.5 text-[10px] font-semibold text-text-secondary">
                {p.position}
              </span>
              {p.projectedPick && (
                <span className="text-xs text-text-muted font-mono">
                  ~{p.projectedPick}
                </span>
              )}
            </div>
          ))}
          {prospectsSource && (
            <p className="mt-3 text-xs text-text-muted text-center">
              Rankings: {prospectsSource}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
