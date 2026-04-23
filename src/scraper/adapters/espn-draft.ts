import { SourceAdapter, ScrapedItem } from "../types";
import { getDraftYear } from "../utils/draft-year";

const ESPN_ID_TO_ABBREV: Record<string, string> = {
  "22": "ARI", "1": "ATL", "33": "BAL", "2": "BUF", "29": "CAR", "3": "CHI",
  "4": "CIN", "5": "CLE", "6": "DAL", "7": "DEN", "8": "DET", "9": "GB",
  "34": "HOU", "11": "IND", "30": "JAX", "12": "KC", "13": "LV", "24": "LAC",
  "14": "LAR", "15": "MIA", "16": "MIN", "17": "NE", "18": "NO", "19": "NYG",
  "20": "NYJ", "21": "PHI", "23": "PIT", "25": "SF", "26": "SEA", "27": "TB",
  "10": "TEN", "28": "WAS",
};

interface EspnDraftPick {
  overall: number;
  round: { number: number };
  team: { id: string; abbreviation: string };
  athlete?: {
    displayName: string;
    position: { abbreviation: string };
    college?: { name: string };
  };
  tradedFrom?: { id: string; abbreviation: string } | null;
  tradeNote?: string | null;
}

interface EspnDraftRound {
  number: number;
  picks: EspnDraftPick[];
}

interface EspnDraftResponse {
  rounds: EspnDraftRound[];
}

export class EspnDraftAdapter implements SourceAdapter {
  name = "espn-draft";
  private year: number;

  constructor(year: number = getDraftYear()) {
    this.year = year;
  }

  async fetch(): Promise<ScrapedItem[]> {
    const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/draft?year=${this.year}`;
    const items: ScrapedItem[] = [];
    const now = new Date().toISOString();

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(30_000),
        headers: { "User-Agent": "RosterPulse/1.0" },
      });
      if (!response.ok) return [];

      const data = (await response.json()) as EspnDraftResponse;
      if (!data.rounds) return [];

      for (const round of data.rounds) {
        for (const pick of round.picks) {
          if (!pick.athlete) continue;

          const teamAbbrev = ESPN_ID_TO_ABBREV[pick.team.id] ?? pick.team.abbreviation;
          const isTradeUp = pick.tradedFrom != null;

          items.push({
            type: "player",
            sourceAdapter: this.name,
            source: "espn",
            sourceUrl: `https://www.espn.com/nfl/draft/${this.year}`,
            confidence: "official",
            fetchedAt: now,
            rawData: {
              _draftData: true,
              id: `${this.year}-R${pick.round.number}-P${pick.overall}`,
              year: this.year,
              round: pick.round.number,
              pickNumber: pick.overall,
              teamId: teamAbbrev,
              playerName: pick.athlete.displayName,
              position: pick.athlete.position.abbreviation,
              college: pick.athlete.college?.name ?? "",
              isTradeUp: isTradeUp ? 1 : 0,
              tradeNote: pick.tradeNote ?? null,
              timestamp: now,
            },
          });
        }
      }
    } catch {
      return [];
    }

    return items;
  }
}
