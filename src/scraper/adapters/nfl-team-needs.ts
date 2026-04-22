// src/scraper/adapters/nfl-team-needs.ts
import { SourceAdapter, ScrapedItem } from "../types";

interface ParsedNeed {
  teamId: string;
  position: string;
  priority: number;
}

function parseTeamNeeds(html: string): ParsedNeed[] {
  const needs: ParsedNeed[] = [];
  const seenTeams = new Set<string>();

  // The RSC payload in self.__next_f.push script tags contains escaped JSON.
  // In the raw HTML, quotes are escaped as \" so field names appear as \"cardDescription\"
  // We use \\\" in regex to match a literal \" in the source.
  // Pattern matches cardDescription, teamLogo (for team abbrev), regardless of field order.
  // We extract the full content of each __next_f.push call and look for card objects.
  const scriptContentRegex = /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g;
  let scriptMatch;

  while ((scriptMatch = scriptContentRegex.exec(html)) !== null) {
    const content = scriptMatch[1];

    // Look for cardDescription with NEEDS pattern
    const descMatch = content.match(/\\"cardDescription\\":\\"NEEDS:\s*([^\\]+)\\"/);
    if (!descMatch) continue;

    // Look for teamLogo to extract team abbreviation
    const logoMatch = content.match(/\\"teamLogo\\":\\"[^"]*\/logos\/([A-Z]+)\\"/);
    if (!logoMatch) continue;

    const needsStr = descMatch[1];
    const teamId = logoMatch[1];

    if (seenTeams.has(teamId)) continue;
    seenTeams.add(teamId);

    const positions = needsStr.split(",").map((s) => s.trim());
    for (let i = 0; i < positions.length; i++) {
      needs.push({
        teamId,
        position: positions[i],
        priority: i + 1,
      });
    }
  }

  return needs;
}

export class NflTeamNeedsAdapter implements SourceAdapter {
  name = "nfl-team-needs";

  async fetch(): Promise<ScrapedItem[]> {
    const url = "https://www.nfl.com/draft/";
    const now = new Date().toISOString();

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(30_000),
        headers: { "User-Agent": "RosterPulse/1.0" },
      });
      if (!response.ok) return [];

      const html = await response.text();
      const needs = parseTeamNeeds(html);
      if (needs.length === 0) return [];

      return [
        {
          type: "player",
          sourceAdapter: this.name,
          source: "NFL.com",
          sourceUrl: url,
          confidence: "reported",
          fetchedAt: now,
          rawData: {
            _teamNeedsData: true,
            needs,
            source: "NFL.com",
          },
        },
      ];
    } catch {
      return [];
    }
  }
}
