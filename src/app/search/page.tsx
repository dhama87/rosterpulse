"use client";

import { use } from "react";
import Link from "next/link";
import { createMockRosterService } from "@/services/rosterService";
import { StatusBadge } from "@/components/StatusBadge";

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { q } = use(searchParams);
  const query = typeof q === "string" ? q : "";

  const service = createMockRosterService();
  const matchingPlayers = query ? service.searchPlayers(query) : [];
  const matchingTeams = query ? service.searchTeams(query) : [];

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-1 text-xl font-bold text-text-primary">
        Search Results
      </h1>
      <p className="mb-6 text-sm text-text-muted">
        {query ? (
          <>
            Showing results for &ldquo;{query}&rdquo;
          </>
        ) : (
          "Enter a search term to find players or teams."
        )}
      </p>

      {/* Teams */}
      {matchingTeams.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
            Teams ({matchingTeams.length})
          </h2>
          <div className="space-y-1">
            {matchingTeams.map((team) => (
              <Link
                key={team.id}
                href={`/team/${team.id}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-bg-card px-4 py-3 transition-colors hover:bg-bg-card-hover"
              >
                <span className="text-xl">{team.logo}</span>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {team.fullName}
                  </p>
                  <p className="text-xs text-text-muted">
                    {team.conference} {team.division} &middot; {team.record}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Players */}
      {matchingPlayers.length > 0 && (
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
            Players ({matchingPlayers.length})
          </h2>
          <div className="space-y-1">
            {matchingPlayers.map((player) => (
              <Link
                key={player.id}
                href={`/player/${player.id}`}
                className="flex items-center justify-between rounded-lg border border-border bg-bg-card px-4 py-3 transition-colors hover:bg-bg-card-hover"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-text-muted">
                    #{player.jerseyNumber}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {player.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {player.position.replace(/\d+$/, "")} &middot;{" "}
                      {player.team}
                    </p>
                  </div>
                </div>
                <StatusBadge
                  status={player.injuryStatus}
                  showOnlyIfNotActive
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {query && matchingTeams.length === 0 && matchingPlayers.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-text-muted">
            No results found for &ldquo;{query}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
