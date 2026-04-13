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
  getTeamRoster(teamId: string): TeamRoster | undefined;
  getPlayer(playerId: string): Player | undefined;
  getPlayerNews(playerId: string): NewsItem[];
  getTeamNews(teamId: string): NewsItem[];
  getAllNews(options?: { category?: NewsCategory; limit?: number }): NewsItem[];
  searchPlayers(query: string): Player[];
  searchTeams(query: string): Team[];
  getLastVerified(): string;
}
