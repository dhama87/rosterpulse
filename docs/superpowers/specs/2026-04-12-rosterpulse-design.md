# RosterPulse — Design Spec

## Overview

RosterPulse is a no-clutter NFL roster and news dashboard. It shows every team's starters by position, verified hourly, with immediate player news that affects availability or role. The core value proposition is speed and clarity — faster and cleaner than ESPN, CBS, or any existing depth chart site.

**Target audience:** Fantasy football players, sports bettors, journalists, casual fans — anyone who needs to quickly check who's starting and what's changed.

**Core differentiator:** Zero clutter. No ads, no fantasy projections, no opinion content. Just rosters, status, and news. One click to any team, two clicks to any player.

## Architecture

### Stack

- **Framework:** Next.js App Router (TypeScript)
- **Styling:** Tailwind CSS
- **Testing:** Jest + ts-jest (TDD on services)
- **Data:** Mock JSON files behind a `RosterService` interface (swap for paid API later)
- **Deployment target:** Vercel (static-first with client-side polling for news)

### Data Strategy

**Phase 1 (MVP):** `MockRosterService` reads from JSON files containing realistic NFL roster data. All 32 teams with full depth charts, sample news items, and player details.

**Phase 2 (Production):** Replace `MockRosterService` with a real implementation backed by a paid sports data API (SportsData.io, ESPN API, or MySportsFeeds). The `RosterService` interface stays the same — only the implementation changes.

**Live layer:** The news feed on the home page polls client-side for updates. In mock mode this returns static data; in production it hits a real endpoint. Depth charts are server-rendered and refresh on page load.

### Design Principles

- Dark theme, minimal chrome, high information density
- Color coding does the heavy lifting: red = OUT/IR, amber = QUESTIONABLE/DOUBTFUL, green = ACTIVE/PROMOTED/RETURN, blue = TRADE/TRANSACTION
- Every element earns its screen space — when in doubt, remove rather than add
- "Last verified" timestamp visible on every page
- Desktop-first layout (mobile optimization is a future phase)
- Sport-agnostic data model to support future expansion beyond NFL

## Pages

### 1. Home Page (`/`)

The landing page shows everything at a glance with one-click access to any team.

**Layout:** Two-column — team grid (left, ~70%), live news feed (right, ~30%).

**Top bar:**
- RosterPulse logo/wordmark with "LIVE" indicator
- Global search bar (search any player or team)
- "Last verified" timestamp

**Team grid (left):**
- All 32 teams organized by conference (AFC/NFC) and division (East, North, South, West)
- Each team is a compact card showing: team emoji/logo placeholder, team name, alert count (number of recent news items)
- Teams with breaking news get a highlighted border
- Click any team card → navigates to `/team/[teamId]`

**Live news feed (right):**
- Scrolling feed of status-affecting news items across all teams
- Each item shows: category badge (color-coded), timestamp, player name + position + team, description
- Filter pills at top: Injuries, Transactions, All
- News categories: INJURY, TRADE, SIGNING, IR, DEPTH_CHART, SUSPENSION, RETURN
- Click a player name in any news item → navigates to `/player/[playerId]`

### 2. Team Depth Chart Page (`/team/[teamId]`)

The full roster view for a single team.

**Layout:** Two-column — depth chart grid (left, ~65%), team news feed (right, ~35%).

**Team header:**
- Team name, emoji/logo placeholder, conference/division, record
- "Last updated" timestamp
- Filter tabs: All | Offense | Defense | Special Teams

**Depth chart grid (left):**
- Table format: Position | Starter | 2nd String | 3rd String
- Rows grouped by position group within the selected filter
- Starters shown with full detail (name, jersey number, height/weight)
- Backup players shown with name and jersey number only
- Injury status shown inline with color coding:
  - Red border + "OUT" badge + strikethrough name for players ruled out
  - Amber border + "QUESTIONABLE" badge for questionable players with injury note
  - Green border + "PROMOTED" badge + arrow for players promoted due to injury
- Click any player name → navigates to `/player/[playerId]`

**Offensive positions:** QB, RB, WR (x3), TE, LT, LG, C, RG, RT
**Defensive positions:** DE (x2), DT (x2), LB (x3), CB (x2), SS, FS
**Special teams:** K, P, KR, PR, LS

**Team news feed (right):**
- Same format as home page feed but filtered to this team only
- Same color-coded category badges

### 3. Player Detail Page (`/player/[playerId]`)

Everything about a single player's status and recent news.

**Layout:** Two-column — player info + news timeline (left, ~65%), context sidebar (right, ~35%).

**Breadcrumb:** Home > [Team Name] > [Player Name]

**Player header (left):**
- Photo placeholder, full name, active status badge
- Position rank (e.g., "QB1"), jersey number, team name
- Physical stats: height, weight, age, season number, college

**Current status card (left):**
- Prominent card showing current game-day status
- Color-coded border matching status (green=active, amber=questionable, red=out)
- Description of current situation (practice participation, expected availability)
- "Last verified" timestamp

**News timeline (left):**
- Chronological feed of all news items for this player
- Vertical timeline with color-coded dots
- Each item: date/time, headline, description, source attribution with link-out
- Past statuses shown with "WAS QUESTIONABLE" style badges to show progression

