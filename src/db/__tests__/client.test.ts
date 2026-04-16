import path from "path";
import fs from "fs";
import os from "os";

describe("client", () => {
  let testDbPath: string;

  beforeEach(() => {
    testDbPath = path.join(os.tmpdir(), `rosterpulse-test-${Date.now()}.db`);
  });

  afterEach(async () => {
    // Reset module to clear singleton between tests
    jest.resetModules();
    // Clean up test DB file
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  it("exports DB_PATH containing 'rosterpulse.db'", async () => {
    const { DB_PATH } = await import("../client");
    expect(DB_PATH).toContain("rosterpulse.db");
  });

  it("creates a database connection with all tables present", async () => {
    const { getDb, closeDb } = await import("../client");
    const db = getDb(testDbPath);

    const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
      )
      .all() as { name: string }[];

    const tableNames = tables.map((t) => t.name);
    expect(tableNames).toContain("players");
    expect(tableNames).toContain("news");
    expect(tableNames).toContain("scrape_log");

    closeDb();
  });

  it("returns the same instance on repeated calls", async () => {
    const { getDb, closeDb } = await import("../client");
    const db1 = getDb(testDbPath);
    const db2 = getDb(testDbPath);

    expect(db1).toBe(db2);

    closeDb();
  });

  it("has WAL journal mode enabled", async () => {
    const { getDb, closeDb } = await import("../client");
    const db = getDb(testDbPath);

    const row = db.prepare("PRAGMA journal_mode").get() as {
      journal_mode: string;
    };
    expect(row.journal_mode).toBe("wal");

    closeDb();
  });

  it("has foreign keys enabled", async () => {
    const { getDb, closeDb } = await import("../client");
    const db = getDb(testDbPath);

    const row = db.prepare("PRAGMA foreign_keys").get() as {
      foreign_keys: number;
    };
    expect(row.foreign_keys).toBe(1);

    closeDb();
  });
});
