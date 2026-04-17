// === Enums & Union Types ===

export type Conference = "AFC" | "NFC";

export type Division = "East" | "North" | "South" | "West";

export type NewsCategory =
  | "INJURY"
  | "TRADE"
  | "SIGNING"
  | "IR"
  | "DEPTH_CHART"
  | "SUSPENSION"
  | "RETURN";

export type InjuryStatus =
  | "Active"
  | "Questionable"
  | "Doubtful"
  | "Out"
  | "IR"
  | "Suspended"
  | "Holdout";

export type PositionGroup = "offense" | "defense" | "specialTeams";

// === Core Interfaces ===

export interface Team {
  id: string;
  name: string;
  fullName: string;
  conference: Conference;
  division: Division;
  record: string;
  logo: string;
  lastUpdated: string;
  byeWeek: number;
}

export interface Player {
  id: string;
  name: string;
  team: string;
  position: string;
  positionGroup: PositionGroup;
  depthOrder: number;
  jerseyNumber: number;
  height: string;
  weight: string;
  age: number;
  college: string;
  experience: number;
  injuryStatus: InjuryStatus;
  injuryDetail?: string;
  injuryDate?: string;
  estimatedReturn?: string;
  irDesignation?: "4-game" | "8-game" | "season";
  practiceStatus?: "DNP" | "Limited" | "Full";
  depthChange?: "up" | "down";
  espnId?: string;
  stats: Record<string, number>;
}

export interface NewsItem {
  id: string;
  playerId: string;
  playerName: string;
  team: string;
  position: string;
  category: NewsCategory;
  headline: string;
  description: string;
  source?: string;
  sourceUrl?: string;
  confidence?: "reported" | "official";
  timestamp: string;
}

export interface DepthChartEntry {
  position: string;
  positionGroup: PositionGroup;
  players: Player[];
}

export interface TeamRoster {
  team: Team;
  depthChart: DepthChartEntry[];
  news: NewsItem[];
}

// === Service Interface ===

export interface RosterService {
  getAllTeams(): Team[];
  getTeam(teamId: string): Team | undefined;
  getTeamRoster(teamId: string): Promise<TeamRoster | undefined>;
  getPlayer(playerId: string): Promise<Player | undefined>;
  getPlayerNews(playerId: string): Promise<NewsItem[]>;
  getTeamNews(teamId: string): Promise<NewsItem[]>;
  getAllNews(options?: { category?: NewsCategory; limit?: number }): Promise<NewsItem[]>;
  searchPlayers(query: string): Promise<Player[]>;
  searchTeams(query: string): Team[];
  getLastVerified(): Promise<string>;
}
