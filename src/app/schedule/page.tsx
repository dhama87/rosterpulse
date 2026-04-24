import type { Metadata } from "next";
import { createRosterService } from "@/services/createRosterService";

export const metadata: Metadata = {
  title: "NFL Schedule & Scores",
  description:
    "NFL weekly schedule with scores, injury reports, and playoff picture. Track every game, every week.",
  openGraph: {
    title: "NFL Schedule & Scores | RosterPulse",
    description: "NFL weekly schedule with scores, injury reports, and playoff picture.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "NFL Schedule & Scores | RosterPulse",
    description: "NFL weekly schedule with scores, injury reports, and playoff picture.",
  },
  alternates: { canonical: "/schedule" },
};
import { ScheduleGrid } from "@/components/ScheduleGrid";
import { PlayoffPicture } from "@/components/PlayoffPicture";
import { NewsFeed } from "@/components/NewsFeed";
import { MobileNewsToggle } from "@/components/MobileNewsToggle";
import { computePlayoffScenarios } from "@/services/playoffEngine";
import type { Game, PlayoffScenario } from "@/types";

export const dynamic = "force-dynamic";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { week: weekParam } = await searchParams;
  const service = createRosterService();

  const currentWeek = await service.getCurrentWeek();
  const maxWeek = 23; // 18 regular + 5 postseason (22=Pro Bowl skipped in UI)
  const week =
    typeof weekParam === "string" ? Math.max(1, Math.min(maxWeek, parseInt(weekParam, 10) || currentWeek)) : currentWeek;

  // Determine season year from game dates (September start = that year's season)
  // Default to current year - 1 for offseason (NFL season spans two calendar years)
  const now = new Date();
  const seasonYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;

  const [games, allNews] = await Promise.all([
    service.getWeekGames(week),
    service.getAllNews({ limit: 30 }),
  ]);

  // Compute bye teams for this week
  const allTeams = service.getAllTeams();
  const teamsPlaying = new Set<string>();
  for (const game of games) {
    teamsPlaying.add(game.awayTeam.id);
    teamsPlaying.add(game.homeTeam.id);
  }
  const byeTeams = allTeams
    .filter((t) => !teamsPlaying.has(t.id) && games.length > 0)
    .map((t) => t.fullName);

  // Compute injury map: team → { out, questionable } for starters only
  const injuryMap: Record<string, { out: number; questionable: number }> = {};
  const teamIds = [...teamsPlaying];
  for (const teamId of teamIds) {
    const roster = await service.getTeamRoster(teamId);
    if (!roster) continue;

    let out = 0;
    let questionable = 0;
    for (const entry of roster.depthChart) {
      for (const p of entry.players) {
        if (p.depthOrder !== 1) continue; // starters only
        if (p.injuryStatus === "Out" || p.injuryStatus === "IR" || p.injuryStatus === "Suspended") out++;
        else if (p.injuryStatus === "Questionable" || p.injuryStatus === "Doubtful") questionable++;
      }
    }
    if (out > 0 || questionable > 0) {
      injuryMap[teamId] = { out, questionable };
    }
  }

  // Compute playoff scenarios (only meaningful from week 12+)
  let playoffScenarios: PlayoffScenario[] = [];
  if (week >= 12) {
    const allSeasonGames: Game[] = [];
    for (let w = 1; w <= 18; w++) {
      const weekGames = w === week ? games : await service.getWeekGames(w);
      allSeasonGames.push(...weekGames);
    }
    playoffScenarios = computePlayoffScenarios(allTeams, allSeasonGames);
  }

  return (
    <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-49px)]">
      {/* Schedule Brackets — Left */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <PlayoffPicture
          scenarios={playoffScenarios}
          teams={allTeams}
          currentWeek={week}
        />
        <ScheduleGrid
          games={games}
          week={week}
          maxWeek={maxWeek}
          seasonYear={seasonYear}
          byeTeams={byeTeams}
          injuryMap={injuryMap}
          playoffScenarios={playoffScenarios}
        />
      </div>

      {/* News Feed — Right (hidden on mobile) */}
      <div className="hidden lg:block w-[380px] border-l border-border bg-bg-card">
        <NewsFeed items={allNews} />
      </div>

      {/* Mobile News */}
      <MobileNewsToggle items={allNews} />
    </div>
  );
}
