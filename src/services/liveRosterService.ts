import Database from "better-sqlite3";
import {
  RosterService,
  Team,
  Player,
  NewsItem,
  NewsCategory,
  TeamRoster,
  DepthChartEntry,
  PositionGroup,
  InjuryStatus,
} from "@/types";
import { teams } from "@/data/teams";

// Internal DB row types
interface PlayerRow {
  id: string;
  name: string;
  team: string;
  position: string;
  positionGroup: string;
  depthOrder: number;
  jerseyNumber: number;
  height: string;
  weight: string;
  age: number;
  college: string;
  experience: number;
  injuryStatus: string;
  injuryDetail: string | null;
  injuryDate: string | null;
  estimatedReturn: string | null;
  irDesignation: string | null;
  practiceStatus: string | null;
  depthChange: string | null;
  stats: string;
  source: string | null;
  sourceUrl: string | null;
  updatedAt: string;
}

interface NewsRow {
  id: string;
  dedupKey: string | null;
  playerId: string | null;
  playerName: string;
  team: string;
  position: string;
  category: string;
  headline: string;
  description: string;
  source: string | null;
  sourceUrl: string | null;
  confidence: string | null;
  timestamp: string;
  fetchedAt: string;
}

// Position ordering for depth chart display
const positionOrder: Record<string, { group: PositionGroup; order: number }> = {
  QB: { group: "offense", order: 1 },
  RB: { group: "offense", order: 2 },
  WR1: { group: "offense", order: 3 },
  WR2: { group: "offense", order: 4 },
  WR3: { group: "offense", order: 5 },
  TE: { group: "offense", order: 6 },
  LT: { group: "offense", order: 7 },
  LG: { group: "offense", order: 8 },
  C: { group: "offense", order: 9 },
  RG: { group: "offense", order: 10 },
  RT: { group: "offense", order: 11 },
  DE1: { group: "defense", order: 12 },
  DE2: { group: "defense", order: 13 },
  DT1: { group: "defense", order: 14 },
  DT2: { group: "defense", order: 15 },
  LB1: { group: "defense", order: 16 },
  LB2: { group: "defense", order: 17 },
  LB3: { group: "defense", order: 18 },
  CB1: { group: "defense", order: 19 },
  CB2: { group: "defense", order: 20 },
  SS: { group: "defense", order: 21 },
  FS: { group: "defense", order: 22 },
  K: { group: "specialTeams", order: 23 },
  P: { group: "specialTeams", order: 24 },
  KR: { group: "specialTeams", order: 25 },
  PR: { group: "specialTeams", order: 26 },
  LS: { group: "specialTeams", order: 27 },
};

function rowToPlayer(row: PlayerRow): Player {
  return {
    id: row.id,
    name: row.name,
    team: row.team,
    position: row.position,
    positionGroup: row.positionGroup as PositionGroup,
    depthOrder: row.depthOrder,
    jerseyNumber: row.jerseyNumber,
    height: row.height,
    weight: row.weight,
    age: row.age,
    college: row.college,
    experience: row.experience,
    injuryStatus: row.injuryStatus as InjuryStatus,
    ...(row.injuryDetail != null ? { injuryDetail: row.injuryDetail } : {}),
    ...(row.injuryDate != null ? { injuryDate: row.injuryDate } : {}),
    ...(row.estimatedReturn != null ? { estimatedReturn: row.estimatedReturn } : {}),
    ...(row.irDesignation != null ? { irDesignation: row.irDesignation as "4-game" | "8-game" | "season" } : {}),
    ...(row.practiceStatus != null ? { practiceStatus: row.practiceStatus as "DNP" | "Limited" | "Full" } : {}),
    ...(row.depthChange != null ? { depthChange: row.depthChange as "up" | "down" } : {}),
    stats: JSON.parse(row.stats) as Record<string, number>,
  };
}

function rowToNewsItem(row: NewsRow): NewsItem {
  return {
    id: row.id,
    playerId: row.playerId ?? "",
    playerName: row.playerName,
    team: row.team,
    position: row.position,
    category: row.category as NewsCategory,
    headline: row.headline,
    description: row.description,
    ...(row.source != null ? { source: row.source } : {}),
    ...(row.sourceUrl != null ? { sourceUrl: row.sourceUrl } : {}),
    ...(row.confidence != null
      ? { confidence: row.confidence as "reported" | "official" }
      : {}),
    timestamp: row.timestamp,
  };
}

