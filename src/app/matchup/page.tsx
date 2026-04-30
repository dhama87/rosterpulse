import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createRosterService } from "@/services/createRosterService";
import { StatusBadge } from "@/components/StatusBadge";
import type { Player, Team, DepthChartEntry } from "@/types";

export const metadata: Metadata = {
  title: "Matchup Preview",
  description:
    "NFL matchup preview with side-by-side depth charts and injury reports. Compare starters head to head.",
  alternates: { canonical: "/matchup" },
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

function DepthRow({
  position,
  player,
  side,
}: {
  position: string;
  player: Player | undefined;
  side: "left" | "right";
}) {
  if (!player) return null;
  const pos = position.replace(/\d+$/, "");
  const isOut = player.injuryStatus === "Out" || player.injuryStatus === "IR" || player.injuryStatus === "Suspended";
  const isQuestionable = player.injuryStatus === "Questionable" || player.injuryStatus === "Doubtful";

  return (
    <div className={`flex items-center gap-2 ${side === "right" ? "flex-row-reverse text-right" : ""}`}>
      <Link
        href={`/player/${player.id}`}
        className={`text-sm hover:underline truncate ${
          isOut ? "text-text-muted line-through" : "text-text-primary"
        }`}
      >
        {player.name}
      </Link>
      {player.experience === 0 && (
        <span className="shrink-0 inline-flex items-center rounded-full bg-status-blue-bg px-1.5 py-0.5 text-[9px] font-bold text-status-blue">
          R
        </span>
      )}
      {(isOut || isQuestionable) && (
        <StatusBadge status={player.injuryStatus} showOnlyIfNotActive />
      )}
    </div>
  );
}

function TeamHeader({ team, injuredStarters, questionable }: { team: Team; injuredStarters: number; questionable: number }) {
  return (
    <div className="flex items-center gap-3">
      <Image src={team.logo} alt={team.name} width={36} height={36} className="h-9 w-9 object-contain" />
      <div>
        <Link href={`/team/${team.id}`} className="text-base font-bold text-text-primary hover:underline">
          {team.fullName}
        </Link>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>{team.record}</span>
          {injuredStarters > 0 && (
            <span className="text-status-red">{injuredStarters} out</span>
          )}
          {questionable > 0 && (
            <span className="text-status-amber">{questionable} questionable</span>
          )}
        </div>
      </div>
    </div>
  );
}

function countInjuries(depthChart: DepthChartEntry[]) {
  let out = 0;
  let questionable = 0;
  for (const entry of depthChart) {
    for (const p of entry.players) {
      if (p.depthOrder !== 1) continue;
      if (p.injuryStatus === "Out" || p.injuryStatus === "IR" || p.injuryStatus === "Suspended") out++;
      else if (p.injuryStatus === "Questionable" || p.injuryStatus === "Doubtful") questionable++;
    }
  }
  return { out, questionable };
}

export default async function MatchupPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { away, home } = await searchParams;
  const awayId = typeof away === "string" ? away : "";
  const homeId = typeof home === "string" ? home : "";

  const service = createRosterService();

  if (!awayId || !homeId) {
    // Show game picker: list this week's games
    const currentWeek = await service.getCurrentWeek();
    const games = await service.getWeekGames(currentWeek);

    return (
      <div className="mx-auto max-w-3xl p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-text-primary">Matchup Preview</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Select a game to see the side-by-side depth chart comparison.
          </p>
        </div>

        {games.length > 0 ? (
          <div className="space-y-2">
            {games.map((game) => (
              <Link
                key={game.id}
                href={`/matchup?away=${game.awayTeam.id}&home=${game.homeTeam.id}`}
                className="flex items-center justify-between rounded-lg border border-border bg-bg-card px-4 py-3 transition-colors hover:bg-bg-card-hover"
              >
                <div className="flex items-center gap-3">
                  <Image src={game.awayTeam.logo} alt={game.awayTeam.name} width={28} height={28} className="h-7 w-7 object-contain" />
                  <span className="text-sm font-medium text-text-primary">{game.awayTeam.name}</span>
                </div>
                <span className="text-xs text-text-muted">@</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-text-primary">{game.homeTeam.name}</span>
                  <Image src={game.homeTeam.logo} alt={game.homeTeam.name} width={28} height={28} className="h-7 w-7 object-contain" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted text-center py-12">No games scheduled this week.</p>
        )}
      </div>
    );
  }

  const [awayRoster, homeRoster] = await Promise.all([
    service.getTeamRoster(awayId),
    service.getTeamRoster(homeId),
  ]);

  if (!awayRoster || !homeRoster) {
    return (
      <div className="mx-auto max-w-3xl p-4 sm:p-6">
        <p className="text-sm text-text-muted text-center py-12">One or both teams not found.</p>
      </div>
    );
  }

  const awayInjuries = countInjuries(awayRoster.depthChart);
  const homeInjuries = countInjuries(homeRoster.depthChart);

  // Group positions by side: offense, defense, special teams
  const groups = ["offense", "defense", "specialTeams"] as const;
  const groupLabels = { offense: "Offense", defense: "Defense", specialTeams: "Special Teams" };

  // Build position map for each team
  function buildStarterMap(depthChart: DepthChartEntry[]) {
    const map = new Map<string, Player>();
    for (const entry of depthChart) {
      const starter = entry.players.find((p) => p.depthOrder === 1);
      if (starter) map.set(entry.position, starter);
    }
    return map;
  }

  const awayStarters = buildStarterMap(awayRoster.depthChart);
  const homeStarters = buildStarterMap(homeRoster.depthChart);

  // Get all unique positions per group
  const awayDC = awayRoster.depthChart;
  const homeDC = homeRoster.depthChart;
  function getPositionsForGroup(group: string) {
    const positions = new Set<string>();
    for (const entry of awayDC) {
      if (entry.positionGroup === group) positions.add(entry.position);
    }
    for (const entry of homeDC) {
      if (entry.positionGroup === group) positions.add(entry.position);
    }
    return [...positions].sort();
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      {/* Team headers */}
      <div className="flex items-start justify-between mb-6">
        <TeamHeader team={awayRoster.team} injuredStarters={awayInjuries.out} questionable={awayInjuries.questionable} />
        <div className="flex flex-col items-center px-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">vs</span>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-3 flex-row-reverse">
            <Image src={homeRoster.team.logo} alt={homeRoster.team.name} width={36} height={36} className="h-9 w-9 object-contain" />
            <div>
              <Link href={`/team/${homeId}`} className="text-base font-bold text-text-primary hover:underline">
                {homeRoster.team.fullName}
              </Link>
              <div className="flex items-center justify-end gap-2 text-xs text-text-muted">
                <span>{homeRoster.team.record}</span>
                {homeInjuries.out > 0 && (
                  <span className="text-status-red">{homeInjuries.out} out</span>
                )}
                {homeInjuries.questionable > 0 && (
                  <span className="text-status-amber">{homeInjuries.questionable} questionable</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Depth chart comparison */}
      {groups.map((group) => {
        const positions = getPositionsForGroup(group);
        if (positions.length === 0) return null;

        return (
          <div key={group} className="mb-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
              {groupLabels[group]}
            </h2>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-bg-card text-[11px] uppercase tracking-wider text-text-muted">
                    <th className="px-3 py-2 text-left font-semibold w-[40%]">{awayRoster.team.id}</th>
                    <th className="px-3 py-2 text-center font-semibold w-[20%]">Pos</th>
                    <th className="px-3 py-2 text-right font-semibold w-[40%]">{homeRoster.team.id}</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos) => {
                    const displayPos = pos.replace(/\d+$/, "");
                    return (
                      <tr key={pos} className="border-b border-border transition-colors hover:bg-bg-card-hover">
                        <td className="px-3 py-2">
                          <DepthRow position={pos} player={awayStarters.get(pos)} side="left" />
                        </td>
                        <td className="px-3 py-2 text-center font-mono text-xs text-text-muted">
                          {displayPos}
                        </td>
                        <td className="px-3 py-2">
                          <DepthRow position={pos} player={homeStarters.get(pos)} side="right" />
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
