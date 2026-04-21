import type { Client, Row } from "@libsql/client";
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
  Game,
  GameStatus,
  DraftPick,
  DraftProspect,
  TeamNeed,
} from "@/types";
import { teams } from "@/data/teams";

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
  CB3: { group: "defense", order: 20.5 },
  SS: { group: "defense", order: 21 },
  FS: { group: "defense", order: 22 },
  K: { group: "specialTeams", order: 23 },
  P: { group: "specialTeams", order: 24 },
  KR: { group: "specialTeams", order: 25 },
  PR: { group: "specialTeams", order: 26 },
  LS: { group: "specialTeams", order: 27 },
};

function rowToPlayer(row: Row): Player {
  return {
    id: row.id as string,
    name: row.name as string,
    team: row.team as string,
    position: row.position as string,
    positionGroup: row.positionGroup as PositionGroup,
    depthOrder: row.depthOrder as number,
    jerseyNumber: row.jerseyNumber as number,
    height: row.height as string,
    weight: row.weight as string,
    age: row.age as number,
    college: row.college as string,
    experience: row.experience as number,
    injuryStatus: row.injuryStatus as InjuryStatus,
    ...(row.injuryDetail != null ? { injuryDetail: row.injuryDetail as string } : {}),
    ...(row.injuryDate != null ? { injuryDate: row.injuryDate as string } : {}),
    ...(row.estimatedReturn != null ? { estimatedReturn: row.estimatedReturn as string } : {}),
    ...(row.irDesignation != null ? { irDesignation: row.irDesignation as "4-game" | "8-game" | "season" } : {}),
    ...(row.practiceStatus != null ? { practiceStatus: row.practiceStatus as "DNP" | "Limited" | "Full" } : {}),
    ...(row.depthChange != null ? { depthChange: row.depthChange as "up" | "down" } : {}),
    ...(row.espnId != null ? { espnId: row.espnId as string } : {}),
    stats: JSON.parse((row.stats as string) || "{}") as Record<string, number>,
  };
}

function rowToNewsItem(row: Row): NewsItem {
  return {
    id: row.id as string,
    playerId: (row.playerId as string) ?? "",
    playerName: row.playerName as string,
    team: row.team as string,
    position: row.position as string,
    category: row.category as NewsCategory,
    headline: row.headline as string,
    description: row.description as string,
    ...(row.source != null ? { source: row.source as string } : {}),
    ...(row.sourceUrl != null ? { sourceUrl: row.sourceUrl as string } : {}),
    ...(row.confidence != null
      ? { confidence: row.confidence as "reported" | "official" }
      : {}),
    timestamp: row.timestamp as string,
  };
}

