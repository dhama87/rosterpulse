import { XMLParser } from "fast-xml-parser";
import { SourceAdapter, ScrapedItem } from "../types";

const RSS_URL = "https://www.nfl.com/rss/rsslanding?searchString=transactions";

export class NflTransactionsAdapter implements SourceAdapter {
  name = "nfl-transactions";

  async fetch(): Promise<ScrapedItem[]> {
    try {
      const response = await global.fetch(RSS_URL, {
        signal: AbortSignal.timeout(30_000),
      });

      const xml = await response.text();

      const parser = new XMLParser();
      const parsed = parser.parse(xml);

      const rawItems = parsed?.rss?.channel?.item;
      if (!rawItems) return [];

      const items = Array.isArray(rawItems) ? rawItems : [rawItems];

      const fetchedAt = new Date().toISOString();

      return items.map((item: Record<string, unknown>) => {
        const pubDate = item.pubDate as string | undefined;
        const timestamp = pubDate ? new Date(pubDate).toISOString() : fetchedAt;

        return {
          type: "news" as const,
          sourceAdapter: this.name,
          source: "NFL.com",
          sourceUrl: (item.link as string) ?? RSS_URL,
          confidence: "official" as const,
          rawData: {
            headline: (item.title as string) ?? "",
            description: (item.description as string) ?? "",
            timestamp,
            playerId: "",
            playerName: "",
            team: "",
            position: "",
            category: "SIGNING",
          },
          fetchedAt,
        };
      });
    } catch {
      return [];
    }
  }
}
