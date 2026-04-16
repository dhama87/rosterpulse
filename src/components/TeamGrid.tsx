"use client";

import Link from "next/link";
import Image from "next/image";
import { Team, Conference, Division } from "@/types";
import { useFavoriteTeams } from "@/hooks/useFavorites";
import { FavStar } from "./FavStar";

const divisions: Division[] = ["East", "North", "South", "West"];
const conferences: Conference[] = ["AFC", "NFC"];

interface TeamGridProps {
  teams: Team[];
  newsCountMap: Record<string, number>;
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

export function TeamGrid({ teams, newsCountMap }: TeamGridProps) {
  const { favs, toggle } = useFavoriteTeams();

  const favTeams = teams.filter((t) => favs.has(t.id));

  return (
    <>
      {/* Pinned favorites */}
      {favTeams.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-400">
            Favorites
          </h2>
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
