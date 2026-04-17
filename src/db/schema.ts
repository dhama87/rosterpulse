import type { Client } from "@libsql/client";

export const TABLE_NAMES = {
  PLAYERS: "players",
  NEWS: "news",
  SCRAPE_LOG: "scrape_log",
} as const;

export async function createTables(db: Client): Promise<void> {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      team TEXT NOT NULL,
      position TEXT NOT NULL,
      positionGroup TEXT NOT NULL,
      depthOrder INTEGER NOT NULL,
      jerseyNumber INTEGER NOT NULL,
      height TEXT NOT NULL,
      weight TEXT NOT NULL,
      age INTEGER NOT NULL,
      college TEXT NOT NULL,
      experience INTEGER NOT NULL,
      injuryStatus TEXT NOT NULL DEFAULT 'Active',
      injuryDetail TEXT,
      injuryDate TEXT,
      estimatedReturn TEXT,
      irDesignation TEXT,
      practiceStatus TEXT,
      depthChange TEXT,
      espnId TEXT,
      stats TEXT NOT NULL DEFAULT '{}',
      source TEXT,
      sourceUrl TEXT,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS news (
      id TEXT PRIMARY KEY,
      dedupKey TEXT UNIQUE,
      playerId TEXT,
      playerName TEXT NOT NULL,
      team TEXT NOT NULL,
      position TEXT NOT NULL,
      category TEXT NOT NULL,
      headline TEXT NOT NULL,
      description TEXT NOT NULL,
      source TEXT,
      sourceUrl TEXT,
      confidence TEXT NOT NULL DEFAULT 'reported',
      timestamp TEXT NOT NULL,
      fetchedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scrape_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      adapter TEXT NOT NULL,
      status TEXT NOT NULL,
      itemsFound INTEGER NOT NULL DEFAULT 0,
      itemsNew INTEGER NOT NULL DEFAULT 0,
      itemsUpdated INTEGER NOT NULL DEFAULT 0,
      errorMessage TEXT,
      startedAt TEXT NOT NULL,
      completedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_players_team ON players(team);
    CREATE INDEX IF NOT EXISTS idx_news_team ON news(team);
    CREATE INDEX IF NOT EXISTS idx_news_playerId ON news(playerId);
    CREATE INDEX IF NOT EXISTS idx_news_timestamp ON news(timestamp);
    CREATE INDEX IF NOT EXISTS idx_scrape_log_adapter ON scrape_log(adapter);
  `);
}
