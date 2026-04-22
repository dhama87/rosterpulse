// src/scraper/adapters/tankathon-draft-order.ts
import { SourceAdapter, ScrapedItem } from "../types";
import { getDraftYear } from "../utils/draft-year";

interface ParsedPick {
  pickNumber: number;
  teamId: string;
  round: number;
  tradeNote: string | null;
}

function parsePickRows(html: string): ParsedPick[] {
  const picks: ParsedPick[] = [];
  const rowRegex = /<tr class="pick-row">([\s\S]*?)<\/tr>/g;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const row = rowMatch[1];

    const pickNumMatch = row.match(/<span class="pick-num">(\d+)<\/span>/);
    if (!pickNumMatch) continue;
    const pickNumber = parseInt(pickNumMatch[1], 10);

    const logoMatch = row.match(/logo-thumb"[^>]*src="[^"]*\/nfl\/([a-z]+)\.svg"/);
    if (!logoMatch) continue;
    const originalTeamId = logoMatch[1].toUpperCase();

    const tradeMatch = row.match(/<div class="trade">[\s\S]*?<span class="desktop">([A-Z]+)<\/span>/);

    let teamId: string;
    let tradeNote: string | null;
    if (tradeMatch) {
      teamId = tradeMatch[1];
      tradeNote = `From ${originalTeamId} via trade`;
    } else {
      teamId = originalTeamId;
      tradeNote = null;
    }

    picks.push({ pickNumber, teamId, round: 1, tradeNote });
  }

  return picks;
}

export class TankathonDraftOrderAdapter implements SourceAdapter {
  name = "tankathon-draft-order";

  async fetch(): Promise<ScrapedItem[]> {
    const url = "https://tankathon.com/nfl";
    const now = new Date().toISOString();
    const year = getDraftYear();

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(30_000),
        headers: { "User-Agent": "RosterPulse/1.0" },
      });
      if (!response.ok) return [];

      const html = await response.text();
      const picks = parsePickRows(html);
      if (picks.length === 0) return [];

      return [
        {
          type: "player",
          sourceAdapter: this.name,
          source: "Tankathon",
          sourceUrl: url,
          confidence: "official",
          fetchedAt: now,
          rawData: {
            _draftOrderData: true,
            picks,
            year,
            source: "Tankathon",
          },
        },
      ];
    } catch {
      return [];
    }
  }
}
