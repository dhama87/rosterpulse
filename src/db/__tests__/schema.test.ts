import Database from "better-sqlite3";
import { createTables, TABLE_NAMES } from "../schema";

describe("schema", () => {
  let db: InstanceType<typeof Database>;

  beforeEach(() => {
    db = new Database(":memory:");
  });

  afterEach(() => {
    db.close();
  });

  it("exports correct TABLE_NAMES", () => {
    expect(TABLE_NAMES.PLAYERS).toBe("players");
    expect(TABLE_NAMES.NEWS).toBe("news");
    expect(TABLE_NAMES.SCRAPE_LOG).toBe("scrape_log");
  });

  it("creates all required tables", () => {
    createTables(db);

    const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
      )
      .all() as { name: string }[];

    const tableNames = tables.map((t) => t.name);
    expect(tableNames).toContain("players");
    expect(tableNames).toContain("news");
    expect(tableNames).toContain("scrape_log");
  });

  it("creates all required indexes", () => {
    createTables(db);

    const indexes = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='index' ORDER BY name"
      )
      .all() as { name: string }[];

    const indexNames = indexes.map((i) => i.name);
    expect(indexNames).toContain("idx_players_team");
    expect(indexNames).toContain("idx_news_team");
    expect(indexNames).toContain("idx_news_playerId");
    expect(indexNames).toContain("idx_news_timestamp");
    expect(indexNames).toContain("idx_scrape_log_adapter");
  });

  it("is idempotent (can run createTables twice without error)", () => {
    expect(() => {
      createTables(db);
      createTables(db);
    }).not.toThrow();
  });

  it("players table has correct columns with defaults", () => {
    createTables(db);

    // Insert a minimal valid row to verify NOT NULL and DEFAULT constraints
    expect(() => {
      db.prepare(
        `INSERT INTO players (id, name, team, position, positionGroup, depthOrder, jerseyNumber, height, weight, age, college, experience, updatedAt)
         VALUES ('p1', 'Test Player', 'DAL', 'QB', 'QB', 1, 4, '6-4', '230', 27, 'Oklahoma', 3, '2026-04-13T00:00:00Z')`
      ).run();
    }).not.toThrow();

    const row = db
      .prepare("SELECT injuryStatus, stats FROM players WHERE id='p1'")
      .get() as { injuryStatus: string; stats: string };
    expect(row.injuryStatus).toBe("Active");
    expect(row.stats).toBe("{}");
  });

  it("news table has correct columns with defaults", () => {
    createTables(db);

    expect(() => {
      db.prepare(
        `INSERT INTO news (id, playerName, team, position, category, headline, description, timestamp, fetchedAt)
         VALUES ('n1', 'Test Player', 'DAL', 'QB', 'injury', 'Headline', 'Description', '2026-04-13T00:00:00Z', '2026-04-13T00:00:00Z')`
      ).run();
    }).not.toThrow();

    const row = db
      .prepare("SELECT confidence FROM news WHERE id='n1'")
      .get() as { confidence: string };
    expect(row.confidence).toBe("reported");
  });

  it("news dedupKey is UNIQUE", () => {
    createTables(db);

    db.prepare(
      `INSERT INTO news (id, dedupKey, playerName, team, position, category, headline, description, timestamp, fetchedAt)
       VALUES ('n1', 'key-abc', 'Test Player', 'DAL', 'QB', 'injury', 'Headline', 'Desc', '2026-04-13T00:00:00Z', '2026-04-13T00:00:00Z')`
    ).run();

    expect(() => {
      db.prepare(
        `INSERT INTO news (id, dedupKey, playerName, team, position, category, headline, description, timestamp, fetchedAt)
         VALUES ('n2', 'key-abc', 'Other Player', 'DAL', 'QB', 'injury', 'Headline2', 'Desc2', '2026-04-13T00:00:00Z', '2026-04-13T00:00:00Z')`
      ).run();
    }).toThrow();
  });

  it("scrape_log has AUTOINCREMENT primary key", () => {
    createTables(db);

    const r1 = db
      .prepare(
        `INSERT INTO scrape_log (adapter, status, startedAt, completedAt)
         VALUES ('espn', 'success', '2026-04-13T00:00:00Z', '2026-04-13T00:01:00Z')`
      )
      .run();
    const r2 = db
      .prepare(
        `INSERT INTO scrape_log (adapter, status, startedAt, completedAt)
         VALUES ('rotoworld', 'success', '2026-04-13T00:00:00Z', '2026-04-13T00:01:00Z')`
      )
      .run();

    expect(r2.lastInsertRowid).toBeGreaterThan(r1.lastInsertRowid);
  });
});
