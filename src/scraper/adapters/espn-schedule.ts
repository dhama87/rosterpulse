import { SourceAdapter, ScrapedItem } from "../types";

// Reuse ESPN team ID mapping — maps our abbreviations to ESPN numeric IDs
const ESPN_TEAM_IDS: Record<string, string> = {
  ARI: "22", ATL: "1", BAL: "33", BUF: "2", CAR: "29", CHI: "3",
  CIN: "4", CLE: "5", DAL: "6", DEN: "7", DET: "8", GB: "9",
  HOU: "34", IND: "11", JAX: "30", KC: "12", LV: "13", LAC: "24",
  LAR: "14", MIA: "15", MIN: "16", NE: "17", NO: "18", NYG: "19",
  NYJ: "20", PHI: "21", PIT: "23", SF: "25", SEA: "26", TB: "27",
  TEN: "10", WAS: "28",
};

// Reverse map: ESPN numeric ID → our abbreviation
const ESPN_ID_TO_ABBREV: Record<string, string> = {};
for (const [abbrev, id] of Object.entries(ESPN_TEAM_IDS)) {
  ESPN_ID_TO_ABBREV[id] = abbrev;
}

interface EspnCompetitor {
  id: string;
  homeAway: "home" | "away";
  team: { id: string; abbreviation: string };
  score?: string;
}

interface EspnCompetition {
  id: string;
  date: string;
  status: { type: { name: string } };
  competitors: EspnCompetitor[];
  broadcasts?: Array<{ names: string[] }>;
}

interface EspnEvent {
  id: string;
  date: string;
  competitions: EspnCompetition[];
  week: { number: number };
  season: { type: number }; // 2 = regular, 3 = postseason
}

interface EspnScoreboardResponse {
  events: EspnEvent[];
  week?: { number: number };
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(30_000),
      headers: { "User-Agent": "RosterPulse/1.0" },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function mapStatus(espnStatus: string): "scheduled" | "in_progress" | "final" {
  switch (espnStatus) {
    case "STATUS_FINAL":
    case "STATUS_FINAL_OVERTIME":
      return "final";
    case "STATUS_IN_PROGRESS":
    case "STATUS_HALFTIME":
    case "STATUS_END_PERIOD":
      return "in_progress";
    default:
      return "scheduled";
  }
}

export class EspnScheduleAdapter implements SourceAdapter {
  name = "espn-schedule";
  private weeks: number[];

  /**
   * @param weeks - Which weeks to fetch. Defaults to all 18 regular season weeks.
   */
  constructor(weeks?: number[]) {
    this.weeks = weeks ?? Array.from({ length: 18 }, (_, i) => i + 1);
  }

  async fetch(): Promise<ScrapedItem[]> {
    const items: ScrapedItem[] = [];
    const now = new Date().toISOString();

    // Fetch each week's scoreboard
    for (const week of this.weeks) {
      const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?week=${week}&seasontype=2`;
      const data = await fetchJson<EspnScoreboardResponse>(url);
      if (!data?.events) continue;

      for (const event of data.events) {
        const comp = event.competitions[0];
        if (!comp) continue;

        const away = comp.competitors.find((c) => c.homeAway === "away");
        const home = comp.competitors.find((c) => c.homeAway === "home");
        if (!away || !home) continue;

        const awayAbbrev = ESPN_ID_TO_ABBREV[away.team.id] ?? away.team.abbreviation;
        const homeAbbrev = ESPN_ID_TO_ABBREV[home.team.id] ?? home.team.abbreviation;

        const tvNetwork = comp.broadcasts?.[0]?.names?.[0] ?? null;
        const status = mapStatus(comp.status.type.name);

        const awayScore = away.score != null ? parseInt(away.score, 10) : null;
        const homeScore = home.score != null ? parseInt(home.score, 10) : null;

        items.push({
          type: "player", // reuse "player" type for DB insertion via orchestrator
          sourceAdapter: this.name,
          source: "espn",
          sourceUrl: `https://www.espn.com/nfl/game/_/gameId/${event.id}`,
          confidence: "official",
          fetchedAt: now,
          rawData: {
            _gameData: true, // flag to distinguish from player items
            id: `2026-W${String(week).padStart(2, "0")}-${awayAbbrev}-${homeAbbrev}`,
            week,
            seasonType: "regular",
            awayTeam: awayAbbrev,
            homeTeam: homeAbbrev,
            gameTime: comp.date,
            tvNetwork,
            awayScore: status === "final" ? awayScore : null,
            homeScore: status === "final" ? homeScore : null,
            status,
          },
        });
      }
    }

    return items;
  }
}