function buildDepthChart(playerRows: PlayerRow[]): DepthChartEntry[] {
  const positionMap = new Map<string, PlayerRow[]>();

  for (const row of playerRows) {
    const existing = positionMap.get(row.position) || [];
    existing.push(row);
    positionMap.set(row.position, existing);
  }

  const entries: DepthChartEntry[] = [];

  for (const [position, rows] of positionMap.entries()) {
    const sorted = [...rows].sort((a, b) => a.depthOrder - b.depthOrder);
    const info = positionOrder[position] || {
      group: "offense" as PositionGroup,
      order: 99,
    };
    entries.push({
      position,
      positionGroup: info.group,
      players: sorted.map(rowToPlayer),
    });
  }

  entries.sort((a, b) => {
    const orderA = positionOrder[a.position]?.order ?? 99;
    const orderB = positionOrder[b.position]?.order ?? 99;
    return orderA - orderB;
  });

  return entries;
}

export function createLiveRosterService(db: Database.Database): RosterService {
  return {
    getAllTeams(): Team[] {
      return teams;
    },

    getTeam(teamId: string): Team | undefined {
      return teams.find((t) => t.id === teamId);
    },

    getTeamRoster(teamId: string): TeamRoster | undefined {
      const team = teams.find((t) => t.id === teamId);
      if (!team) return undefined;

      const playerRows = db
        .prepare("SELECT * FROM players WHERE team = ?")
        .all(teamId) as PlayerRow[];

      const depthChart = buildDepthChart(playerRows);

      const newsRows = db
        .prepare(
          "SELECT * FROM news WHERE team = ? ORDER BY timestamp DESC"
        )
        .all(teamId) as NewsRow[];

      const news = newsRows.map(rowToNewsItem);

      return { team, depthChart, news };
    },

    getPlayer(playerId: string): Player | undefined {
      const row = db
        .prepare("SELECT * FROM players WHERE id = ?")
        .get(playerId) as PlayerRow | undefined;
      return row ? rowToPlayer(row) : undefined;
    },

    getPlayerNews(playerId: string): NewsItem[] {
      const rows = db
        .prepare(
          "SELECT * FROM news WHERE playerId = ? ORDER BY timestamp DESC"
        )
        .all(playerId) as NewsRow[];
      return rows.map(rowToNewsItem);
    },

    getTeamNews(teamId: string): NewsItem[] {
      const rows = db
        .prepare(
          "SELECT * FROM news WHERE team = ? ORDER BY timestamp DESC"
        )
        .all(teamId) as NewsRow[];
      return rows.map(rowToNewsItem);
    },

    getAllNews(options?: { category?: NewsCategory; limit?: number }): NewsItem[] {
      let sql = "SELECT * FROM news";
      const params: (string | number)[] = [];

      if (options?.category) {
        sql += " WHERE category = ?";
        params.push(options.category);
      }

      sql += " ORDER BY timestamp DESC";

      if (options?.limit) {
        sql += " LIMIT ?";
        params.push(options.limit);
      }

      const rows = db.prepare(sql).all(...params) as NewsRow[];
      return rows.map(rowToNewsItem);
    },

    searchPlayers(query: string): Player[] {
      const rows = db
        .prepare(
          "SELECT * FROM players WHERE LOWER(name) LIKE LOWER(?)"
        )
        .all(`%${query}%`) as PlayerRow[];
      return rows.map(rowToPlayer);
    },

    searchTeams(query: string): Team[] {
      const lower = query.toLowerCase();
      return teams.filter(
        (t) =>
          t.name.toLowerCase().includes(lower) ||
          t.fullName.toLowerCase().includes(lower)
      );
    },

    getLastVerified(): string {
      const row = db
        .prepare(
          "SELECT completedAt FROM scrape_log WHERE status = 'success' ORDER BY completedAt DESC LIMIT 1"
        )
        .get() as { completedAt: string } | undefined;
      return row ? row.completedAt : new Date().toISOString();
    },
  };
}
