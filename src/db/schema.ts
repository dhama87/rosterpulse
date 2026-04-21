import type { Client } from "@libsql/client";

export const TABLE_NAMES = {
  PLAYERS: "players",
  NEWS: "news",
  SCRAPE_LOG: "scrape_log",
  GAMES: "games",
  DRAFT_PICKS: "draft_picks",
  DRAFT_PROSPECTS: "draft_prospects",
  DRAFT_TEAM_NEEDS: "draft_team_needs",
  DRAFT_META: "draft_meta",
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

    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      week INTEGER NOT NULL,
      seasonType TEXT NOT NULL DEFAULT 'regular',
      awayTeam TEXT NOT NULL,
      homeTeam TEXT NOT NULL,
      gameTime TEXT NOT NULL,
      tvNetwork TEXT,
      awayScore INTEGER,
      homeScore INTEGER,
      status TEXT NOT NULL DEFAULT 'scheduled',
      updatedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_games_week ON games(week);
    CREATE INDEX IF NOT EXISTS idx_games_away ON games(awayTeam);
    CREATE INDEX IF NOT EXISTS idx_games_home ON games(homeTeam);

    CREATE TABLE IF NOT EXISTS draft_picks (
      id TEXT PRIMARY KEY,
      year INTEGER NOT NULL,
      round INTEGER NOT NULL,
      pickNumber INTEGER NOT NULL,
      teamId TEXT NOT NULL,
      playerName TEXT NOT NULL DEFAULT '',
      position TEXT NOT NULL DEFAULT '',
      college TEXT NOT NULL DEFAULT '',
      isTradeUp INTEGER NOT NULL DEFAULT 0,
      tradeNote TEXT,
      timestamp TEXT,
      updatedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_draft_picks_year ON draft_picks(year);
    CREATE INDEX IF NOT EXISTS idx_draft_picks_team ON draft_picks(teamId);
    CREATE INDEX IF NOT EXISTS idx_draft_picks_round ON draft_picks(round);

    CREATE TABLE IF NOT EXISTS draft_prospects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      position TEXT NOT NULL,
      college TEXT NOT NULL,
      rank INTEGER NOT NULL,
      projectedRound INTEGER NOT NULL,
      projectedPick INTEGER,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS draft_team_needs (
      id TEXT PRIMARY KEY,
      teamId TEXT NOT NULL,
      position TEXT NOT NULL,
      priority INTEGER NOT NULL DEFAULT 2,
      updatedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_draft_team_needs_team ON draft_team_needs(teamId);

    CREATE TABLE IF NOT EXISTS draft_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);
}
