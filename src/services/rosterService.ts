import {
  RosterService,
  Team,
  Player,
  NewsItem,
  NewsCategory,
  DepthChartEntry,
  TeamRoster,
  PositionGroup,
  Game,
} from "@/types";
import { teams } from "@/data/teams";
import { players } from "@/data/players";
import { newsItems } from "@/data/news";

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

function buildDepthChart(teamPlayers: Player[]): DepthChartEntry[] {
  const positionMap = new Map<string, Player[]>();

  for (const player of teamPlayers) {
    const existing = positionMap.get(player.position) || [];
    existing.push(player);
    positionMap.set(player.position, existing);
  }

  const entries: DepthChartEntry[] = [];

  for (const [position, posPlayers] of positionMap.entries()) {
    const sorted = [...posPlayers].sort((a, b) => a.depthOrder - b.depthOrder);
    const info = positionOrder[position] || {
      group: "offense" as PositionGroup,
      order: 99,
    };
    entries.push({
      position,
      positionGroup: info.group,
      players: sorted,
    });
  }

  entries.sort((a, b) => {
    const orderA = positionOrder[a.position]?.order ?? 99;
    const orderB = positionOrder[b.position]?.order ?? 99;
    return orderA - orderB;
  });

  return entries;
}

export function createMockRosterService(): RosterService {
  // Sort news by timestamp descending (newest first)
  const sortedNews = [...newsItems].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

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

      const teamPlayers = players.filter((p) => p.team === teamId);
      const depthChart = buildDepthChart(teamPlayers);
      const news = sortedNews.filter((n) => n.team === teamId);

      return { team, depthChart, news };
    },

    async getPlayer(playerId: string): Promise<Player | undefined> {
      return players.find((p) => p.id === playerId);
    },

    async getPlayerNews(playerId: string): Promise<NewsItem[]> {
      return sortedNews.filter((n) => n.playerId === playerId);
    },

    async getTeamNews(teamId: string): Promise<NewsItem[]> {
      return sortedNews.filter((n) => n.team === teamId);
    },

    async getAllNews(options?: {
      category?: NewsCategory;
      limit?: number;
    }): Promise<NewsItem[]> {
      let result = sortedNews;

      if (options?.category) {
        result = result.filter((n) => n.category === options.category);
      }

      if (options?.limit) {
        result = result.slice(0, options.limit);
      }

      return result;
    },

    async searchPlayers(query: string): Promise<Player[]> {
      const lower = query.toLowerCase();
      return players.filter((p) => p.name.toLowerCase().includes(lower));
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
      return new Date().toISOString();
    },

    async getWeekGames(_week: number): Promise<Game[]> {
      return [];
    },

    async getCurrentWeek(): Promise<number> {
      return 1;
    },
  };
}
