import type { Metadata } from "next";
import Link from "next/link";
import { createRosterService } from "@/services/createRosterService";
import { StatusBadge } from "@/components/StatusBadge";
import type { Player, Team } from "@/types";

export const metadata: Metadata = {
  title: "NFL Injury Report",
  description:
    "Complete NFL injury report across all 32 teams. Track every injured starter, questionable player, and IR designation — updated daily.",
  openGraph: {
    title: "NFL Injury Report | RosterPulse",
    description:
      "Complete NFL injury report across all 32 teams. Every injured starter, updated daily.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NFL Injury Report | RosterPulse",
    description: "Complete NFL injury report across all 32 teams.",
  },
  alternates: { canonical: "/injuries" },
};

export const dynamic = "force-dynamic";

interface InjuredPlayer {
  player: Player;
  team: Team;
}

export default async function InjuriesPage() {
  const service = createRosterService();
  const allTeams = service.getAllTeams();

  const injured: InjuredPlayer[] = [];

  for (const team of allTeams) {
    const roster = await service.getTeamRoster(team.id);
    if (!roster) continue;
    for (const entry of roster.depthChart) {
      for (const player of entry.players) {
        if (player.injuryStatus !== "Active") {
          injured.push({ player, team });
        }
      }
    }
  }

  // Group by status
  const groups: Record<string, InjuredPlayer[]> = {
    Out: [],
    IR: [],
    Suspended: [],
    Doubtful: [],
    Questionable: [],
    Holdout: [],
  };

  for (const entry of injured) {
    const status = entry.player.injuryStatus;
    if (groups[status]) {
      groups[status].push(entry);
    }
  }

  // Sort each group: starters first, then by team
  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => {
      if (a.player.depthOrder !== b.player.depthOrder) return a.player.depthOrder - b.player.depthOrder;
      return a.team.fullName.localeCompare(b.team.fullName);
    });
  }

  const starterCount = injured.filter((e) => e.player.depthOrder === 1).length;

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">NFL Injury Report</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {injured.length} players injured across all 32 teams — {starterCount} starters affected.
        </p>
      </div>

      {Object.entries(groups).map(([status, players]) => {
        if (players.length === 0) return null;
        return (
          <div key={status} className="mb-8">
            <div className="mb-3 flex items-center gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                {status} ({players.length})
              </h2>
              <span className="text-[10px] text-text-muted">
                {players.filter((p) => p.player.depthOrder === 1).length} starters
              </span>
            </div>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-bg-card text-[11px] uppercase tracking-wider text-text-muted">
                    <th className="px-3 py-2 text-left font-semibold">Player</th>
                    <th className="px-3 py-2 text-left font-semibold">Pos</th>
                    <th className="px-3 py-2 text-left font-semibold">Team</th>
                    <th className="hidden sm:table-cell px-3 py-2 text-left font-semibold">Depth</th>
                    <th className="hidden sm:table-cell px-3 py-2 text-left font-semibold">Detail</th>
                    <th className="hidden md:table-cell px-3 py-2 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map(({ player, team }) => {
                    const pos = player.position.replace(/\d+$/, "");
                    const depthLabel = player.depthOrder === 1 ? "Starter" : player.depthOrder === 2 ? "2nd" : "3rd+";
                    return (
                      <tr
                        key={player.id}
                        className={`border-b border-border transition-colors hover:bg-bg-card-hover ${
                          player.depthOrder === 1 ? "bg-bg-card" : ""
                        }`}
                      >
                        <td className="px-3 py-2">
                          <Link
                            href={`/player/${player.id}`}
                            className="font-medium text-text-primary hover:underline"
                          >
                            {player.name}
                          </Link>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-text-muted">{pos}</td>
                        <td className="px-3 py-2">
                          <Link
                            href={`/team/${team.id}`}
                            className="text-text-secondary hover:underline"
                          >
                            {team.id}
                          </Link>
                        </td>
                        <td className="hidden sm:table-cell px-3 py-2">
                          <span className={`text-xs ${player.depthOrder === 1 ? "font-semibold text-text-primary" : "text-text-muted"}`}>
                            {depthLabel}
                          </span>
                        </td>
                        <td className="hidden sm:table-cell px-3 py-2 text-xs text-text-muted">
                          {player.injuryDetail ?? "—"}
                        </td>
                        <td className="hidden md:table-cell px-3 py-2">
                          <StatusBadge status={player.injuryStatus} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
