import { XMLParser } from "fast-xml-parser";
import { ScrapedItem, SourceAdapter } from "../types";

const RSS_URL = "https://www.nbcsports.com/nfl/rss/player-news";

export class RotoworldRssAdapter implements SourceAdapter {
  name = "rotoworld-rss";

  async fetch(): Promise<ScrapedItem[]> {
    try {
      const response = await globalThis.fetch(RSS_URL, {
        signal: AbortSignal.timeout(30_000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const xml = await response.text();

      const parser = new XMLParser();
      const parsed = parser.parse(xml);

      const rawItems = parsed?.rss?.channel?.item ?? [];
      const items: unknown[] = Array.isArray(rawItems) ? rawItems : [rawItems];

      const fetchedAt = new Date().toISOString();

      return items.map((item) => {
        const i = item as Record<string, unknown>;
        const pubDate = i.pubDate as string | undefined;
        const timestamp = pubDate ? new Date(pubDate).toISOString() : fetchedAt;

        return {
          type: "news" as const,
          sourceAdapter: this.name,
          source: "Rotoworld",
          sourceUrl: (i.link as string) ?? RSS_URL,
          confidence: "reported" as const,
          fetchedAt,
          rawData: {
            headline: (i.title as string) ?? "",
            description: (i.description as string) ?? "",
            timestamp,
            playerId: "",
            playerName: "",
            team: "",
            position: "",
            category: "INJURY",
          },
        };
      });
    } catch (err) {
      console.error("[RotoworldRssAdapter] fetch error:", err);
      return [];
    }
  }
}
