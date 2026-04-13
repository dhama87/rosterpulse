import { randomUUID } from "crypto";
import type {
  Player,
  NewsItem,
  PositionGroup,
  InjuryStatus,
  NewsCategory,
} from "@/types";
import type { ScrapedItem } from "./types";

export function normalizeToPlayer(item: ScrapedItem): Player {
  const d = item.rawData;
  return {
    id: (d.id as string) || "",
    name: (d.name as string) || "",
    team: (d.team as string) || "",
    position: (d.position as string) || "",
    positionGroup: (d.positionGroup as PositionGroup) || "offense",
    depthOrder: (d.depthOrder as number) ?? 0,
    jerseyNumber: (d.jerseyNumber as number) ?? 0,
    height: (d.height as string) || "",
    weight: (d.weight as string) || "0",
    age: (d.age as number) ?? 0,
    college: (d.college as string) || "",
    experience: (d.experience as number) ?? 0,
    injuryStatus: (d.injuryStatus as InjuryStatus) || "Active",
    injuryDetail:
      d.injuryDetail !== undefined ? (d.injuryDetail as string) : undefined,
    stats:
      d.stats !== undefined
        ? (d.stats as Record<string, number>)
        : {},
  };
}

export function normalizeToNewsItem(item: ScrapedItem): NewsItem {
  const d = item.rawData;
  return {
    id: d.id !== undefined ? (d.id as string) : randomUUID(),
    playerId: d.playerId as string,
    playerName: d.playerName as string,
    team: d.team as string,
    position: d.position as string,
    category: d.category as NewsCategory,
    headline: d.headline as string,
    description: d.description as string,
    source: item.source,
    sourceUrl: item.sourceUrl,
    confidence: item.confidence,
    timestamp: d.timestamp as string,
  };
}
