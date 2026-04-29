import type { Metadata } from "next";
import Link from "next/link";
import { createRosterService } from "@/services/createRosterService";
import { StatusBadge } from "@/components/StatusBadge";
import type { Player, Team } from "@/types";

export const metadata: Metadata = {
  title: "2026 NFL Rookie Tracker",
  description:
    "Track every 2026 NFL Draft pick across all 32 teams. See where rookies landed on the depth chart and their current status.",
  openGraph: {
    title: "2026 NFL Rookie Tracker | RosterPulse",
    description: "Where every 2026 draft pick landed on the depth chart.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "2026 NFL Rookie Tracker | RosterPulse",
    description: "Where every 2026 draft pick landed on the depth chart.",
  },
  alternates: { canonical: "/rookies" },
};

export const dynamic = "force-dynamic";

interface RookieEntry {
  player: Player;
  team: Team;
}

export default async function RookiesPage() {
  const service = createRosterService();
  const allTeams = service.getAllTeams();

  const rookies: RookieEntry[] = [];

  for (const team of allTeams) {
    const roster = await service.getTeamRoster(team.id);
    if (!roster) continue;
    for (const entry of roster.depthChart) {
      for (const player of entry.players) {
        if (player.experience === 0) {
          rookies.push({ player, team });
        }
      }
    }
  }

  // Group by team
  const byTeam = new Map<string, RookieEntry[]>();
  for (const entry of rookies) {
    const list = byTeam.get(entry.team.id) ?? [];
    list.push(entry);
    byTeam.set(entry.team.id, list);
  }

  // Sort within each team by depth order
  for (const list of byTeam.values()) {
    list.sort((a, b) => a.player.depthOrder - b.player.depthOrder);
  }

  // Sort teams by number of rookies (most first)
  const sortedTeams = [...byTeam.entries()].sort((a, b) => b[1].length - a[1].length);

  const starterCount = rookies.filter((r) => r.player.depthOrder === 1).length;

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">
          2026 NFL Rookie Tracker
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {rookies.length} rookies across {byTeam.size} teams — {starterCount} projected starters.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedTeams.map(([teamId, entries]) => {
          const team = entries[0].team;
          return (
            <div
              key={teamId}
              className="rounded-lg border border-border bg-bg-card overflow-hidden"
            >
              {/* Team header */}
              <Link
                href={`/team/${teamId}`}
                className="flex items-center justify-between px-4 py-3 border-b border-border hover:bg-bg-card-hover transition-colors"
              >
                <span className="text-sm font-semibold text-text-primary">
                  {team.fullName}
                </span>
                <span className="text-xs text-text-muted">
                  {entries.length} rookie{entries.length !== 1 ? "s" : ""}
                </span>
              </Link>

              {/* Rookie list */}
              <div className="divide-y divide-border">
                {entries.map(({ player }) => {
                  const pos = player.position.replace(/\d+$/, "");
                  const depthLabel =
                    player.depthOrder === 1
                      ? "Starter"
                      : player.depthOrder === 2
                        ? "2nd"
                        : "3rd+";
                  return (
                    <Link
                      key={player.id}
                      href={`/player/${player.id}`}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-bg-card-hover transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[11px] text-text-muted">
                          #{player.jerseyNumber}
                        </span>
                        <span className="text-sm text-text-primary truncate">
                          {player.name}
                        </span>
                        <span className="text-[10px] font-mono text-text-muted">
                          {pos}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span
                          className={`text-[10px] font-semibold ${
                            player.depthOrder === 1
                              ? "text-status-green"
                              : "text-text-muted"
                          }`}
                        >
                          {depthLabel}
                        </span>
                        <StatusBadge
                          status={player.injuryStatus}
                          showOnlyIfNotActive
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
