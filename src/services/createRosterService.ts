import fs from "fs";
import Database from "better-sqlite3";
import { RosterService } from "@/types";
import { createMockRosterService } from "./rosterService";
import { createLiveRosterService } from "./liveRosterService";
import { DB_PATH } from "@/db/client";

const STALENESS_THRESHOLD_MS = 4 * 60 * 60 * 1000; // 4 hours

export function createRosterService(dbPath: string = DB_PATH): RosterService {
  // 1. If DATA_SOURCE=mock, always return mock
  if (process.env.DATA_SOURCE === "mock") {
    return createMockRosterService();
  }

  // 2. If DB file doesn't exist, return mock
  if (!fs.existsSync(dbPath)) {
    return createMockRosterService();
  }

  try {
    // 3. Open DB as readonly
    const db = new Database(dbPath, { readonly: true });

    // 4. Check freshness
    const row = db
      .prepare(
        "SELECT completedAt FROM scrape_log WHERE status = 'success' ORDER BY completedAt DESC LIMIT 1"
      )
      .get() as { completedAt: string } | undefined;

    if (!row) {
      db.close();
      return createMockRosterService();
    }

    const completedAt = new Date(row.completedAt).getTime();
    const age = Date.now() - completedAt;

    if (age > STALENESS_THRESHOLD_MS) {
      db.close();
      return createMockRosterService();
    }

    // 5. Data is fresh — return live service
    return createLiveRosterService(db);
  } catch {
    // 6. On any error, fall back to mock
    return createMockRosterService();
  }
}
