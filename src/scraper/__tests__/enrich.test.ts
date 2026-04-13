import Database from "better-sqlite3";
import { createTables } from "@/db/schema";
import { seedFromMock } from "@/db/seed";
import { enrichNewsItems } from "../enrich";
import type { ScrapedItem } from "../types";

function makeNewsItem(
  headline: string,
  description = ""
): ScrapedItem {
  return {
    type: "news",
    sourceAdapter: "espn-rss",
    source: "ESPN",
    sourceUrl: "https://espn.com/nfl/news",
    confidence: "reported",
    fetchedAt: new Date().toISOString(),
    rawData: {
      headline,
      description,
      timestamp: new Date().toISOString(),
    },
  };
}

describe("enrichNewsItems", () => {
  let db: InstanceType<typeof Database>;

  beforeEach(() => {
    db = new Database(":memory:");
    createTables(db);
    seedFromMock(db);
  });

  afterEach(() => {
    db.close();
  });

  it("enriches headline with player name", () => {
    const item = makeNewsItem(
      "Patrick Mahomes questionable with ankle",
      "The Chiefs QB is listed as questionable."
    );

    const result = enrichNewsItems([item], db);

    expect(result).toHaveLength(1);
    expect(result[0].rawData.playerId).toBe("KC-QB-1");
    expect(result[0].rawData.playerName).toBe("Patrick Mahomes");
    expect(result[0].rawData.team).toBe("KC");
    expect(result[0].rawData.position).toBe("QB");
  });

  it("detects injury category from keywords", () => {
    const item = makeNewsItem(
      "Chiefs WR injured in practice",
      "Patrick Mahomes was questionable going into the game."
    );

    const result = enrichNewsItems([item], db);

    expect(result).toHaveLength(1);
    expect(result[0].rawData.category).toBe("INJURY");
  });

  it("detects trade category", () => {
    const item = makeNewsItem(
      "Eagles get Packers WR Wicks for picks in trade",
      "Philadelphia acquired the Green Bay receiver."
    );

    const result = enrichNewsItems([item], db);

    expect(result).toHaveLength(1);
    expect(result[0].rawData.category).toBe("TRADE");
    // Should have matched a team from the headline
    expect(result[0].rawData.team).toBeTruthy();
  });

  it("detects IR category", () => {
    const item = makeNewsItem(
      "Cowboys safety Bell placed on injured reserve",
      "Dallas placed him on IR after the injury."
    );

    const result = enrichNewsItems([item], db);

    expect(result).toHaveLength(1);
    expect(result[0].rawData.category).toBe("IR");
  });

  it("detects suspension category", () => {
    const item = makeNewsItem(
      "Chiefs QB suspended 6 games for violation",
      "Patrick Mahomes was handed a suspension by the league."
    );

    const result = enrichNewsItems([item], db);

    expect(result).toHaveLength(1);
    expect(result[0].rawData.category).toBe("SUSPENSION");
  });

  it("drops items with no player or team match", () => {
    const item = makeNewsItem(
      "How AI is pushing NFL draft preparations",
      "Analysts discuss the role of artificial intelligence in scouting."
    );

    const result = enrichNewsItems([item], db);

    expect(result).toHaveLength(0);
  });

  it("prefers longer player name matches", () => {
    // Insert a player named just "Brown" so both "Brown" and "A.J. Brown" exist
    db.prepare(`
      INSERT OR REPLACE INTO players
        (id, name, team, position, positionGroup, depthOrder, jerseyNumber,
         height, weight, age, college, experience, injuryStatus, stats, updatedAt)
      VALUES
        ('TEST-WR-99', 'Brown', 'DAL', 'WR1', 'offense', 2, 99,
         '6-0', '200', 25, 'Test', 1, 'Active', '{}', '2026-01-01T00:00:00.000Z')
    `).run();

    const item = makeNewsItem(
      "A.J. Brown catches TD pass in Eagles win",
      "The Eagles WR had a great performance."
    );

    const result = enrichNewsItems([item], db);

    expect(result).toHaveLength(1);
    // Should match A.J. Brown (longer), not just "Brown"
    expect(result[0].rawData.playerName).toBe("A.J. Brown");
    expect(result[0].rawData.team).toBe("PHI");
  });

  it("matches team names in headlines with roster-affecting keyword", () => {
    const item = makeNewsItem(
      "Cowboys safety Bell suspended for conduct violation",
      "A Dallas Cowboys player was handed a suspension."
    );

    const result = enrichNewsItems([item], db);

    expect(result).toHaveLength(1);
    expect(result[0].rawData.team).toBe("DAL");
    expect(result[0].rawData.category).toBe("SUSPENSION");
  });

  it("drops team-only matches without roster-affecting keywords", () => {
    const item = makeNewsItem(
      "Cowboys unveil new stadium renovation plans",
      "Dallas ownership announced a major upgrade project."
    );

    const result = enrichNewsItems([item], db);

    expect(result).toHaveLength(0);
  });

  it("returns multiple enriched items when multiple match", () => {
    const items = [
      makeNewsItem(
        "Patrick Mahomes questionable with ankle injury",
        "Chiefs QB limited in practice."
      ),
      makeNewsItem(
        "How AI is changing NFL draft scouting",
        "General opinion piece."
      ),
      makeNewsItem(
        "Eagles sign free agent WR to one-year deal",
        "Philadelphia bolsters their receiving corps."
      ),
    ];

    const result = enrichNewsItems(items, db);

    // First and third should survive; second should be dropped
    expect(result).toHaveLength(2);
    expect(result[0].rawData.playerName).toBe("Patrick Mahomes");
    expect(result[1].rawData.team).toBe("PHI");
  });

  it("preserves existing rawData fields when enriching", () => {
    const item: ScrapedItem = {
      type: "news",
      sourceAdapter: "espn-rss",
      source: "ESPN",
      sourceUrl: "https://espn.com/nfl/news/123",
      confidence: "reported",
      fetchedAt: "2026-04-13T00:00:00.000Z",
      rawData: {
        headline: "Patrick Mahomes hurt in game",
        description: "KC QB injured his ankle.",
        timestamp: "2026-04-13T00:00:00.000Z",
        someExtraField: "should be kept",
      },
    };

    const result = enrichNewsItems([item], db);

    expect(result).toHaveLength(1);
    expect(result[0].rawData.someExtraField).toBe("should be kept");
    expect(result[0].sourceUrl).toBe("https://espn.com/nfl/news/123");
  });
});
