// src/scraper/adapters/tankathon-prospects.ts
import { SourceAdapter, ScrapedItem } from "../types";

interface ParsedProspect {
  rank: number;
  name: string;
  position: string;
  college: string;
}

function parseProspects(html: string): ParsedProspect[] {
  const prospects: ParsedProspect[] = [];

  // Split by each mock-row opening tag to extract position and row content
  const parts = html.split(/<div class="mock-row nfl" data-pos="([^"]+)">/);
  // parts layout: [before, pos1, content1, pos2, content2, ...]

  for (let i = 1; i < parts.length; i += 2) {
    const position = parts[i];
    const chunk = parts[i + 1] ?? "";

    const rankMatch = chunk.match(/<div class="mock-row-pick-number">(\d+)<\/div>/);
    if (!rankMatch) continue;
    const rank = parseInt(rankMatch[1], 10);

    const nameMatch = chunk.match(/<div class="mock-row-name">([^<]+)<\/div>/);
    if (!nameMatch) continue;
    const name = nameMatch[1].trim();

    const schoolMatch = chunk.match(/<div class="mock-row-school-position">[^|]+\|\s*([^<]+)<\/div>/);
    const college = schoolMatch ? schoolMatch[1].trim() : "";

    prospects.push({ rank, name, position, college });
  }

  return prospects;
}

export class TankathonProspectsAdapter implements SourceAdapter {
  name = "tankathon-prospects";

  async fetch(): Promise<ScrapedItem[]> {
    const url = "https://tankathon.com/nfl/big_board";
    const now = new Date().toISOString();

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(30_000),
        headers: { "User-Agent": "RosterPulse/1.0" },
      });
      if (!response.ok) return [];

      const html = await response.text();
      const prospects = parseProspects(html);
      if (prospects.length === 0) return [];

      return [
        {
          type: "player",
          sourceAdapter: this.name,
          source: "Tankathon Consensus Board",
          sourceUrl: url,
          confidence: "reported",
          fetchedAt: now,
          rawData: {
            _prospectData: true,
            prospects,
            source: "Tankathon Consensus Board",
          },
        },
      ];
    } catch {
      return [];
    }
  }
}