**Context sidebar (right):**
- **Depth chart position:** Shows all players at this position for the team (QB1, QB2, QB3) with current player highlighted. Click others to navigate.
- **Next game:** Opponent, date, time, venue in a compact card
- **Season stats:** 4 key position-relevant stats in a 2x2 grid (e.g., QB: Pass Yds, TDs, INTs, QBR; RB: Rush Yds, TDs, YPC, Receptions)

## Data Model

### Core Types

```typescript
type Conference = "AFC" | "NFC";
type Division = "East" | "North" | "South" | "West";

type NewsCategory =
  | "INJURY"
  | "TRADE"
  | "SIGNING"
  | "IR"
  | "DEPTH_CHART"
  | "SUSPENSION"
  | "RETURN";

type InjuryStatus =
  | "Active"
  | "Questionable"
  | "Doubtful"
  | "Out"
  | "IR"
  | "Suspended"
  | "Holdout";

type PositionGroup = "offense" | "defense" | "specialTeams";

interface Team {
  id: string;                    // e.g., "KC"
  name: string;                  // e.g., "Chiefs"
  fullName: string;              // e.g., "Kansas City Chiefs"
  conference: Conference;
  division: Division;
  record: string;                // e.g., "5-1"
  logo: string;                  // emoji placeholder for MVP
  lastUpdated: string;           // ISO timestamp
}

interface Player {
  id: string;
  name: string;
  team: string;                  // team ID
  position: string;              // e.g., "QB", "WR", "LT"
  positionGroup: PositionGroup;
  depthOrder: number;            // 1 = starter, 2 = backup, etc.
  jerseyNumber: number;
  height: string;
  weight: string;
  age: number;
  college: string;
  experience: number;            // years in NFL
  injuryStatus: InjuryStatus;
  injuryDetail?: string;         // e.g., "Knee — Limited practice Thu"
  stats: Record<string, number>; // position-relevant season stats
}

interface NewsItem {
  id: string;
  playerId: string;
  playerName: string;
  team: string;                  // team ID
  position: string;
  category: NewsCategory;
  headline: string;
  description: string;
  source?: string;               // e.g., "Adam Teicher, ESPN"
  sourceUrl?: string;
  timestamp: string;             // ISO timestamp
}

interface DepthChartEntry {
  position: string;
  positionGroup: PositionGroup;
  players: Player[];             // ordered by depthOrder
}

interface TeamRoster {
  team: Team;
  depthChart: DepthChartEntry[];
  news: NewsItem[];
}
```

### RosterService Interface

```typescript
interface RosterService {
  getAllTeams(): Team[];
  getTeam(teamId: string): Team | undefined;
  getTeamRoster(teamId: string): TeamRoster | undefined;
  getPlayer(playerId: string): Player | undefined;
  getPlayerNews(playerId: string): NewsItem[];
  getTeamNews(teamId: string): NewsItem[];
  getAllNews(options?: { category?: NewsCategory; limit?: number }): NewsItem[];
  searchPlayers(query: string): Player[];
  searchTeams(query: string): Team[];
  getLastVerified(): string;     // ISO timestamp
}
```

## Mock Data Requirements

**Teams:** All 32 NFL teams with correct conference/division assignments.

**Players:** At minimum, starters and key backups for every team. Focus depth on 4-6 "showcase" teams (e.g., Chiefs, Eagles, Cowboys, 49ers, Bills, Dolphins) with full 3-deep depth charts. Other teams can have starters + 1 backup per position.

**News items:** 40-60 items across all teams covering all news categories. Include a mix of:
- Active injuries with various statuses (questionable, doubtful, out, IR)
- Recent trades and signings
- Depth chart promotions/demotions
- At least one suspension and one holdout
- Varied timestamps (minutes ago, hours ago, days ago, weeks ago)

**Player stats:** Basic season stats appropriate to position (passing for QBs, rushing for RBs, receiving for WRs/TEs, tackles for defenders, etc.).

## Visual Design

**Theme:** Dark background (#0a0f1a or similar deep navy-black). Minimal borders, subtle card backgrounds. High contrast text on dark.

**Color system:**
- Red (#ef4444): injuries, IR, OUT status
- Amber (#f59e0b): questionable, doubtful
- Green (#4ade80): active, promoted, return, healthy
- Blue (#3b82f6): trades, transactions, contract news
- White/gray hierarchy for text (primary → secondary → muted)

**Typography:** Clean sans-serif. One display font for headings, one body font for everything else. Monospace for small labels/timestamps.

**Key visual patterns:**
- Color-coded left border on depth chart rows with injury status
- Category badges (small pill-shaped, colored background) on news items
- Subtle glow/highlight border on team cards with breaking news
- Timeline dots on player news timeline
- Minimal use of icons — color and typography carry the hierarchy

## What's NOT in Scope

- Mobile-optimized layout (desktop-first; revisit after MVP)
- User accounts, login, or personalization
- Push notifications or alerts
- Fantasy projections, rankings, or advice
- Betting lines or odds
- Game scores or live game tracking
- Detailed player profiles beyond basic stats
- Historical data or season archives
- Other sports (architecture supports it, but NFL only for now)
- Real API integration (mock data only for MVP)
