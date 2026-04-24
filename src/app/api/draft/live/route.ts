import { NextResponse } from "next/server";
import { createRosterService } from "@/services/createRosterService";
import type { DraftPick, DraftLiveResponse } from "@/types";

export const dynamic = "force-dynamic";

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

interface EspnDraftResponse {
  rounds: { number: number; picks: EspnDraftPick[] }[];
}

async function fetchEspnDraftLive(year: number): Promise<DraftPick[]> {
  const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/draft?year=${year}`;
  const res = await fetch(url, {
    signal: AbortSignal.timeout(10_000),
    headers: { "User-Agent": "RosterPulse/1.0" },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as EspnDraftResponse;
  if (!data.rounds) return [];

  const now = new Date().toISOString();
  const picks: DraftPick[] = [];

  for (const round of data.rounds) {
    for (const pick of round.picks) {
      if (!pick.athlete) continue;
      const teamAbbrev = ESPN_ID_TO_ABBREV[pick.team.id] ?? pick.team.abbreviation;
      picks.push({
        id: `${year}-R${pick.round.number}-P${pick.overall}`,
        year,
        round: pick.round.number,
        pickNumber: pick.overall,
        teamId: teamAbbrev,
        playerName: pick.athlete.displayName,
        position: pick.athlete.position.abbreviation,
        college: pick.athlete.college?.name ?? "",
        isTradeUp: pick.tradedFrom != null,
        tradeNote: pick.tradeNote ?? null,
        timestamp: now,
      });
    }
  }

  return picks;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const since = searchParams.get("since");

  const service = createRosterService();
  const meta = await service.getDraftMeta();
  const year = parseInt(meta.draftYear ?? "2026", 10);

  // Check if draft is currently active
  const draftDates = JSON.parse(meta.draftDates ?? "[]") as string[];
  const now = new Date();
  const isActive = draftDates.some((dateStr) => {
    const start = new Date(dateStr);
    const end = new Date(start.getTime() + 12 * 60 * 60 * 1000);
    return now >= start && now <= end;
  });

  let filledPicks: DraftPick[];
  let allPicks: DraftPick[];

  if (isActive) {
    // During live draft: fetch directly from ESPN API for real-time picks
    const espnPicks = await fetchEspnDraftLive(year);
    filledPicks = espnPicks;
    // Merge with DB picks for unfilled draft order context
    allPicks = await service.getDraftPicks(year);
    // Replace DB filled picks with ESPN's fresher data
    const espnPickNumbers = new Set(espnPicks.map((p) => p.pickNumber));
    allPicks = [
      ...espnPicks,
      ...allPicks.filter((p) => p.playerName === "" && !espnPickNumbers.has(p.pickNumber)),
    ].sort((a, b) => a.pickNumber - b.pickNumber);
  } else {
    // Outside draft: read from database as before
    allPicks = await service.getDraftPicks(year);
    filledPicks = allPicks.filter((p) => p.playerName !== "");
  }

  // If `since` param, return only picks after that timestamp
  const newPicks = since
    ? filledPicks.filter((p) => p.timestamp && p.timestamp > since)
    : filledPicks;

  // Determine current pick (next unfilled)
  const nextUnfilled = allPicks.find((p) => p.playerName === "");
  const currentPick = nextUnfilled?.pickNumber ?? filledPicks.length + 1;

  const response: DraftLiveResponse = {
    currentPick,
    onTheClock: nextUnfilled
      ? { teamId: nextUnfilled.teamId, timeRemaining: 0 }
      : null,
    picks: newPicks,
    lastUpdated: now.toISOString(),
    isActive,
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
