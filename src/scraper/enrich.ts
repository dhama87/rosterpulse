import type { Client } from "@libsql/client";
import { teams } from "@/data/teams";
import type { ScrapedItem } from "./types";

type NewsCategory =
  | "INJURY"
  | "TRADE"
  | "SIGNING"
  | "IR"
  | "DEPTH_CHART"
  | "SUSPENSION"
  | "RETURN";

interface PlayerRecord {
  id: string;
  name: string;
  team: string;
  position: string;
}

// Category keyword lists in priority order
const CATEGORY_RULES: Array<{ category: NewsCategory; keywords: string[] }> = [
  {
    category: "IR",
    keywords: [
      "injured reserve",
      "placed on ir",
      "designated for return",
    ],
  },
  {
    category: "SUSPENSION",
    keywords: ["suspend", "suspended", "suspension", "banned", "ban"],
  },
  {
    category: "INJURY",
    keywords: [
      "injury",
      "injured",
      "hurt",
      "questionable",
      "doubtful",
      "out for",
      "limited",
      "dnp",
      "hamstring",
      "knee",
      "ankle",
      "shoulder",
      "concussion",
      "acl",
      "mcl",
      "torn",
    ],
  },
  {
    category: "TRADE",
    keywords: [
      "trade",
      "traded",
      "swap",
      "acquire",
      "acquired",
    ],
  },
  {
    category: "SIGNING",
    keywords: [
      "sign",
      "signed",
      "signing",
      "contract",
      "free agent",
      "agree",
    ],
  },
  {
    category: "RETURN",
    keywords: [
      "activated",
      "cleared to play",
      "reinstated",
      "back from",
      "return from",
      "returns to practice",
      "returns to lineup",
    ],
  },
  {
    category: "DEPTH_CHART",
    keywords: [
      "starter",
      "starting",
      "promote",
      "promoted",
      "demote",
      "demoted",
      "depth chart",
      "named starter",
    ],
  },
];

function detectCategory(text: string): NewsCategory | null {
  const lower = text.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) {
        return rule.category;
      }
    }
  }
  return null;
}

function buildTeamLookups(): {
  nameMap: Map<string, string>;
  patterns: Array<{ regex: RegExp; teamId: string }>;
} {
  const nameMap = new Map<string, string>();
  const patterns: Array<{ regex: RegExp; teamId: string }> = [];

  for (const team of teams) {
    nameMap.set(team.fullName.toLowerCase(), team.id);
    nameMap.set(team.name.toLowerCase(), team.id);

    patterns.push({
      regex: new RegExp(`\\b${team.id}\\b`, "i"),
      teamId: team.id,
    });
  }

  return { nameMap, patterns };
}

function findTeamInText(
  text: string,
  nameMap: Map<string, string>,
  patterns: Array<{ regex: RegExp; teamId: string }>
): string | null {
  const lower = text.toLowerCase();

  const sortedKeys = [...nameMap.keys()].sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (lower.includes(key)) {
      return nameMap.get(key)!;
    }
  }

  for (const { regex, teamId } of patterns) {
    if (regex.test(text)) {
      return teamId;
    }
  }

  return null;
}

export async function enrichNewsItems(
  items: ScrapedItem[],
  db: Client
): Promise<ScrapedItem[]> {
  // Step 1: Load lookup data
  const result = await db.execute(
    "SELECT id, name, team, position FROM players"
  );

  const playerMap = new Map<string, PlayerRecord>();
  for (const row of result.rows) {
    const record: PlayerRecord = {
      id: row.id as string,
      name: row.name as string,
      team: row.team as string,
      position: row.position as string,
    };
    playerMap.set(record.name.toLowerCase(), record);
  }

  const { nameMap, patterns } = buildTeamLookups();

  const sortedPlayerNames = [...playerMap.keys()].sort(
    (a, b) => b.length - a.length
  );

  // Step 2 & 3: Enrich and filter
  const enriched: ScrapedItem[] = [];

  for (const item of items) {
    const rd = item.rawData;
    const headline = (rd.headline as string) ?? "";
    const description = (rd.description as string) ?? "";
    const searchText = `${headline} ${description}`;
    const lowerSearch = searchText.toLowerCase();

    const alreadyHasTeam =
      typeof rd.team === "string" && rd.team.length > 0;
    const alreadyHasPlayer =
      typeof rd.playerId === "string" && rd.playerId.length > 0;

    if (alreadyHasTeam || alreadyHasPlayer) {
      const category = detectCategory(searchText);
      const newRawData: Record<string, unknown> = { ...rd };
      if (category !== null && !rd.category) {
        newRawData.category = category;
      }
      enriched.push({ ...item, rawData: newRawData });
      continue;
    }

    const category = detectCategory(searchText);

    let foundPlayer: PlayerRecord | null = null;
    let foundTeam: string | null = null;

    for (const lowerName of sortedPlayerNames) {
      if (lowerSearch.includes(lowerName)) {
        foundPlayer = playerMap.get(lowerName)!;
        break;
      }
    }

    if (foundPlayer) {
      foundTeam = foundPlayer.team;
    } else {
      foundTeam = findTeamInText(headline, nameMap, patterns);

      if (foundTeam && category === null) {
        continue;
      }
    }

    if (!foundPlayer && !foundTeam) {
      continue;
    }

    const newRawData: Record<string, unknown> = { ...rd };

    if (foundPlayer) {
      newRawData.playerId = foundPlayer.id;
      newRawData.playerName = foundPlayer.name;
      newRawData.team = foundPlayer.team;
      newRawData.position = foundPlayer.position;
    } else if (foundTeam) {
      newRawData.team = foundTeam;
    }

    if (category !== null) {
      newRawData.category = category;
    }

    enriched.push({ ...item, rawData: newRawData });
  }

  return enriched;
}