function buildDepthChart(rows: Row[]): DepthChartEntry[] {
  const positionMap = new Map<string, Row[]>();

  for (const row of rows) {
    if ((row.depthOrder as number) === 0) continue;
    const pos = row.position as string;
    const existing = positionMap.get(pos) || [];
    existing.push(row);
    positionMap.set(pos, existing);
  }

  const entries: DepthChartEntry[] = [];

  for (const [position, posRows] of positionMap.entries()) {
    const sorted = [...posRows].sort(
      (a, b) => (a.depthOrder as number) - (b.depthOrder as number)
    );
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

export function createLiveRosterService(db: Client): RosterService {
  return {
    getAllTeams(): Team[] {
      return teams;
    },

    getTeam(teamId: string): Team | undefined {
      return teams.find((t) => t.id === teamId);
    },

    async getTeamRoster(teamId: string): Promise<TeamRoster | undefined> {
      const team = teams.find((t) => t.id === teamId);
      if (!team) return undefined;

      const playerResult = await db.execute({
        sql: "SELECT * FROM players WHERE team = ?",
        args: [teamId],
      });

      const depthChart = buildDepthChart(playerResult.rows);

      const newsResult = await db.execute({
        sql: "SELECT * FROM news WHERE team = ? ORDER BY timestamp DESC",
        args: [teamId],
      });

      const news = newsResult.rows.map(rowToNewsItem);

      return { team, depthChart, news };
    },

    async getPlayer(playerId: string): Promise<Player | undefined> {
      const result = await db.execute({
        sql: "SELECT * FROM players WHERE id = ?",
        args: [playerId],
      });
      return result.rows.length > 0 ? rowToPlayer(result.rows[0]) : undefined;
    },

    async getPlayerNews(playerId: string): Promise<NewsItem[]> {
      const result = await db.execute({
        sql: "SELECT * FROM news WHERE playerId = ? ORDER BY timestamp DESC",
        args: [playerId],
      });
      return result.rows.map(rowToNewsItem);
    },

    async getTeamNews(teamId: string): Promise<NewsItem[]> {
      const result = await db.execute({
        sql: "SELECT * FROM news WHERE team = ? ORDER BY timestamp DESC",
        args: [teamId],
      });
      return result.rows.map(rowToNewsItem);
    },

    async getAllNews(options?: { category?: NewsCategory; limit?: number }): Promise<NewsItem[]> {
      let sql = "SELECT * FROM news";
      const args: (string | number)[] = [];

      if (options?.category) {
        sql += " WHERE category = ?";
        args.push(options.category);
      }

      sql += " ORDER BY timestamp DESC";

      if (options?.limit) {
        sql += " LIMIT ?";
        args.push(options.limit);
      }

      const result = await db.execute({ sql, args });
      return result.rows.map(rowToNewsItem);
    },

    async searchPlayers(query: string): Promise<Player[]> {
      const result = await db.execute({
        sql: "SELECT * FROM players WHERE LOWER(name) LIKE LOWER(?)",
        args: [`%${query}%`],
      });
      return result.rows.map(rowToPlayer);
    },

    searchTeams(query: string): Team[] {
      const lower = query.toLowerCase();
      return teams.filter(
        (t) =>
          t.name.toLowerCase().includes(lower) ||
          t.fullName.toLowerCase().includes(lower)
      );
    },

    async getLastVerified(): Promise<string> {
      const result = await db.execute(
        "SELECT completedAt FROM scrape_log WHERE status = 'success' ORDER BY completedAt DESC LIMIT 1"
      );
      return result.rows.length > 0
        ? (result.rows[0].completedAt as string)
        : new Date().toISOString();
    },

    async getWeekGames(week: number): Promise<Game[]> {
      const result = await db.execute({
        sql: "SELECT * FROM games WHERE week = ? ORDER BY gameTime ASC",
        args: [week],
      });

      return result.rows.map((row) => {
        const awayTeam = teams.find((t) => t.id === (row.awayTeam as string));
        const homeTeam = teams.find((t) => t.id === (row.homeTeam as string));
        if (!awayTeam || !homeTeam) return null;

        return {
          id: row.id as string,
          week: row.week as number,
          seasonType: (row.seasonType as string) as "regular" | "postseason",
          awayTeam,
          homeTeam,
          gameTime: row.gameTime as string,
          ...(row.tvNetwork != null ? { tvNetwork: row.tvNetwork as string } : {}),
          ...(row.awayScore != null ? { awayScore: row.awayScore as number } : {}),
          ...(row.homeScore != null ? { homeScore: row.homeScore as number } : {}),
          status: row.status as GameStatus,
        } satisfies Game;
      }).filter((g): g is Game => g !== null);
    },

    async getCurrentWeek(): Promise<number> {
      // Find the latest week that has games with a gameTime in the past or today
      const result = await db.execute(
        "SELECT MAX(week) as week FROM games WHERE gameTime <= datetime('now')"
      );
      const week = result.rows[0]?.week as number | null;
      // Default to week 1 if no games found, cap at 23 (Super Bowl)
      return Math.min(Math.max(week ?? 1, 1), 23);
    },

    async getDraftPicks(year: number): Promise<DraftPick[]> {
      const result = await db.execute({
        sql: "SELECT * FROM draft_picks WHERE year = ? ORDER BY pickNumber ASC",
        args: [year],
      });
      return result.rows.map((row) => ({
        id: row.id as string,
        year: row.year as number,
        round: row.round as number,
        pickNumber: row.pickNumber as number,
        teamId: row.teamId as string,
        playerName: row.playerName as string,
        position: row.position as string,
        college: row.college as string,
        isTradeUp: (row.isTradeUp as number) === 1,
        tradeNote: (row.tradeNote as string) ?? null,
        timestamp: (row.timestamp as string) ?? null,
      }));
    },

    async getDraftProspects(): Promise<DraftProspect[]> {
      const result = await db.execute(
        "SELECT * FROM draft_prospects ORDER BY rank ASC"
      );
      return result.rows.map((row) => ({
        id: row.id as string,
        name: row.name as string,
        position: row.position as string,
        college: row.college as string,
        rank: row.rank as number,
        projectedRound: row.projectedRound as number,
        projectedPick: (row.projectedPick as number) ?? null,
      }));
    },

    async getTeamNeeds(teamId?: string): Promise<TeamNeed[]> {
      if (teamId) {
        const result = await db.execute({
          sql: "SELECT * FROM draft_team_needs WHERE teamId = ? ORDER BY priority ASC",
          args: [teamId],
        });
        return result.rows.map((row) => ({
          teamId: row.teamId as string,
          position: row.position as string,
          priority: row.priority as 1 | 2 | 3,
        }));
      }
      const result = await db.execute(
        "SELECT * FROM draft_team_needs ORDER BY teamId ASC, priority ASC"
      );
      return result.rows.map((row) => ({
        teamId: row.teamId as string,
        position: row.position as string,
        priority: row.priority as 1 | 2 | 3,
      }));
    },

    async getDraftMeta(): Promise<Record<string, string>> {
      const result = await db.execute("SELECT key, value FROM draft_meta");
      const meta: Record<string, string> = {};
      for (const row of result.rows) {
        meta[row.key as string] = row.value as string;
      }
      return meta;
    },
  };
}
