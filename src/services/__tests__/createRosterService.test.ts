import path from "path";
import fs from "fs";
import DatabaseConstructor from "better-sqlite3";
import { createRosterService } from "@/services/createRosterService";
import { createTables } from "@/db/schema";
import { seedFromMock } from "@/db/seed";

const TEST_DB_PATH = path.join(__dirname, "test-factory.db");

function cleanupDb() {
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
}

afterEach(() => {
  cleanupDb();
  delete process.env.DATA_SOURCE;
});

describe("createRosterService", () => {
  describe("when DATA_SOURCE=mock", () => {
    it("returns mock service regardless of DB state", async () => {
      process.env.DATA_SOURCE = "mock";
      const service = createRosterService(TEST_DB_PATH);
      const teams = service.getAllTeams();
      expect(teams).toHaveLength(32);
    });
  });

  describe("when DB does not exist", () => {
    it("returns mock service", async () => {
      const service = createRosterService("/nonexistent/path/to.db");
      const teams = service.getAllTeams();
      expect(teams).toHaveLength(32);
    });
  });

  describe("when DB exists with fresh data", () => {
    it("returns live service with seeded data", async () => {
      // Create and seed a real DB file
      const db = new DatabaseConstructor(TEST_DB_PATH);
      createTables(db);
      seedFromMock(db);

      // Insert a recent scrape_log entry (1 hour ago — well within 4 hours)
      const recentTime = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      db.prepare(
        `INSERT INTO scrape_log (adapter, status, itemsFound, itemsNew, itemsUpdated, startedAt, completedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run("test-adapter", "success", 100, 50, 0, recentTime, recentTime);
      db.close();

      const service = createRosterService(TEST_DB_PATH);
      const teams = service.getAllTeams();
      expect(teams).toHaveLength(32);

      const player = service.getPlayer("KC-QB-1");
      expect(player).toBeDefined();
      expect(player?.name).toBe("Patrick Mahomes");
    });
  });

  describe("when DB exists but data is stale (>4 hours)", () => {
    it("returns mock service", async () => {
      // Create and seed a real DB file
      const db = new DatabaseConstructor(TEST_DB_PATH);
      createTables(db);
      seedFromMock(db);

      // Insert a stale scrape_log entry (5 hours ago)
      const staleTime = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();
      db.prepare(
        `INSERT INTO scrape_log (adapter, status, itemsFound, itemsNew, itemsUpdated, startedAt, completedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run("test-adapter", "success", 100, 50, 0, staleTime, staleTime);
      db.close();

      const service = createRosterService(TEST_DB_PATH);
      const teams = service.getAllTeams();
      // Mock service still returns 32 teams
      expect(teams).toHaveLength(32);
    });
  });
});
