import { XMLParser } from "fast-xml-parser";
import { SourceAdapter, ScrapedItem } from "../types";

const RSS_URL = "https://www.espn.com/espn/rss/nfl/news";

export class EspnRssAdapter implements SourceAdapter {
  name = "espn-rss";

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
          source: "ESPN",
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
      console.error("[EspnRssAdapter] fetch error:", err);
      return [];
    }
  }
}
