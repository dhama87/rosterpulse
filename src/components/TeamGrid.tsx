"use client";

import Link from "next/link";
import Image from "next/image";
import { Team, Conference, Division } from "@/types";
import { useFavoriteTeams } from "@/hooks/useFavorites";
import { FavStar } from "./FavStar";

const divisions: Division[] = ["East", "North", "South", "West"];
const conferences: Conference[] = ["AFC", "NFC"];

export interface TeamSummary {
  injuredStarters: number;
  questionable: number;
  rookies: number;
  latestHeadline: string | null;
}

interface TeamGridProps {
  teams: Team[];
  newsCountMap: Record<string, number>;
  teamSummaries?: Record<string, TeamSummary>;
}

function TeamCardWithFav({
  team,
  newsCount,
  isFav,
  onToggle,
}: {
  team: Team;
  newsCount: number;
  isFav: boolean;
  onToggle: () => void;
}) {
  const hasBreakingNews = newsCount > 0;

  return (
    <div
      className={`group relative flex items-center gap-3 rounded-lg border bg-bg-card px-3 py-3 transition-all hover:bg-bg-card-hover ${
        hasBreakingNews
          ? "border-status-amber/30 shadow-[0_0_8px_rgba(245,158,11,0.08)]"
          : "border-border"
      }`}
    >
      <FavStar active={isFav} onClick={onToggle} />
      <Link
        href={`/team/${team.id}`}
        className="flex flex-1 items-center gap-3 min-w-0"
      >
        <Image
          src={team.logo}
          alt={team.name}
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-text-primary group-hover:text-white">
            {team.name}
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-text-muted">
            <span>{team.record}</span>
            <span className="text-text-muted/60">BYE {team.byeWeek}</span>
          </div>
        </div>
        {hasBreakingNews && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-status-amber-bg text-[10px] font-bold text-status-amber">
            {newsCount}
          </span>
        )}
      </Link>
    </div>
  );
}

function FavDashboardCard({
  team,
  newsCount,
  summary,
  onToggle,
}: {
  team: Team;
  newsCount: number;
  summary: TeamSummary;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-bg-card overflow-hidden">
      {/* Team header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <FavStar active={true} onClick={onToggle} />
        <Link href={`/team/${team.id}`} className="flex flex-1 items-center gap-3 min-w-0">
          <Image src={team.logo} alt={team.name} width={28} height={28} className="h-7 w-7 object-contain" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-text-primary">{team.fullName}</div>
            <div className="text-[11px] text-text-muted">{team.conference} {team.division} &middot; {team.record}</div>
          </div>
        </Link>
      </div>

      {/* Stats row */}
      <div className="flex divide-x divide-border">
        {summary.injuredStarters > 0 && (
          <div className="flex-1 px-3 py-2.5 text-center">
            <div className="text-lg font-bold text-status-red">{summary.injuredStarters}</div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Out</div>
          </div>
        )}
        {summary.questionable > 0 && (
          <div className="flex-1 px-3 py-2.5 text-center">
            <div className="text-lg font-bold text-status-amber">{summary.questionable}</div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Questionable</div>
          </div>
        )}
        {newsCount > 0 && (
          <div className="flex-1 px-3 py-2.5 text-center">
            <div className="text-lg font-bold text-status-amber">{newsCount}</div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Today</div>
          </div>
        )}
        {summary.rookies > 0 && (
          <div className="flex-1 px-3 py-2.5 text-center">
            <div className="text-lg font-bold text-status-blue">{summary.rookies}</div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Rookies</div>
          </div>
        )}
        {summary.injuredStarters === 0 && summary.questionable === 0 && newsCount === 0 && summary.rookies === 0 && (
          <div className="flex-1 px-3 py-2.5 text-center">
            <div className="text-sm font-medium text-status-green">All Clear</div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider">No Issues</div>
          </div>
        )}
      </div>

      {/* Latest headline */}
      {summary.latestHeadline && (
        <div className="border-t border-border px-4 py-2">
          <p className="text-xs text-text-muted truncate">
            {summary.latestHeadline}
          </p>
        </div>
      )}
    </div>
  );
}

export function TeamGrid({ teams, newsCountMap, teamSummaries }: TeamGridProps) {
  const { favs, toggle } = useFavoriteTeams();

  const favTeams = teams.filter((t) => favs.has(t.id));

  return (
    <>
      {/* Favorites dashboard */}
      {favTeams.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-400">
            Your Teams
          </h2>
          {teamSummaries ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {favTeams.map((team) => (
                <FavDashboardCard
                  key={team.id}
                  team={team}
                  newsCount={newsCountMap[team.id] ?? 0}
                  summary={teamSummaries[team.id] ?? { injuredStarters: 0, questionable: 0, rookies: 0, latestHeadline: null }}
                  onToggle={() => toggle(team.id)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {favTeams.map((team) => (
                <TeamCardWithFav
                  key={team.id}
                  team={team}
                  newsCount={newsCountMap[team.id] ?? 0}
                  isFav={true}
                  onToggle={() => toggle(team.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Conference grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        {conferences.map((conf) => (
          <div key={conf}>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-muted">
              {conf}
            </h2>
            <div className="space-y-5">
              {divisions.map((div) => {
                const divTeams = teams.filter(
                  (t) => t.conference === conf && t.division === div
                );
                return (
                  <div key={div}>
                    <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                      {conf} {div}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {divTeams.map((team) => (
                        <TeamCardWithFav
                          key={team.id}
                          team={team}
                          newsCount={newsCountMap[team.id] ?? 0}
                          isFav={favs.has(team.id)}
                          onToggle={() => toggle(team.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
