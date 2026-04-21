import type { Game, PlayoffScenario, Team } from "@/types";

const PLAYOFF_SPOTS_PER_CONFERENCE = 7;

interface TeamStanding {
  team: Team;
  wins: number;
  losses: number;
  remainingGames: Game[];
  maxPossibleWins: number;
}

function parseRecord(record: string): { wins: number; losses: number } {
  const parts = record.split("-").map(Number);
  return { wins: parts[0] ?? 0, losses: parts[1] ?? 0 };
}

function getConferenceStandings(
  teams: Team[],
  allGames: Game[],
  conference: "AFC" | "NFC"
): TeamStanding[] {
  const confTeams = teams.filter((t) => t.conference === conference);

  return confTeams.map((team) => {
    const { wins, losses } = parseRecord(team.record);
    const remainingGames = allGames.filter(
      (g) =>
        g.status !== "final" &&
        (g.awayTeam.id === team.id || g.homeTeam.id === team.id)
    );
    const maxPossibleWins = wins + remainingGames.length;

    return { team, wins, losses, remainingGames, maxPossibleWins };
  });
}

function isEliminated(standing: TeamStanding, allStandings: TeamStanding[]): boolean {
  // A team is eliminated if even with max wins, they can't make the top 7
  const otherTeams = allStandings
    .filter((s) => s.team.id !== standing.team.id)
    .map((s) => s.wins) // current wins (minimum they'll finish with)
    .sort((a, b) => b - a);

  // Need to beat at least the 7th-best team's current wins
  const seventhBestCurrentWins = otherTeams[PLAYOFF_SPOTS_PER_CONFERENCE - 1] ?? 0;

  return standing.maxPossibleWins < seventhBestCurrentWins;
}

function hasClinched(standing: TeamStanding, allStandings: TeamStanding[]): boolean {
  // A team has clinched if even with no more wins, they're guaranteed top 7
  const otherTeams = allStandings
    .filter((s) => s.team.id !== standing.team.id)
    .map((s) => s.maxPossibleWins)
    .sort((a, b) => b - a);

  // If only 6 other teams can possibly finish above us, we've clinched
  const teamsWhoCanFinishAbove = otherTeams.filter(
    (maxWins) => maxWins > standing.wins
  );

  return teamsWhoCanFinishAbove.length < PLAYOFF_SPOTS_PER_CONFERENCE;
}

function hasClinchDivision(
  standing: TeamStanding,
  allStandings: TeamStanding[],
  teams: Team[]
): boolean {
  const divTeams = allStandings.filter(
    (s) =>
      s.team.id !== standing.team.id &&
      s.team.division === standing.team.division
  );

  // Clinched division if no other division team can match our current wins
  return divTeams.every((s) => s.maxPossibleWins < standing.wins);
}

function buildScenarioText(
  standing: TeamStanding,
  allStandings: TeamStanding[],
  status: PlayoffScenario["status"]
): string {
  if (status === "clinched_division") {
    return `Clinched ${standing.team.conference} ${standing.team.division}`;
  }
  if (status === "clinched_playoff") {
    return "Clinched playoff spot";
  }
  if (status === "eliminated") {
    return "Eliminated from playoff contention";
  }

  // "in_hunt" — compute what they need
  const remainingCount = standing.remainingGames.length;

  if (remainingCount === 0) {
    return "Season complete — waiting on tiebreakers";
  }

  // Check if they control their own destiny (win out = clinch)
  const winsIfWinOut = standing.wins + remainingCount;
  const teamsWhoCouldStillFinishAbove = allStandings
    .filter((s) => s.team.id !== standing.team.id)
    .filter((s) => s.maxPossibleWins >= winsIfWinOut);

  if (teamsWhoCouldStillFinishAbove.length < PLAYOFF_SPOTS_PER_CONFERENCE) {
    if (remainingCount === 1) {
      return "Win to clinch a playoff spot";
    }
    return "Control their own destiny — win out to clinch";
  }

  // They need help — find which teams' losses matter
  // Teams currently ahead whose losses would help
  const teamsAhead = allStandings
    .filter(
      (s) => s.team.id !== standing.team.id && s.wins >= standing.wins
    )
    .sort((a, b) => b.wins - a.wins);

  const mustWinRemaining = remainingCount <= 3;

  if (teamsAhead.length > 0) {
    const relevantTeams = teamsAhead
      .slice(0, 3)
      .map((s) => s.team.id);

    if (mustWinRemaining && relevantTeams.length > 0) {
      const neededLosses = relevantTeams.map((id) => `${id} loss`).join(", ");
      return `Must win${remainingCount > 1 ? " out" : ""} + need: ${neededLosses}`;
    }

    if (relevantTeams.length === 1) {
      return `Need to win + ${relevantTeams[0]} loss (may depend on tiebreakers)`;
    }

    return `Need wins + help from ${relevantTeams.length} teams' losses (may depend on tiebreakers)`;
  }

  return "In the hunt — scenario depends on remaining results";
}

export function computePlayoffScenarios(
  teams: Team[],
  allGames: Game[]
): PlayoffScenario[] {
  const scenarios: PlayoffScenario[] = [];

  for (const conference of ["AFC", "NFC"] as const) {
    const standings = getConferenceStandings(teams, allGames, conference);

    // Sort by wins descending for seeding
    const sorted = [...standings].sort((a, b) => b.wins - a.wins);

    for (const standing of standings) {
      let status: PlayoffScenario["status"];
      const eliminated = isEliminated(standing, standings);
      const clinched = hasClinched(standing, standings);
      const clinchDiv = hasClinchDivision(standing, standings, teams);

      if (clinchDiv) {
        status = "clinched_division";
      } else if (clinched) {
        status = "clinched_playoff";
      } else if (eliminated) {
        status = "eliminated";
      } else {
        status = "in_hunt";
      }

      // Compute seed (current position in conference)
      const seed = sorted.findIndex((s) => s.team.id === standing.team.id) + 1;

      // Does this team MUST win their next game?
      const mustWin =
        status === "in_hunt" &&
        standing.remainingGames.length <= 3 &&
        !clinched;

      const scenarioText = buildScenarioText(standing, standings, status);

      // Find relevant games for this team
      const relevantGames =
        status === "in_hunt"
          ? standings
              .filter(
                (s) =>
                  s.team.id !== standing.team.id &&
                  s.wins >= standing.wins
              )
              .flatMap((s) =>
                s.remainingGames.map(
                  (g) => `${g.awayTeam.id}@${g.homeTeam.id}`
                )
              )
              .slice(0, 5)
          : undefined;

      scenarios.push({
        teamId: standing.team.id,
        status,
        seed: seed <= PLAYOFF_SPOTS_PER_CONFERENCE ? seed : undefined,
        scenarioText,
        mustWin,
        relevantGames,
      });
    }
  }

  return scenarios;
}
