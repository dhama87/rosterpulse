import { RosterService } from "@/types";
import { createMockRosterService } from "./rosterService";
import { createLiveRosterService } from "./liveRosterService";
import { getDb } from "@/db/client";

export function createRosterService(): RosterService {
  // If DATA_SOURCE=mock or no Turso URL configured, use mock
  if (
    process.env.DATA_SOURCE === "mock" ||
    !process.env.TURSO_DATABASE_URL
  ) {
    return createMockRosterService();
  }

  try {
    const db = getDb();
    return createLiveRosterService(db);
  } catch {
    return createMockRosterService();
  }
}
