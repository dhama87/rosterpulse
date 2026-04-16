import Database from "better-sqlite3";
import { createTables } from "@/db/schema";
import { runScrape } from "../orchestrator";
import type { ScrapedItem, SourceAdapter } from "../types";

// --- Helpers ---

function makeNewsItem(
  headline: string,
  source: string,
  confidence: "reported" | "official" = "reported"
): ScrapedItem {
  return {
    type: "news",
    sourceAdapter: source.toLowerCase().replace(/\s+/g, "-"),
    source,
    sourceUrl: `https://${source.toLowerCase()}.com/news`,
    confidence,
    fetchedAt: new Date().toISOString(),
    rawData: {
      playerId: "KC-QB-1",
      playerName: "Patrick Mahomes",
      team: "KC",
      position: "QB",
      category: "INJURY",
      headline,
      description: `Description for: ${headline}`,
      timestamp: new Date().toISOString(),
    },
  };
}

class MockAdapter implements SourceAdapter {
  name: string;
  private items: ScrapedItem[];

  constructor(name: string, items: ScrapedItem[]) {
    this.name = name;
    this.items = items;
  }

  async fetch(): Promise<ScrapedItem[]> {
    return this.items;
  }
}

class FailingAdapter implements SourceAdapter {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  async fetch(): Promise<ScrapedItem[]> {
    throw new Error(`${this.name} fetch failed`);
  }
}

// --- Tests ---

describe("runScrape", () => {
  let db: InstanceType<typeof Database>;

  beforeEach(() => {
    db = new Database(":memory:");
    createTables(db);
  });

  afterEach(() => {
    db.close();
  });

  it("runs adapters and stores news items in DB", async () => {
    const item = makeNewsItem("Mahomes limited in practice", "ESPN");
    const adapter = new MockAdapter("espn-rss", [item]);

    const result = await runScrape(db, [adapter]);

    expect(result.totalItems).toBe(1);
    expect(result.adapterResults).toHaveLength(1);
    expect(result.adapterResults[0].status).toBe("success");
    expect(result.adapterResults[0].adapter).toBe("espn-rss");

    const rows = db.prepare("SELECT * FROM news").all();
    expect(rows).toHaveLength(1);
  });

  it("handles adapter failures gracefully", async () => {
    const item = makeNewsItem("Good news item", "ESPN");
    const goodAdapter = new MockAdapter("good-adapter", [item]);
    const badAdapter = new FailingAdapter("bad-adapter");

    const result = await runScrape(db, [goodAdapter, badAdapter]);

    expect(result.adapterResults).toHaveLength(2);

    const goodResult = result.adapterResults.find(
      (r) => r.adapter === "good-adapter"
    );
    const badResult = result.adapterResults.find(
      (r) => r.adapter === "bad-adapter"
    );

    expect(goodResult?.status).toBe("success");
    expect(badResult?.status).toBe("error");
    expect(badResult?.errorMessage).toBeTruthy();

    const rows = db.prepare("SELECT * FROM news").all();
    expect(rows).toHaveLength(1);
  });

  it("deduplicates news items with same headline and source", async () => {
    const headline = "Mahomes limited in practice";
    const item = makeNewsItem(headline, "ESPN");
    const adapter = new MockAdapter("espn-rss", [item]);

    await runScrape(db, [adapter]);
    await runScrape(db, [adapter]);

    const rows = db.prepare("SELECT * FROM news").all();
    expect(rows).toHaveLength(1);
  });

  it("logs scrape results to scrape_log", async () => {
    const item = makeNewsItem("Some headline", "ESPN");
    const adapter = new MockAdapter("espn-rss", [item]);

    await runScrape(db, [adapter]);

    const logs = db.prepare("SELECT * FROM scrape_log").all() as Array<{
      adapter: string;
      status: string;
      itemsFound: number;
    }>;
    expect(logs).toHaveLength(1);
    expect(logs[0].adapter).toBe("espn-rss");
    expect(logs[0].status).toBe("success");
    expect(logs[0].itemsFound).toBe(1);
  });

  it("upgrades confidence from reported to official", async () => {
    const headline = "Mahomes ruled out for Sunday";

    const espnItem = makeNewsItem(headline, "ESPN", "reported");
    const nflItem = makeNewsItem(headline, "NFL.com", "official");

    // First run: ESPN (reported)
    const espnAdapter = new MockAdapter("espn-rss", [espnItem]);
    await runScrape(db, [espnAdapter]);

    // Second run: NFL.com (official) — same headline, different source
    // The dedup key is based on source+headline, so this would be a different key.
    // Per spec: upgrade happens when same dedupKey exists and new confidence is official.
    // To test upgrade we need the same source+headline combo, just with new confidence.
    // We'll use the same source ("ESPN") but official confidence for the upgrade test.
    const espnOfficialItem = makeNewsItem(headline, "ESPN", "official");
    const officialAdapter = new MockAdapter("espn-official", [espnOfficialItem]);
    await runScrape(db, [officialAdapter]);

    const rows = db.prepare("SELECT confidence FROM news WHERE headline = ?").all(
      headline
    ) as Array<{ confidence: string }>;
    expect(rows).toHaveLength(1);
    expect(rows[0].confidence).toBe("official");
  });
});
