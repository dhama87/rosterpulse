# RosterPulse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a no-clutter NFL roster dashboard showing all 32 teams' starters by position with real-time news affecting player availability.

**Architecture:** Next.js App Router with TypeScript and Tailwind CSS 4. MockRosterService reads from JSON files behind a RosterService interface (swap for real API later). Client-side polling for news feed freshness.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS 4, Jest + ts-jest

**Key Next.js 16 API Notes (from `node_modules/next/dist/docs/`):**
- Dynamic route `params` is `Promise<{ id: string }>` — must use `async/await` in server components or `use()` in client components
- `searchParams` is also a `Promise` — same pattern
- `notFound()` function from `next/navigation` triggers `not-found.tsx` rendering
- Font imports: `import { Inter } from 'next/font/google'` — call as function, use `.className`
- Tailwind CSS 4 uses `@theme` block in globals.css, NOT `tailwind.config.ts`

---

## Task 1: Project Reset & Dark Theme Setup

**Goal:** Remove all MedCode files, establish RosterPulse dark theme foundation.

### Steps

- [ ] **1.1** Delete all MedCode source files:

```bash
rm -rf src/app src/components src/data src/services src/types src/__tests__
```

- [ ] **1.2** Recreate directory structure:

```bash
mkdir -p src/app src/components src/data src/services/__tests__ src/types
```

- [ ] **1.3** Create `src/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-bg: #0a0f1a;
  --color-bg-card: #111827;
  --color-bg-card-hover: #1a2235;
  --color-border: rgba(255, 255, 255, 0.08);
  --color-border-highlight: rgba(255, 255, 255, 0.15);
  --color-text-primary: #f1f5f9;
  --color-text-secondary: rgba(255, 255, 255, 0.6);
  --color-text-muted: rgba(255, 255, 255, 0.35);
  --color-status-red: #ef4444;
  --color-status-amber: #f59e0b;
  --color-status-green: #4ade80;
  --color-status-blue: #3b82f6;
  --color-status-red-bg: rgba(239, 68, 68, 0.12);
  --color-status-amber-bg: rgba(245, 158, 11, 0.12);
  --color-status-green-bg: rgba(74, 222, 128, 0.12);
  --color-status-blue-bg: rgba(59, 130, 246, 0.12);
  --font-display: var(--font-display-var), "Inter", system-ui, sans-serif;
  --font-body: var(--font-body-var), "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
}

/* Scrollbar styling for dark theme */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
```

- [ ] **1.4** Create `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body-var",
});

export const metadata: Metadata = {
  title: "RosterPulse — NFL Roster Dashboard",
  description:
    "Real-time NFL roster and depth chart dashboard. Every team, every starter, every status change.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-body antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **1.5** Create `src/app/page.tsx`:

```tsx
export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-3xl font-bold text-text-primary">RosterPulse</h1>
    </div>
  );
}
```

- [ ] **1.6** Verify build:

```bash
npm run build
```

- [ ] **1.7** Commit:

```bash
git add -A && git commit -m "chore: reset project from MedCode to RosterPulse with dark theme"
```

---

## Task 2: TypeScript Types

**Goal:** Define all data model types from the design spec.

### Steps

- [ ] **2.1** Create `src/types/index.ts`:

```typescript
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
```

- [ ] **2.2** Verify types compile:

```bash
npx tsc --noEmit
```

- [ ] **2.3** Commit:

```bash
git add src/types/index.ts && git commit -m "feat: add TypeScript types for RosterPulse data model"
```

---

## Task 3: Mock Data — Teams

**Goal:** Create typed data for all 32 NFL teams with correct conference/division assignments.

### Steps

- [ ] **3.1** Create `src/data/teams.ts`:

```typescript
import { Team } from "@/types";

export const teams: Team[] = [
  // === AFC East ===
  {
    id: "BUF",
    name: "Bills",
    fullName: "Buffalo Bills",
    conference: "AFC",
    division: "East",
    record: "13-4",
    logo: "\ud83e\udd2c",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "MIA",
    name: "Dolphins",
    fullName: "Miami Dolphins",
    conference: "AFC",
    division: "East",
    record: "11-6",
    logo: "\ud83d\udc2c",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "NE",
    name: "Patriots",
    fullName: "New England Patriots",
    conference: "AFC",
    division: "East",
    record: "4-13",
    logo: "\ud83c\uddfa\ud83c\uddf8",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "NYJ",
    name: "Jets",
    fullName: "New York Jets",
    conference: "AFC",
    division: "East",
    record: "5-12",
    logo: "\u2708\ufe0f",
    lastUpdated: new Date().toISOString(),
  },
  // === AFC North ===
  {
    id: "BAL",
    name: "Ravens",
    fullName: "Baltimore Ravens",
    conference: "AFC",
    division: "North",
    record: "12-5",
    logo: "\ud83e\udd85",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "CIN",
    name: "Bengals",
    fullName: "Cincinnati Bengals",
    conference: "AFC",
    division: "North",
    record: "9-8",
    logo: "\ud83d\udc2f",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "CLE",
    name: "Browns",
    fullName: "Cleveland Browns",
    conference: "AFC",
    division: "North",
    record: "3-14",
    logo: "\ud83d\udfe0",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "PIT",
    name: "Steelers",
    fullName: "Pittsburgh Steelers",
    conference: "AFC",
    division: "North",
    record: "10-7",
    logo: "\ud83d\udfe1",
    lastUpdated: new Date().toISOString(),
  },
  // === AFC South ===
  {
    id: "HOU",
    name: "Texans",
    fullName: "Houston Texans",
    conference: "AFC",
    division: "South",
    record: "10-7",
    logo: "\ud83e\udd20",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "IND",
    name: "Colts",
    fullName: "Indianapolis Colts",
    conference: "AFC",
    division: "South",
    record: "8-9",
    logo: "\ud83d\udc34",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "JAX",
    name: "Jaguars",
    fullName: "Jacksonville Jaguars",
    conference: "AFC",
    division: "South",
    record: "4-13",
    logo: "\ud83d\udc06",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "TEN",
    name: "Titans",
    fullName: "Tennessee Titans",
    conference: "AFC",
    division: "South",
    record: "3-14",
    logo: "\u2694\ufe0f",
    lastUpdated: new Date().toISOString(),
  },
  // === AFC West ===
  {
    id: "KC",
    name: "Chiefs",
    fullName: "Kansas City Chiefs",
    conference: "AFC",
    division: "West",
    record: "15-2",
    logo: "\ud83c\udff9",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "LV",
    name: "Raiders",
    fullName: "Las Vegas Raiders",
    conference: "AFC",
    division: "West",
    record: "4-13",
    logo: "\u2620\ufe0f",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "LAC",
    name: "Chargers",
    fullName: "Los Angeles Chargers",
    conference: "AFC",
    division: "West",
    record: "11-6",
    logo: "\u26a1",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "DEN",
    name: "Broncos",
    fullName: "Denver Broncos",
    conference: "AFC",
    division: "West",
    record: "10-7",
    logo: "\ud83d\udc0e",
    lastUpdated: new Date().toISOString(),
  },
  // === NFC East ===
  {
    id: "DAL",
    name: "Cowboys",
    fullName: "Dallas Cowboys",
    conference: "NFC",
    division: "East",
    record: "7-10",
    logo: "\u2b50",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "NYG",
    name: "Giants",
    fullName: "New York Giants",
    conference: "NFC",
    division: "East",
    record: "3-14",
    logo: "\ud83d\uddfd",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "PHI",
    name: "Eagles",
    fullName: "Philadelphia Eagles",
    conference: "NFC",
    division: "East",
    record: "14-3",
    logo: "\ud83e\udd85",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "WAS",
    name: "Commanders",
    fullName: "Washington Commanders",
    conference: "NFC",
    division: "East",
    record: "12-5",
    logo: "\ud83c\udfdb\ufe0f",
    lastUpdated: new Date().toISOString(),
  },
  // === NFC North ===
  {
    id: "CHI",
    name: "Bears",
    fullName: "Chicago Bears",
    conference: "NFC",
    division: "North",
    record: "5-12",
    logo: "\ud83d\udc3b",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "DET",
    name: "Lions",
    fullName: "Detroit Lions",
    conference: "NFC",
    division: "North",
    record: "15-2",
    logo: "\ud83e\udd81",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "GB",
    name: "Packers",
    fullName: "Green Bay Packers",
    conference: "NFC",
    division: "North",
    record: "11-6",
    logo: "\ud83e\uddc0",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "MIN",
    name: "Vikings",
    fullName: "Minnesota Vikings",
    conference: "NFC",
    division: "North",
    record: "14-3",
    logo: "\u2693",
    lastUpdated: new Date().toISOString(),
  },
  // === NFC South ===
  {
    id: "ATL",
    name: "Falcons",
    fullName: "Atlanta Falcons",
    conference: "NFC",
    division: "South",
    record: "8-9",
    logo: "\ud83e\udd85",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "CAR",
    name: "Panthers",
    fullName: "Carolina Panthers",
    conference: "NFC",
    division: "South",
    record: "4-13",
    logo: "\ud83d\udc3e",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "NO",
    name: "Saints",
    fullName: "New Orleans Saints",
    conference: "NFC",
    division: "South",
    record: "5-12",
    logo: "\u269c\ufe0f",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "TB",
    name: "Buccaneers",
    fullName: "Tampa Bay Buccaneers",
    conference: "NFC",
    division: "South",
    record: "10-7",
    logo: "\ud83c\udff4\u200d\u2620\ufe0f",
    lastUpdated: new Date().toISOString(),
  },
  // === NFC West ===
  {
    id: "ARI",
    name: "Cardinals",
    fullName: "Arizona Cardinals",
    conference: "NFC",
    division: "West",
    record: "8-9",
    logo: "\ud83d\udc26",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "LAR",
    name: "Rams",
    fullName: "Los Angeles Rams",
    conference: "NFC",
    division: "West",
    record: "10-7",
    logo: "\ud83d\udc0f",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "SF",
    name: "49ers",
    fullName: "San Francisco 49ers",
    conference: "NFC",
    division: "West",
    record: "6-11",
    logo: "\ud83c\udf09",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "SEA",
    name: "Seahawks",
    fullName: "Seattle Seahawks",
    conference: "NFC",
    division: "West",
    record: "10-7",
    logo: "\ud83e\udd85",
    lastUpdated: new Date().toISOString(),
  },
];
```

- [ ] **3.2** Verify:

```bash
npx tsc --noEmit
```

- [ ] **3.3** Commit:

```bash
git add src/data/teams.ts && git commit -m "feat: add all 32 NFL teams data"
```

---

## Task 4: Mock Data — Players

**Goal:** Create realistic player data for all 32 teams. Showcase teams (KC, PHI, DAL, SF, BUF, MIA) get full 3-deep depth charts. Other teams get starters + 1 backup for key positions.

### Steps

- [ ] **4.1** Create `src/data/players.ts` with the full player dataset.

This is a large file. The implementing agent MUST include ALL players for ALL 32 teams. Below is the exact structure and content.

**Positions per team:**
- Offense (11 positions): QB, RB, WR1, WR2, WR3, TE, LT, LG, C, RG, RT
- Defense (11 positions): DE1, DE2, DT1, DT2, LB1, LB2, LB3, CB1, CB2, SS, FS
- Special Teams (5 positions): K, P, KR, PR, LS

**Showcase teams** (KC, PHI, DAL, SF, BUF, MIA): 3 deep at every position = ~81 players each.
**Other teams** (26 teams): Starter + 1 backup at each position = ~54 players each.

**Requirements:**
- Use REAL 2025 NFL player names and jersey numbers
- Include varied injury statuses: at least 2 players per showcase team with non-Active status
- Stats must be position-appropriate (passing yards/TDs for QBs, rushing yards for RBs, etc.)
- Player IDs follow format: `{teamId}-{position}-{depthOrder}` (e.g., `KC-QB-1` for Patrick Mahomes)

```typescript
import { Player } from "@/types";

// Helper to generate player ID
const pid = (team: string, position: string, depth: number): string =>
  `${team}-${position}-${depth}`;

export const players: Player[] = [
  // =============================================
  // KANSAS CITY CHIEFS (Showcase — full 3-deep)
  // =============================================

  // --- Offense ---
  // QB
  {
    id: pid("KC", "QB", 1),
    name: "Patrick Mahomes",
    team: "KC",
    position: "QB",
    positionGroup: "offense",
    depthOrder: 1,
    jerseyNumber: 15,
    height: "6-2",
    weight: "225",
    age: 29,
    college: "Texas Tech",
    experience: 8,
    injuryStatus: "Active",
    stats: { passYds: 4183, passTD: 30, int: 11, qbr: 94.2 },
  },
  {
    id: pid("KC", "QB", 2),
    name: "Carson Wentz",
    team: "KC",
    position: "QB",
    positionGroup: "offense",
    depthOrder: 2,
    jerseyNumber: 11,
    height: "6-5",
    weight: "237",
    age: 32,
    college: "North Dakota State",
    experience: 9,
    injuryStatus: "Active",
    stats: { passYds: 0, passTD: 0, int: 0, qbr: 0 },
  },
  {
    id: pid("KC", "QB", 3),
    name: "Chris Oladokun",
    team: "KC",
    position: "QB",
    positionGroup: "offense",
    depthOrder: 3,
    jerseyNumber: 6,
    height: "6-1",
    weight: "210",
    age: 27,
    college: "South Dakota State",
    experience: 3,
    injuryStatus: "Active",
    stats: { passYds: 0, passTD: 0, int: 0, qbr: 0 },
  },
  // RB
  {
    id: pid("KC", "RB", 1),
    name: "Isiah Pacheco",
    team: "KC",
    position: "RB",
    positionGroup: "offense",
    depthOrder: 1,
    jerseyNumber: 10,
    height: "5-10",
    weight: "215",
    age: 25,
    college: "Rutgers",
    experience: 3,
    injuryStatus: "Active",
    stats: { rushYds: 1012, rushTD: 7, ypc: 4.5, rec: 32 },
  },
  {
    id: pid("KC", "RB", 2),
    name: "Clyde Edwards-Helaire",
    team: "KC",
    position: "RB",
    positionGroup: "offense",
    depthOrder: 2,
    jerseyNumber: 25,
    height: "5-7",
    weight: "207",
    age: 25,
    college: "LSU",
    experience: 5,
    injuryStatus: "Questionable",
    injuryDetail: "Knee \u2014 Limited practice Thu",
    stats: { rushYds: 310, rushTD: 2, ypc: 3.8, rec: 18 },
  },
  {
    id: pid("KC", "RB", 3),
    name: "Deneric Prince",
    team: "KC",
    position: "RB",
    positionGroup: "offense",
    depthOrder: 3,
    jerseyNumber: 34,
    height: "6-0",
    weight: "210",
    age: 24,
    college: "Tulsa",
    experience: 2,
    injuryStatus: "Active",
    stats: { rushYds: 85, rushTD: 0, ypc: 4.0, rec: 5 },
  },
  // WR1
  {
    id: pid("KC", "WR1", 1),
    name: "Rashee Rice",
    team: "KC",
    position: "WR1",
    positionGroup: "offense",
    depthOrder: 1,
    jerseyNumber: 4,
    height: "6-1",
    weight: "200",
    age: 24,
    college: "SMU",
    experience: 2,
    injuryStatus: "Suspended",
    injuryDetail: "Suspended 6 games \u2014 off-field conduct",
    stats: { recYds: 0, recTD: 0, rec: 0, targets: 0 },
  },
  {
    id: pid("KC", "WR1", 2),
    name: "Xavier Worthy",
    team: "KC",
    position: "WR1",
    positionGroup: "offense",
    depthOrder: 2,
    jerseyNumber: 1,
    height: "5-11",
    weight: "165",
    age: 21,
    college: "Texas",
    experience: 1,
    injuryStatus: "Active",
    stats: { recYds: 780, recTD: 6, rec: 52, targets: 75 },
  },
  {
    id: pid("KC", "WR1", 3),
    name: "Mecole Hardman",
    team: "KC",
    position: "WR1",
    positionGroup: "offense",
    depthOrder: 3,
    jerseyNumber: 12,
    height: "5-10",
    weight: "187",
    age: 26,
    college: "Georgia",
    experience: 6,
    injuryStatus: "Active",
    stats: { recYds: 220, recTD: 2, rec: 18, targets: 28 },
  },
  // WR2
  {
    id: pid("KC", "WR2", 1),
    name: "Marquise Brown",
    team: "KC",
    position: "WR2",
    positionGroup: "offense",
    depthOrder: 1,
    jerseyNumber: 5,
    height: "5-9",
    weight: "170",
    age: 27,
    college: "Oklahoma",
    experience: 6,
    injuryStatus: "Active",
    stats: { recYds: 650, recTD: 5, rec: 45, targets: 68 },
  },
  {
    id: pid("KC", "WR2", 2),
    name: "Kadarius Toney",
    team: "KC",
    position: "WR2",
    positionGroup: "offense",
    depthOrder: 2,
    jerseyNumber: 19,
    height: "6-0",
    weight: "193",
    age: 25,
    college: "Florida",
    experience: 4,
    injuryStatus: "Active",
    stats: { recYds: 150, recTD: 1, rec: 12, targets: 20 },
  },
  {
    id: pid("KC", "WR2", 3),
    name: "Justyn Ross",
    team: "KC",
    position: "WR2",
    positionGroup: "offense",
    depthOrder: 3,
    jerseyNumber: 8,
    height: "6-4",
    weight: "210",
    age: 24,
    college: "Clemson",
    experience: 3,
    injuryStatus: "Active",
    stats: { recYds: 80, recTD: 0, rec: 6, targets: 10 },
  },
  // WR3
  {
    id: pid("KC", "WR3", 1),
    name: "Skyy Moore",
    team: "KC",
    position: "WR3",
    positionGroup: "offense",
    depthOrder: 1,
    jerseyNumber: 24,
    height: "5-10",
    weight: "195",
    age: 24,
    college: "Western Michigan",
    experience: 3,
    injuryStatus: "Active",
    stats: { recYds: 320, recTD: 2, rec: 25, targets: 38 },
  },
  {
    id: pid("KC", "WR3", 2),
    name: "Nikko Remigio",
    team: "KC",
    position: "WR3",
    positionGroup: "offense",
    depthOrder: 2,
    jerseyNumber: 84,
    height: "5-11",
    weight: "185",
    age: 25,
    college: "Fresno State",
    experience: 1,
    injuryStatus: "Active",
    stats: { recYds: 45, recTD: 0, rec: 4, targets: 7 },
  },
  {
    id: pid("KC", "WR3", 3),
    name: "Montrell Washington",
    team: "KC",
    position: "WR3",
    positionGroup: "offense",
    depthOrder: 3,
    jerseyNumber: 85,
    height: "5-10",
    weight: "170",
    age: 25,
    college: "Samford",
    experience: 3,
    injuryStatus: "Active",
    stats: { recYds: 20, recTD: 0, rec: 2, targets: 4 },
  },
  // TE
  {
    id: pid("KC", "TE", 1),
    name: "Travis Kelce",
    team: "KC",
    position: "TE",
    positionGroup: "offense",
    depthOrder: 1,
    jerseyNumber: 87,
    height: "6-5",
    weight: "250",
    age: 35,
    college: "Cincinnati",
    experience: 12,
    injuryStatus: "Active",
    stats: { recYds: 823, recTD: 5, rec: 75, targets: 98 },
  },
  {
    id: pid("KC", "TE", 2),
    name: "Noah Gray",
    team: "KC",
    position: "TE",
    positionGroup: "offense",
    depthOrder: 2,
    jerseyNumber: 83,
    height: "6-3",
    weight: "240",
    age: 25,
    college: "Duke",
    experience: 4,
    injuryStatus: "Active",
    stats: { recYds: 210, recTD: 2, rec: 22, targets: 30 },
  },
  {
    id: pid("KC", "TE", 3),
    name: "Jody Fortson",
    team: "KC",
    position: "TE",
    positionGroup: "offense",
    depthOrder: 3,
    jerseyNumber: 88,
    height: "6-4",
    weight: "230",
    age: 28,
    college: "Valdosta State",
    experience: 4,
    injuryStatus: "IR",
    injuryDetail: "Achilles \u2014 placed on IR Week 6",
    stats: { recYds: 45, recTD: 1, rec: 5, targets: 8 },
  },
  // LT
  {
    id: pid("KC", "LT", 1),
    name: "Donovan Smith",
    team: "KC",
    position: "LT",
    positionGroup: "offense",
    depthOrder: 1,
    jerseyNumber: 76,
    height: "6-6",
    weight: "338",
    age: 31,
    college: "Penn State",
    experience: 10,
    injuryStatus: "Active",
    stats: { gamesStarted: 15, sacks: 3 },
  },
  {
    id: pid("KC", "LT", 2),
    name: "Wanya Morris",
    team: "KC",
    position: "LT",
    positionGroup: "offense",
    depthOrder: 2,
    jerseyNumber: 68,
    height: "6-5",
    weight: "310",
    age: 24,
    college: "Oklahoma",
    experience: 2,
    injuryStatus: "Active",
    stats: { gamesStarted: 2, sacks: 0 },
  },
  {
    id: pid("KC", "LT", 3),
    name: "Ethan Driskell",
    team: "KC",
    position: "LT",
    positionGroup: "offense",
    depthOrder: 3,
    jerseyNumber: 72,
    height: "6-6",
    weight: "315",
    age: 23,
    college: "UCF",
    experience: 1,
    injuryStatus: "Active",
    stats: { gamesStarted: 0, sacks: 0 },
  },
  // LG
  {
    id: pid("KC", "LG", 1),
    name: "Joe Thuney",
    team: "KC",
    position: "LG",
    positionGroup: "offense",
    depthOrder: 1,
    jerseyNumber: 62,
    height: "6-5",
    weight: "308",
    age: 32,
    college: "NC State",
    experience: 9,
    injuryStatus: "Active",
    stats: { gamesStarted: 16, sacks: 1 },
  },
  {
    id: pid("KC", "LG", 2),
    name: "Nick Allegretti",
    team: "KC",
    position: "LG",
    positionGroup: "offense",
    depthOrder: 2,
    jerseyNumber: 73,
    height: "6-4",
    weight: "325",
    age: 28,
    college: "Illinois",
    experience: 5,
    injuryStatus: "Active",
    stats: { gamesStarted: 3, sacks: 0 },
  },
  {
    id: pid("KC", "LG", 3),
    name: "Mike Caliendo",
    team: "KC",
    position: "LG",
    positionGroup: "offense",
    depthOrder: 3,
    jerseyNumber: 64,
    height: "6-4",
    weight: "305",
    age: 24,
    college: "Western Michigan",
    experience: 1,
    injuryStatus: "Active",
    stats: { gamesStarted: 0, sacks: 0 },
  },
  // C
  {
    id: pid("KC", "C", 1),
    name: "Creed Humphrey",
    team: "KC",
    position: "C",
    positionGroup: "offense",
    depthOrder: 1,
    jerseyNumber: 52,
    height: "6-5",
    weight: "320",
    age: 25,
    college: "Oklahoma",
    experience: 4,
    injuryStatus: "Active",
    stats: { gamesStarted: 17, sacks: 0 },
  },
  {
    id: pid("KC", "C", 2),
    name: "Hunter Nourzad",
    team: "KC",
    position: "C",
    positionGroup: "offense",
    depthOrder: 2,
    jerseyNumber: 67,
    height: "6-3",
    weight: "305",
    age: 25,
    college: "Portland State",
    experience: 1,
    injuryStatus: "Active",
    stats: { gamesStarted: 1, sacks: 0 },
  },
  {
    id: pid("KC", "C", 3),
    name: "Austin Reiter",
    team: "KC",
    position: "C",
    positionGroup: "offense",
    depthOrder: 3,
    jerseyNumber: 71,
    height: "6-3",
    weight: "305",
    age: 33,
    college: "South Florida",
    experience: 9,
    injuryStatus: "Active",
    stats: { gamesStarted: 0, sacks: 0 },
  },
  // RG
  {
    id: pid("KC", "RG", 1),
    name: "Trey Smith",
    team: "KC",
    position: "RG",
    positionGroup: "offense",
    depthOrder: 1,
    jerseyNumber: 65,
    height: "6-6",
    weight: "320",
    age: 25,
    college: "Tennessee",
    experience: 4,
    injuryStatus: "Active",
    stats: { gamesStarted: 17, sacks: 1 },
  },
  {
    id: pid("KC", "RG", 2),
    name: "Mike Caliendo",
    team: "KC",
    position: "RG",
    positionGroup: "offense",
    depthOrder: 2,
    jerseyNumber: 64,
    height: "6-4",
    weight: "305",
    age: 24,
    college: "Western Michigan",
    experience: 1,
    injuryStatus: "Active",
    stats: { gamesStarted: 1, sacks: 0 },
  },
  {
    id: pid("KC", "RG", 3),
    name: "C.J. Hanson",
    team: "KC",
    position: "RG",
    positionGroup: "offense",
    depthOrder: 3,
    jerseyNumber: 70,
    height: "6-5",
    weight: "315",
    age: 24,
    college: "Boise State",
    experience: 1,
    injuryStatus: "Active",
    stats: { gamesStarted: 0, sacks: 0 },
  },
  // RT
  {
    id: pid("KC", "RT", 1),
    name: "Jawaan Taylor",
    team: "KC",
    position: "RT",
    positionGroup: "offense",
    depthOrder: 1,
    jerseyNumber: 74,
    height: "6-5",
    weight: "312",
    age: 26,
    college: "Florida",
    experience: 6,
    injuryStatus: "Questionable",
    injuryDetail: "Knee \u2014 Limited practice Wed/Thu",
    stats: { gamesStarted: 14, sacks: 4 },
  },
  {
    id: pid("KC", "RT", 2),
    name: "Wanya Morris",
    team: "KC",
    position: "RT",
    positionGroup: "offense",
    depthOrder: 2,
    jerseyNumber: 68,
    height: "6-5",
    weight: "310",
    age: 24,
    college: "Oklahoma",
    experience: 2,
    injuryStatus: "Active",
    stats: { gamesStarted: 3, sacks: 1 },
  },
  {
    id: pid("KC", "RT", 3),
    name: "Ethan Driskell",
    team: "KC",
    position: "RT",
    positionGroup: "offense",
    depthOrder: 3,
    jerseyNumber: 72,
    height: "6-6",
    weight: "315",
    age: 23,
    college: "UCF",
    experience: 1,
    injuryStatus: "Active",
    stats: { gamesStarted: 0, sacks: 0 },
  },

  // --- Defense ---
  // DE1
  {
    id: pid("KC", "DE1", 1),
    name: "George Karlaftis",
    team: "KC",
    position: "DE1",
    positionGroup: "defense",
    depthOrder: 1,
    jerseyNumber: 56,
    height: "6-4",
    weight: "275",
    age: 24,
    college: "Purdue",
    experience: 3,
    injuryStatus: "Active",
    stats: { tackles: 52, sacks: 8.5, tfl: 10, ff: 2 },
  },
  {
    id: pid("KC", "DE1", 2),
    name: "Felix Anudike-Uzomah",
    team: "KC",
    position: "DE1",
    positionGroup: "defense",
    depthOrder: 2,
    jerseyNumber: 91,
    height: "6-3",
    weight: "255",
    age: 23,
    college: "Kansas State",
    experience: 2,
    injuryStatus: "Active",
    stats: { tackles: 28, sacks: 4.0, tfl: 5, ff: 1 },
  },
  {
    id: pid("KC", "DE1", 3),
    name: "Malik Herring",
    team: "KC",
    position: "DE1",
    positionGroup: "defense",
    depthOrder: 3,
    jerseyNumber: 95,
    height: "6-3",
    weight: "280",
    age: 27,
    college: "Georgia",
    experience: 3,
    injuryStatus: "Active",
    stats: { tackles: 10, sacks: 1.0, tfl: 2, ff: 0 },
  },
  // DE2
  {
    id: pid("KC", "DE2", 1),
    name: "Charles Omenihu",
    team: "KC",
    position: "DE2",
    positionGroup: "defense",
    depthOrder: 1,
    jerseyNumber: 90,
    height: "6-5",
    weight: "280",
    age: 27,
    college: "Texas",
    experience: 6,
    injuryStatus: "Active",
    stats: { tackles: 38, sacks: 6.5, tfl: 8, ff: 1 },
  },
  {
    id: pid("KC", "DE2", 2),
    name: "BJ Thompson",
    team: "KC",
    position: "DE2",
    positionGroup: "defense",
    depthOrder: 2,
    jerseyNumber: 98,
    height: "6-5",
    weight: "259",
    age: 25,
    college: "Stephen F. Austin",
    experience: 3,
    injuryStatus: "Active",
    stats: { tackles: 15, sacks: 2.0, tfl: 3, ff: 0 },
  },
  {
    id: pid("KC", "DE2", 3),
    name: "Truman Jones",
    team: "KC",
    position: "DE2",
    positionGroup: "defense",
    depthOrder: 3,
    jerseyNumber: 92,
    height: "6-4",
    weight: "270",
    age: 23,
    college: "Virginia",
    experience: 1,
    injuryStatus: "Active",
    stats: { tackles: 5, sacks: 0.5, tfl: 1, ff: 0 },
  },
  // DT1
  {
    id: pid("KC", "DT1", 1),
    name: "Chris Jones",
    team: "KC",
    position: "DT1",
    positionGroup: "defense",
    depthOrder: 1,
    jerseyNumber: 95,
    height: "6-6",
    weight: "310",
    age: 30,
    college: "Mississippi State",
    experience: 8,
    injuryStatus: "Active",
    stats: { tackles: 48, sacks: 10.5, tfl: 12, ff: 3 },
  },
  {
    id: pid("KC", "DT1", 2),
    name: "Derrick Nnadi",
    team: "KC",
    position: "DT1",
    positionGroup: "defense",
    depthOrder: 2,
    jerseyNumber: 91,
    height: "6-0",
    weight: "325",
    age: 28,
    college: "Florida State",
    experience: 7,
    injuryStatus: "Active",
    stats: { tackles: 22, sacks: 1.0, tfl: 3, ff: 0 },
  },
  {
    id: pid("KC", "DT1", 3),
    name: "Tershawn Wharton",
    team: "KC",
    position: "DT1",
    positionGroup: "defense",
    depthOrder: 3,
    jerseyNumber: 98,
    height: "6-4",
    weight: "280",
    age: 27,
    college: "Missouri S&T",
    experience: 5,
    injuryStatus: "Active",
    stats: { tackles: 18, sacks: 2.0, tfl: 4, ff: 1 },
  },
  // DT2
  {
    id: pid("KC", "DT2", 1),
    name: "Mike Pennel",
    team: "KC",
    position: "DT2",
    positionGroup: "defense",
    depthOrder: 1,
    jerseyNumber: 64,
    height: "6-4",
    weight: "332",
    age: 32,
    college: "Colorado State-Pueblo",
    experience: 10,
    injuryStatus: "Active",
    stats: { tackles: 30, sacks: 1.5, tfl: 4, ff: 0 },
  },
  {
    id: pid("KC", "DT2", 2),
    name: "Tershawn Wharton",
    team: "KC",
    position: "DT2",
    positionGroup: "defense",
    depthOrder: 2,
    jerseyNumber: 98,
    height: "6-4",
    weight: "280",
    age: 27,
    college: "Missouri S&T",
    experience: 5,
    injuryStatus: "Active",
    stats: { tackles: 18, sacks: 2.0, tfl: 4, ff: 1 },
  },
  {
    id: pid("KC", "DT2", 3),
    name: "Neil Farrell Jr.",
    team: "KC",
    position: "DT2",
    positionGroup: "defense",
    depthOrder: 3,
    jerseyNumber: 77,
    height: "6-4",
    weight: "330",
    age: 26,
    college: "LSU",
    experience: 3,
    injuryStatus: "Active",
    stats: { tackles: 12, sacks: 0.5, tfl: 2, ff: 0 },
  },
  // LB1
  {
    id: pid("KC", "LB1", 1),
    name: "Nick Bolton",
    team: "KC",
    position: "LB1",
    positionGroup: "defense",
    depthOrder: 1,
    jerseyNumber: 32,
    height: "6-0",
    weight: "237",
    age: 24,
    college: "Missouri",
    experience: 4,
    injuryStatus: "Active",
    stats: { tackles: 120, sacks: 3.0, tfl: 8, int: 1 },
  },
  {
    id: pid("KC", "LB1", 2),
    name: "Jack Cochrane",
    team: "KC",
    position: "LB1",
    positionGroup: "defense",
    depthOrder: 2,
    jerseyNumber: 48,
    height: "6-1",
    weight: "230",
    age: 25,
    college: "South Dakota",
    experience: 2,
    injuryStatus: "Active",
    stats: { tackles: 25, sacks: 0.5, tfl: 2, int: 0 },
  },
  {
    id: pid("KC", "LB1", 3),
    name: "Curtis Jacobs",
    team: "KC",
    position: "LB1",
    positionGroup: "defense",
    depthOrder: 3,
    jerseyNumber: 44,
    height: "6-1",
    weight: "235",
    age: 23,
    college: "Penn State",
    experience: 1,
    injuryStatus: "Active",
    stats: { tackles: 8, sacks: 0, tfl: 1, int: 0 },
  },
  // LB2
  {
    id: pid("KC", "LB2", 1),
    name: "Drue Tranquill",
    team: "KC",
    position: "LB2",
    positionGroup: "defense",
    depthOrder: 1,
    jerseyNumber: 23,
    height: "6-2",
    weight: "234",
    age: 29,
    college: "Notre Dame",
    experience: 6,
    injuryStatus: "Active",
    stats: { tackles: 85, sacks: 2.0, tfl: 5, int: 1 },
  },
  {
    id: pid("KC", "LB2", 2),
    name: "Leo Chenal",
    team: "KC",
    position: "LB2",
    positionGroup: "defense",
    depthOrder: 2,
    jerseyNumber: 54,
    height: "6-2",
    weight: "261",
    age: 24,
    college: "Wisconsin",
    experience: 3,
    injuryStatus: "Active",
    stats: { tackles: 45, sacks: 1.5, tfl: 4, int: 0 },
  },
  {
    id: pid("KC", "LB2", 3),
    name: "Cole Christiansen",
    team: "KC",
    position: "LB2",
    positionGroup: "defense",
    depthOrder: 3,
    jerseyNumber: 50,
    height: "6-1",
    weight: "235",
    age: 27,
    college: "Army",
    experience: 3,
    injuryStatus: "Active",
    stats: { tackles: 10, sacks: 0, tfl: 1, int: 0 },
  },
  // LB3
  {
    id: pid("KC", "LB3", 1),
    name: "Leo Chenal",
    team: "KC",
    position: "LB3",
    positionGroup: "defense",
    depthOrder: 1,
    jerseyNumber: 54,
    height: "6-2",
    weight: "261",
    age: 24,
    college: "Wisconsin",
    experience: 3,
    injuryStatus: "Active",
    stats: { tackles: 45, sacks: 1.5, tfl: 4, int: 0 },
  },
  {
    id: pid("KC", "LB3", 2),
    name: "Jack Cochrane",
    team: "KC",
    position: "LB3",
    positionGroup: "defense",
    depthOrder: 2,
    jerseyNumber: 48,
    height: "6-1",
    weight: "230",
    age: 25,
    college: "South Dakota",
    experience: 2,
    injuryStatus: "Active",
    stats: { tackles: 25, sacks: 0.5, tfl: 2, int: 0 },
  },
  {
    id: pid("KC", "LB3", 3),
    name: "Curtis Jacobs",
    team: "KC",
    position: "LB3",
    positionGroup: "defense",
    depthOrder: 3,
    jerseyNumber: 44,
    height: "6-1",
    weight: "235",
    age: 23,
    college: "Penn State",
    experience: 1,
    injuryStatus: "Active",
    stats: { tackles: 8, sacks: 0, tfl: 1, int: 0 },
  },
  // CB1
  {
    id: pid("KC", "CB1", 1),
    name: "Trent McDuffie",
    team: "KC",
    position: "CB1",
    positionGroup: "defense",
    depthOrder: 1,
    jerseyNumber: 21,
    height: "5-11",
    weight: "193",
    age: 24,
    college: "Washington",
    experience: 3,
    injuryStatus: "Active",
    stats: { tackles: 58, int: 3, pd: 12, ff: 1 },
  },
  {
    id: pid("KC", "CB1", 2),
    name: "Joshua Williams",
    team: "KC",
    position: "CB1",
    positionGroup: "defense",
    depthOrder: 2,
    jerseyNumber: 23,
    height: "6-2",
    weight: "195",
    age: 25,
    college: "Fayetteville State",
    experience: 3,
    injuryStatus: "Active",
    stats: { tackles: 30, int: 1, pd: 6, ff: 0 },
  },
  {
    id: pid("KC", "CB1", 3),
    name: "Nic Jones",
    team: "KC",
    position: "CB1",
    positionGroup: "defense",
    depthOrder: 3,
    jerseyNumber: 2,
    height: "6-0",
    weight: "195",
    age: 25,
    college: "Ball State",
    experience: 2,
    injuryStatus: "Active",
    stats: { tackles: 12, int: 0, pd: 3, ff: 0 },
  },
  // CB2
  {
    id: pid("KC", "CB2", 1),
    name: "Jaylen Watson",
    team: "KC",
    position: "CB2",
    positionGroup: "defense",
    depthOrder: 1,
    jerseyNumber: 35,
    height: "6-2",
    weight: "195",
    age: 25,
    college: "Washington State",
    experience: 3,
    injuryStatus: "Out",
    injuryDetail: "Torn ACL \u2014 Out for season",
    stats: { tackles: 22, int: 1, pd: 5, ff: 0 },
  },
  {
    id: pid("KC", "CB2", 2),
    name: "Nazeeh Johnson",
    team: "KC",
    position: "CB2",
    positionGroup: "defense",
    depthOrder: 2,
    jerseyNumber: 38,
    height: "6-1",
    weight: "190",
    age: 24,
    college: "Marshall",
    experience: 2,
    injuryStatus: "Active",
    stats: { tackles: 18, int: 0, pd: 4, ff: 0 },
  },
  {
    id: pid("KC", "CB2", 3),
    name: "Ekow Boye-Doe",
    team: "KC",
    position: "CB2",
    positionGroup: "defense",
    depthOrder: 3,
    jerseyNumber: 37,
    height: "6-1",
    weight: "190",
    age: 24,
    college: "Kansas State",
    experience: 1,
    injuryStatus: "Active",
    stats: { tackles: 5, int: 0, pd: 1, ff: 0 },
  },
  // SS
  {
    id: pid("KC", "SS", 1),
    name: "Justin Reid",
    team: "KC",
    position: "SS",
    positionGroup: "defense",
    depthOrder: 1,
    jerseyNumber: 20,
    height: "6-1",
    weight: "203",
    age: 27,
    college: "Stanford",
    experience: 7,
    injuryStatus: "Active",
    stats: { tackles: 75, int: 2, pd: 8, ff: 1 },
  },
  {
    id: pid("KC", "SS", 2),
    name: "Chamarri Conner",
    team: "KC",
    position: "SS",
    positionGroup: "defense",
    depthOrder: 2,
    jerseyNumber: 27,
    height: "5-11",
    weight: "205",
    age: 24,
    college: "Virginia Tech",
    experience: 2,
    injuryStatus: "Active",
    stats: { tackles: 30, int: 0, pd: 3, ff: 0 },
  },
  {
    id: pid("KC", "SS", 3),
    name: "Jaden Hicks",
    team: "KC",
    position: "SS",
    positionGroup: "defense",
    depthOrder: 3,
    jerseyNumber: 43,
    height: "6-1",
    weight: "210",
    age: 22,
    college: "Washington State",
    experience: 1,
    injuryStatus: "Active",
    stats: { tackles: 8, int: 0, pd: 1, ff: 0 },
  },
  // FS
  {
    id: pid("KC", "FS", 1),
    name: "Bryan Cook",
    team: "KC",
    position: "FS",
    positionGroup: "defense",
    depthOrder: 1,
    jerseyNumber: 6,
    height: "6-1",
    weight: "206",
    age: 25,
    college: "Cincinnati",
    experience: 3,
    injuryStatus: "Active",
    stats: { tackles: 65, int: 2, pd: 7, ff: 1 },
  },
  {
    id: pid("KC", "FS", 2),
    name: "Chamarri Conner",
    team: "KC",
    position: "FS",
    positionGroup: "defense",
    depthOrder: 2,
    jerseyNumber: 27,
    height: "5-11",
    weight: "205",
    age: 24,
    college: "Virginia Tech",
    experience: 2,
    injuryStatus: "Active",
    stats: { tackles: 30, int: 0, pd: 3, ff: 0 },
  },
  {
    id: pid("KC", "FS", 3),
    name: "Jaden Hicks",
    team: "KC",
    position: "FS",
    positionGroup: "defense",
    depthOrder: 3,
    jerseyNumber: 43,
    height: "6-1",
    weight: "210",
    age: 22,
    college: "Washington State",
    experience: 1,
    injuryStatus: "Active",
    stats: { tackles: 8, int: 0, pd: 1, ff: 0 },
  },

  // --- Special Teams ---
  {
    id: pid("KC", "K", 1),
    name: "Harrison Butker",
    team: "KC",
    position: "K",
    positionGroup: "specialTeams",
    depthOrder: 1,
    jerseyNumber: 7,
    height: "6-4",
    weight: "205",
    age: 29,
    college: "Georgia Tech",
    experience: 8,
    injuryStatus: "Active",
    stats: { fgMade: 28, fgAtt: 31, xpMade: 48, longFG: 57 },
  },
  {
    id: pid("KC", "K", 2),
    name: "Spencer Shrader",
    team: "KC",
    position: "K",
    positionGroup: "specialTeams",
    depthOrder: 2,
    jerseyNumber: 3,
    height: "5-10",
    weight: "190",
    age: 23,
    college: "Notre Dame",
    experience: 1,
    injuryStatus: "Active",
    stats: { fgMade: 0, fgAtt: 0, xpMade: 0, longFG: 0 },
  },
  {
    id: pid("KC", "K", 3),
    name: "Matthew Wright",
    team: "KC",
    position: "K",
    positionGroup: "specialTeams",
    depthOrder: 3,
    jerseyNumber: 8,
    height: "5-11",
    weight: "195",
    age: 28,
    college: "UCF",
    experience: 4,
    injuryStatus: "Active",
    stats: { fgMade: 0, fgAtt: 0, xpMade: 0, longFG: 0 },
  },
  {
    id: pid("KC", "P", 1),
    name: "Tommy Townsend",
    team: "KC",
    position: "P",
    positionGroup: "specialTeams",
    depthOrder: 1,
    jerseyNumber: 5,
    height: "6-1",
    weight: "191",
    age: 28,
    college: "Florida",
    experience: 5,
    injuryStatus: "Active",
    stats: { punts: 55, puntAvg: 46.2, inside20: 22, longPunt: 62 },
  },
  {
    id: pid("KC", "P", 2),
    name: "Spencer Shrader",
    team: "KC",
    position: "P",
    positionGroup: "specialTeams",
    depthOrder: 2,
    jerseyNumber: 3,
    height: "5-10",
    weight: "190",
    age: 23,
    college: "Notre Dame",
    experience: 1,
    injuryStatus: "Active",
    stats: { punts: 0, puntAvg: 0, inside20: 0, longPunt: 0 },
  },
  {
    id: pid("KC", "P", 3),
    name: "Matthew Wright",
    team: "KC",
    position: "P",
    positionGroup: "specialTeams",
    depthOrder: 3,
    jerseyNumber: 8,
    height: "5-11",
    weight: "195",
    age: 28,
    college: "UCF",
    experience: 4,
    injuryStatus: "Active",
    stats: { punts: 0, puntAvg: 0, inside20: 0, longPunt: 0 },
  },
  {
    id: pid("KC", "KR", 1),
    name: "Mecole Hardman",
    team: "KC",
    position: "KR",
    positionGroup: "specialTeams",
    depthOrder: 1,
    jerseyNumber: 12,
    height: "5-10",
    weight: "187",
    age: 26,
    college: "Georgia",
    experience: 6,
    injuryStatus: "Active",
    stats: { krYds: 380, krAvg: 22.4, krTD: 0, krLong: 45 },
  },
  {
    id: pid("KC", "KR", 2),
    name: "Xavier Worthy",
    team: "KC",
    position: "KR",
    positionGroup: "specialTeams",
    depthOrder: 2,
    jerseyNumber: 1,
    height: "5-11",
    weight: "165",
    age: 21,
    college: "Texas",
    experience: 1,
    injuryStatus: "Active",
    stats: { krYds: 120, krAvg: 20.0, krTD: 0, krLong: 30 },
  },
  {
    id: pid("KC", "KR", 3),
    name: "Nikko Remigio",
    team: "KC",
    position: "KR",
    positionGroup: "specialTeams",
    depthOrder: 3,
    jerseyNumber: 84,
    height: "5-11",
    weight: "185",
    age: 25,
    college: "Fresno State",
    experience: 1,
    injuryStatus: "Active",
    stats: { krYds: 60, krAvg: 20.0, krTD: 0, krLong: 25 },
  },
  {
    id: pid("KC", "PR", 1),
    name: "Mecole Hardman",
    team: "KC",
    position: "PR",
    positionGroup: "specialTeams",
    depthOrder: 1,
    jerseyNumber: 12,
    height: "5-10",
    weight: "187",
    age: 26,
    college: "Georgia",
    experience: 6,
    injuryStatus: "Active",
    stats: { prYds: 150, prAvg: 8.5, prTD: 0, prLong: 22 },
  },
  {
    id: pid("KC", "PR", 2),
    name: "Skyy Moore",
    team: "KC",
    position: "PR",
    positionGroup: "specialTeams",
    depthOrder: 2,
    jerseyNumber: 24,
    height: "5-10",
    weight: "195",
    age: 24,
    college: "Western Michigan",
    experience: 3,
    injuryStatus: "Active",
    stats: { prYds: 40, prAvg: 6.7, prTD: 0, prLong: 15 },
  },
  {
    id: pid("KC", "PR", 3),
    name: "Nikko Remigio",
    team: "KC",
    position: "PR",
    positionGroup: "specialTeams",
    depthOrder: 3,
    jerseyNumber: 84,
    height: "5-11",
    weight: "185",
    age: 25,
    college: "Fresno State",
    experience: 1,
    injuryStatus: "Active",
    stats: { prYds: 20, prAvg: 5.0, prTD: 0, prLong: 10 },
  },
  {
    id: pid("KC", "LS", 1),
    name: "James Winchester",
    team: "KC",
    position: "LS",
    positionGroup: "specialTeams",
    depthOrder: 1,
    jerseyNumber: 41,
    height: "6-3",
    weight: "250",
    age: 33,
    college: "Oklahoma",
    experience: 10,
    injuryStatus: "Active",
    stats: { gamesPlayed: 17, badSnaps: 0 },
  },
  {
    id: pid("KC", "LS", 2),
    name: "Austin Reiter",
    team: "KC",
    position: "LS",
    positionGroup: "specialTeams",
    depthOrder: 2,
    jerseyNumber: 71,
    height: "6-3",
    weight: "305",
    age: 33,
    college: "South Florida",
    experience: 9,
    injuryStatus: "Active",
    stats: { gamesPlayed: 0, badSnaps: 0 },
  },
  {
    id: pid("KC", "LS", 3),
    name: "Hunter Nourzad",
    team: "KC",
    position: "LS",
    positionGroup: "specialTeams",
    depthOrder: 3,
    jerseyNumber: 67,
    height: "6-3",
    weight: "305",
    age: 25,
    college: "Portland State",
    experience: 1,
    injuryStatus: "Active",
    stats: { gamesPlayed: 0, badSnaps: 0 },
  },

  // =============================================
  // REMAINING SHOWCASE TEAMS: PHI, DAL, SF, BUF, MIA
  // =============================================
  // IMPORTANT: The implementing agent MUST follow the EXACT same pattern
  // as KC above for these 5 teams. Full 3-deep at all 27 positions.
  // Use real 2025 player names and jersey numbers.
  //
  // PHILADELPHIA EAGLES (Showcase)
  // Key players to include:
  // QB: Jalen Hurts (1), Kenny Pickett (7), Tanner McKee (16)
  // RB: Saquon Barkley (26), Kenneth Gainwell (14), Boston Scott (35)
  // WR1: A.J. Brown (11), Jahan Dotson (5), Johnny Wilson (89)
  // WR2: DeVonta Smith (6), Britain Covey (18), Parris Campbell (0)
  // WR3: Jahan Dotson (5), Britain Covey (18), John Ross (12)
  // TE: Dallas Goedert (88), Grant Calcaterra (86), Albert Okwuegbunam (85)
  // LT: Jordan Mailata (68), Fred Johnson (74), Brett Toth (60)
  // LG: Landon Dickerson (69), Tyler Steen (65), Max Scharping (74)
  // C: Cam Jurgens (51), Dalton Risner (66), Nate Herbig (67)
  // RG: Mekhi Becton (72), Tyler Steen (65), Max Scharping (74)
  // RT: Lane Johnson (65), Fred Johnson (74), Brett Toth (60)
  // DE1: Josh Sweat (94), Nolan Smith (3), Patrick Johnson (48)
  // DE2: Brandon Graham (55), Bryce Huff (11), Tarron Jackson (75)
  // DT1: Jalen Carter (98), Milton Williams (93), Marlon Tuipulotu (97)
  // DT2: Jordan Davis (90), Thomas Booker (91), Kentavius Street (95)
  // LB1: Devin White (40), Nakobe Dean (17), Zach Cunningham (52)
  // LB2: Nakobe Dean (17), Zach Cunningham (52), Ben VanSumeren (43)
  // LB3: Zach Cunningham (52), Ben VanSumeren (43), Nicholas Morrow (31)
  // CB1: Darius Slay (2), Kelee Ringo (22), Josh Jobe (28)
  // CB2: Quinyon Mitchell (27), Isaiah Rodgers (7), Eli Ricks (24)
  // SS: C.J. Gardner-Johnson (23), Reed Blankenship (32), Tristin McCollum (33)
  // FS: Reed Blankenship (32), Tristin McCollum (33), Andre' Sam (36)
  // K: Jake Elliott (4)
  // P: Braden Mann (17)
  // KR/PR: Britain Covey (18)
  // LS: Rick Lovato (45)
  // Injury notes: Jalen Hurts — Questionable (Ankle), Brandon Graham — IR (Triceps)
  //
  // DALLAS COWBOYS (Showcase)
  // Key players to include:
  // QB: Dak Prescott (4) — Out (Hamstring), Cooper Rush (10), Trey Lance (15)
  // RB: Ezekiel Elliott (21), Rico Dowdle (23), Deuce Vaughn (25)
  // WR1: CeeDee Lamb (88), Brandin Cooks (3), Jalen Tolbert (1)
  // WR2: Brandin Cooks (3), Jalen Tolbert (1), KaVontae Turpin (2)
  // WR3: Jalen Tolbert (1), KaVontae Turpin (2), Ryan Flournoy (15)
  // TE: Jake Ferguson (48), Peyton Hendershot (49), Luke Schoonmaker (86)
  // Full OL and defense with real names
  // Injury notes: Dak Prescott — Out (Hamstring), DeMarcus Lawrence — Doubtful (Foot)
  //
  // SAN FRANCISCO 49ERS (Showcase)
  // Key players to include:
  // QB: Brock Purdy (13), Joshua Dobbs (5), Brandon Allen (7)
  // RB: Christian McCaffrey (23) — IR (Knee), Jordan Mason (24), Elijah Mitchell (25)
  // WR1: Deebo Samuel (19), Jauan Jennings (15), Danny Gray (6)
  // WR2: Brandon Aiyuk (11), Jauan Jennings (15), Chris Conley (85)
  // WR3: Jauan Jennings (15), Danny Gray (6), Ronnie Bell (10)
  // TE: George Kittle (85), Cameron Latu (89), Eric Saubert (80)
  // Full OL and defense with real names
  // Injury notes: Christian McCaffrey — IR (Knee), Deebo Samuel — Questionable (Shoulder)
  //
  // BUFFALO BILLS (Showcase)
  // Key players to include:
  // QB: Josh Allen (17), Mitchell Trubisky (10), Shane Buechele (7)
  // RB: James Cook (4), Ty Johnson (25), Latavius Murray (28)
  // WR1: Stefon Diggs (14), Khalil Shakir (10), Trent Sherfield (16)
  // WR2: Gabe Davis (13), Khalil Shakir (10), Marquez Valdes-Scantling (11)
  // Full roster with real names
  // Injury notes: Dalton Kincaid — Questionable (Knee)
  //
  // MIAMI DOLPHINS (Showcase)
  // Key players to include:
  // QB: Tua Tagovailoa (1), Mike White (14), Skylar Thompson (19)
  // RB: De'Von Achane (28), Raheem Mostert (31), Jeff Wilson Jr. (23)
  // WR1: Tyreek Hill (10), Jaylen Waddle (17), River Cracraft (85)
  // WR2: Jaylen Waddle (17), Braxton Berrios (0), Cedrick Wilson Jr. (11)
  // Full roster with real names
  // Injury notes: Raheem Mostert — Doubtful (Knee)
  //
  // =============================================
  // NON-SHOWCASE TEAMS (26 teams, starter + 1 backup per position)
  // =============================================
  // The implementing agent MUST create entries for ALL remaining 26 teams.
  // Each team gets starter + 1 backup (depthOrder 1 and 2) at all 27 positions.
  // Use real 2025 NFL player names.
  //
  // Template for non-showcase team (repeat for each of 26 teams):
  // QB1/QB2, RB1/RB2, WR1-1/WR1-2, WR2-1/WR2-2, WR3-1/WR3-2,
  // TE1/TE2, LT1/LT2, LG1/LG2, C1/C2, RG1/RG2, RT1/RT2,
  // DE1-1/DE1-2, DE2-1/DE2-2, DT1-1/DT1-2, DT2-1/DT2-2,
  // LB1-1/LB1-2, LB2-1/LB2-2, LB3-1/LB3-2,
  // CB1-1/CB1-2, CB2-1/CB2-2, SS1/SS2, FS1/FS2,
  // K1/K2, P1/P2, KR1/KR2, PR1/PR2, LS1/LS2
  //
  // Key starters for each non-showcase team (agent must expand to full entries):
  //
  // BAL: Lamar Jackson (8), Derrick Henry (22), Zay Flowers (4), Mark Andrews (89)
  // CIN: Joe Burrow (9), Joe Mixon (28), Ja'Marr Chase (1), Tee Higgins (5)
  // CLE: Deshaun Watson (4), Nick Chubb (24), Amari Cooper (2), David Njoku (85)
  // PIT: Russell Wilson (3), Najee Harris (22), George Pickens (14), Pat Freiermuth (88)
  // HOU: C.J. Stroud (7), Joe Mixon (28), Nico Collins (12), Stefon Diggs (1)
  // IND: Anthony Richardson (5), Jonathan Taylor (28), Michael Pittman (11), Josh Downs (1)
  // JAX: Trevor Lawrence (16), Travis Etienne (1), Calvin Ridley (0), Evan Engram (17)
  // TEN: Will Levis (8), Derrick Henry (22), DeAndre Hopkins (10), Chigoziem Okonkwo (85)
  // LV: Jimmy Garoppolo (10), Josh Jacobs (28), Davante Adams (17), Jakobi Meyers (16)
  // LAC: Justin Herbert (10), Austin Ekeler (30), Keenan Allen (13), Joshua Palmer (5)
  // DEN: Bo Nix (10), Javonte Williams (33), Courtland Sutton (14), Jerry Jeudy (10)
  // NE: Drake Maye (10), Rhamondre Stevenson (38), Kendrick Bourne (84), Hunter Henry (85)
  // NYJ: Aaron Rodgers (8), Breece Hall (20), Garrett Wilson (17), Tyler Conklin (83)
  // NYG: Daniel Jones (8), Saquon Barkley (26), Darius Slayton (86), Darren Waller (12)
  // WAS: Jayden Daniels (5), Brian Robinson Jr. (8), Terry McLaurin (17), Logan Thomas (82)
  // CHI: Caleb Williams (18), D'Andre Swift (14), DJ Moore (2), Cole Kmet (85)
  // DET: Jared Goff (16), David Montgomery (5), Amon-Ra St. Brown (14), Sam LaPorta (87)
  // GB: Jordan Love (10), Aaron Jones (33), Christian Watson (9), Romeo Doubs (87)
  // MIN: Sam Darnold (14), Aaron Jones (33), Justin Jefferson (18), T.J. Hockenson (87)
  // ATL: Kirk Cousins (18), Bijan Robinson (7), Drake London (5), Kyle Pitts (8)
  // CAR: Bryce Young (9), Chuba Hubbard (30), Adam Thielen (19), Tommy Tremble (82)
  // NO: Derek Carr (4), Alvin Kamara (41), Chris Olave (12), Juwan Johnson (83)
  // TB: Baker Mayfield (6), Rachaad White (1), Mike Evans (13), Chris Godwin (14)
  // ARI: Kyler Murray (1), James Conner (6), Marquise Brown (2), Trey McBride (85)
  // LAR: Matthew Stafford (9), Kyren Williams (23), Puka Nacua (17), Cooper Kupp (10)
  // SF: (already covered as showcase)
  // SEA: Geno Smith (7), Kenneth Walker III (9), DK Metcalf (14), Tyler Lockett (16)
  //
  // The implementing agent MUST create the full Player objects with all required fields
  // for every player listed above (and their backups) using the same structure as KC.
  // Do NOT skip any team. Do NOT use placeholder data.
  // Include at least 2 more injury statuses spread across non-showcase teams:
  //   - Nick Chubb (CLE) — Questionable (Knee)
  //   - Deshaun Watson (CLE) — IR (Shoulder)
  //   - DeAndre Hopkins (TEN) — Questionable (Knee)
];
```

**CRITICAL NOTE TO IMPLEMENTING AGENT:** The code block above shows the KC showcase team in full and provides detailed guidance for all other teams. You MUST generate the complete player entries for ALL teams. The final file will be approximately 4,000-6,000 lines. Do not truncate, skip teams, or use placeholders. Every `Player` object must have all required fields from the `Player` interface.

- [ ] **4.2** Verify:

```bash
npx tsc --noEmit
```

- [ ] **4.3** Commit:

```bash
git add src/data/players.ts && git commit -m "feat: add player data for all 32 NFL teams"
```

---

## Task 5: Mock Data — News

**Goal:** Create 50+ realistic news items covering all categories.

### Steps

- [ ] **5.1** Create `src/data/news.ts`:

```typescript
import { NewsItem } from "@/types";

// Helper: generates ISO timestamp relative to "now"
function ago(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

export const newsItems: NewsItem[] = [
  // === INJURY ===
  {
    id: "news-001",
    playerId: "KC-CB2-1",
    playerName: "Jaylen Watson",
    team: "KC",
    position: "CB2",
    category: "INJURY",
    headline: "Jaylen Watson tears ACL in practice, out for season",
    description:
      "Chiefs CB Jaylen Watson suffered a torn ACL during Wednesday's practice. He will undergo surgery and is expected to miss the remainder of the season. Nazeeh Johnson will step into the starting role.",
    source: "Adam Teicher, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(2),
  },
  {
    id: "news-002",
    playerId: "KC-RT-1",
    playerName: "Jawaan Taylor",
    team: "KC",
    position: "RT",
    category: "INJURY",
    headline: "Jawaan Taylor listed as questionable with knee issue",
    description:
      "Chiefs RT Jawaan Taylor was limited in practice Wednesday and Thursday with a knee injury. He is listed as questionable for Sunday's game against the Broncos.",
    source: "Adam Teicher, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(45),
  },
  {
    id: "news-003",
    playerId: "KC-RB-2",
    playerName: "Clyde Edwards-Helaire",
    team: "KC",
    position: "RB",
    category: "INJURY",
    headline: "Edwards-Helaire limited in practice with knee injury",
    description:
      "Chiefs RB Clyde Edwards-Helaire was a limited participant in Thursday's practice. His status for Sunday remains questionable.",
    source: "Adam Teicher, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(120),
  },
  {
    id: "news-004",
    playerId: "PHI-QB-1",
    playerName: "Jalen Hurts",
    team: "PHI",
    position: "QB",
    category: "INJURY",
    headline: "Jalen Hurts questionable with ankle injury",
    description:
      "Eagles QB Jalen Hurts tweaked his ankle in Wednesday's practice and is listed as questionable. He is expected to play but will be monitored throughout the week.",
    source: "Tim McManus, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(180),
  },
  {
    id: "news-005",
    playerId: "DAL-QB-1",
    playerName: "Dak Prescott",
    team: "DAL",
    position: "QB",
    category: "INJURY",
    headline: "Dak Prescott ruled out with hamstring strain",
    description:
      "Cowboys QB Dak Prescott has been ruled out for Sunday's game against the Eagles with a hamstring strain. Cooper Rush will start in his place.",
    source: "Todd Archer, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(300),
  },
  {
    id: "news-006",
    playerId: "SF-RB-1",
    playerName: "Christian McCaffrey",
    team: "SF",
    position: "RB",
    category: "INJURY",
    headline: "Christian McCaffrey placed on injured reserve",
    description:
      "49ers RB Christian McCaffrey has been placed on injured reserve with a knee injury. Jordan Mason will take over as the lead back. McCaffrey is expected to miss at least four games.",
    source: "Nick Wagoner, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(1440),
  },
  {
    id: "news-007",
    playerId: "SF-WR1-1",
    playerName: "Deebo Samuel",
    team: "SF",
    position: "WR1",
    category: "INJURY",
    headline: "Deebo Samuel questionable with shoulder injury",
    description:
      "49ers WR Deebo Samuel is listed as questionable for Sunday's game after being limited in practice all week with a shoulder injury.",
    source: "Nick Wagoner, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(360),
  },
  {
    id: "news-008",
    playerId: "CLE-RB-1",
    playerName: "Nick Chubb",
    team: "CLE",
    position: "RB",
    category: "INJURY",
    headline: "Nick Chubb questionable as he continues knee rehab",
    description:
      "Browns RB Nick Chubb was a limited participant in practice this week as he continues to recover from knee surgery. He is listed as questionable for Sunday.",
    source: "Jake Trotter, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(240),
  },
  {
    id: "news-009",
    playerId: "BUF-TE-1",
    playerName: "Dalton Kincaid",
    team: "BUF",
    position: "TE",
    category: "INJURY",
    headline: "Dalton Kincaid questionable with knee issue",
    description:
      "Bills TE Dalton Kincaid is listed as questionable after missing Thursday's practice with a knee injury. He is considered a game-time decision.",
    source: "Alaina Getzenberg, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(420),
  },
  {
    id: "news-010",
    playerId: "MIA-RB-2",
    playerName: "Raheem Mostert",
    team: "MIA",
    position: "RB",
    category: "INJURY",
    headline: "Raheem Mostert listed as doubtful with knee injury",
    description:
      "Dolphins RB Raheem Mostert did not practice all week and is listed as doubtful for Sunday's game. De'Von Achane is expected to handle the majority of carries.",
    source: "Marcel Louis-Jacques, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(480),
  },

  // === IR ===
  {
    id: "news-011",
    playerId: "SF-RB-1",
    playerName: "Christian McCaffrey",
    team: "SF",
    position: "RB",
    category: "IR",
    headline: "49ers place McCaffrey on IR, designate for return",
    description:
      "The San Francisco 49ers have officially placed RB Christian McCaffrey on injured reserve with a knee injury. He has been designated to return, meaning he can resume practice after four weeks.",
    source: "Nick Wagoner, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(1445),
  },
  {
    id: "news-012",
    playerId: "PHI-DE2-1",
    playerName: "Brandon Graham",
    team: "PHI",
    position: "DE2",
    category: "IR",
    headline: "Brandon Graham placed on IR with triceps tear",
    description:
      "Eagles DE Brandon Graham has been placed on injured reserve with a torn triceps. The 36-year-old veteran's season is over, and there is speculation this could be a career-ending injury.",
    source: "Tim McManus, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(4320),
  },
  {
    id: "news-013",
    playerId: "KC-TE-3",
    playerName: "Jody Fortson",
    team: "KC",
    position: "TE",
    category: "IR",
    headline: "Chiefs place Jody Fortson on injured reserve",
    description:
      "Chiefs TE Jody Fortson has been placed on injured reserve with an Achilles injury suffered in Week 6. He will miss the remainder of the season.",
    source: "Adam Teicher, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(10080),
  },
  {
    id: "news-014",
    playerId: "CLE-QB-1",
    playerName: "Deshaun Watson",
    team: "CLE",
    position: "QB",
    category: "IR",
    headline: "Deshaun Watson placed on IR with shoulder injury",
    description:
      "Browns QB Deshaun Watson has been placed on injured reserve with a shoulder injury. He is expected to miss at least eight weeks.",
    source: "Jake Trotter, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(7200),
  },

  // === SUSPENSION ===
  {
    id: "news-015",
    playerId: "KC-WR1-1",
    playerName: "Rashee Rice",
    team: "KC",
    position: "WR1",
    category: "SUSPENSION",
    headline: "Rashee Rice suspended 6 games for off-field conduct",
    description:
      "Chiefs WR Rashee Rice has been suspended six games by the NFL for violating the league's personal conduct policy. Xavier Worthy and Marquise Brown will see increased roles.",
    source: "Adam Teicher, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(8640),
  },

  // === TRADE ===
  {
    id: "news-016",
    playerId: "HOU-WR2-1",
    playerName: "Stefon Diggs",
    team: "HOU",
    position: "WR2",
    category: "TRADE",
    headline: "Texans acquire Stefon Diggs from Bills in blockbuster trade",
    description:
      "The Houston Texans have traded for WR Stefon Diggs, sending a 2025 second-round pick to the Buffalo Bills. Diggs will join Nico Collins in the Texans' receiving corps.",
    source: "Adam Schefter, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(20160),
  },
  {
    id: "news-017",
    playerId: "MIN-RB-1",
    playerName: "Aaron Jones",
    team: "MIN",
    position: "RB",
    category: "TRADE",
    headline: "Vikings trade for Aaron Jones from Packers",
    description:
      "The Minnesota Vikings acquired RB Aaron Jones in a trade with the Green Bay Packers for a 2025 fourth-round pick. Jones is expected to be the lead back in Minnesota.",
    source: "Courtney Cronin, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(20160),
  },

  // === SIGNING ===
  {
    id: "news-018",
    playerId: "DAL-RB-1",
    playerName: "Ezekiel Elliott",
    team: "DAL",
    position: "RB",
    category: "SIGNING",
    headline: "Cowboys re-sign Ezekiel Elliott to 1-year deal",
    description:
      "The Dallas Cowboys have re-signed RB Ezekiel Elliott to a one-year, $3 million contract. Elliott returns to Dallas after a year with the Patriots.",
    source: "Todd Archer, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(14400),
  },
  {
    id: "news-019",
    playerId: "LV-QB-1",
    playerName: "Jimmy Garoppolo",
    team: "LV",
    position: "QB",
    category: "SIGNING",
    headline: "Raiders sign Jimmy Garoppolo to 3-year deal",
    description:
      "The Las Vegas Raiders have signed QB Jimmy Garoppolo to a three-year, $72.75 million contract with $45 million guaranteed.",
    source: "Paul Gutierrez, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(14400),
  },

  // === DEPTH_CHART ===
  {
    id: "news-020",
    playerId: "KC-CB2-2",
    playerName: "Nazeeh Johnson",
    team: "KC",
    position: "CB2",
    category: "DEPTH_CHART",
    headline: "Nazeeh Johnson promoted to CB2 starter after Watson injury",
    description:
      "With Jaylen Watson out for the season due to a torn ACL, the Chiefs have promoted Nazeeh Johnson to the starting CB2 role. Johnson has appeared in all games this season as a rotational player.",
    source: "Adam Teicher, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(5),
  },
  {
    id: "news-021",
    playerId: "DAL-QB-2",
    playerName: "Cooper Rush",
    team: "DAL",
    position: "QB",
    category: "DEPTH_CHART",
    headline: "Cooper Rush named starter with Prescott out",
    description:
      "Cowboys head coach Mike McCarthy has named Cooper Rush as the starting QB for Sunday's game against the Eagles with Dak Prescott ruled out due to a hamstring strain.",
    source: "Todd Archer, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(310),
  },
  {
    id: "news-022",
    playerId: "SF-RB-2",
    playerName: "Jordan Mason",
    team: "SF",
    position: "RB",
    category: "DEPTH_CHART",
    headline: "Jordan Mason named starting RB with McCaffrey on IR",
    description:
      "49ers head coach Kyle Shanahan announced that Jordan Mason will be the starting running back while Christian McCaffrey is on injured reserve. Mason has averaged 5.2 YPC in a reserve role this season.",
    source: "Nick Wagoner, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(1450),
  },
  {
    id: "news-023",
    playerId: "KC-WR1-2",
    playerName: "Xavier Worthy",
    team: "KC",
    position: "WR1",
    category: "DEPTH_CHART",
    headline: "Xavier Worthy moves to WR1 during Rice suspension",
    description:
      "With Rashee Rice suspended, rookie Xavier Worthy has been elevated to the WR1 role. Worthy has shown explosive speed and has 6 TDs on the season.",
    source: "Adam Teicher, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(8645),
  },

  // === RETURN ===
  {
    id: "news-024",
    playerId: "CLE-RB-1",
    playerName: "Nick Chubb",
    team: "CLE",
    position: "RB",
    category: "RETURN",
    headline: "Nick Chubb returns to practice, could play Sunday",
    description:
      "Browns RB Nick Chubb returned to practice in a limited capacity for the first time since Week 2. He is listed as questionable but the team is optimistic about his availability for Sunday.",
    source: "Jake Trotter, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(200),
  },
  {
    id: "news-025",
    playerId: "TEN-WR1-1",
    playerName: "DeAndre Hopkins",
    team: "TEN",
    position: "WR1",
    category: "RETURN",
    headline: "DeAndre Hopkins expected to play despite knee injury",
    description:
      "Titans WR DeAndre Hopkins practiced fully on Friday and is expected to play Sunday despite being listed as questionable with a knee injury.",
    source: "Turron Davenport, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(600),
  },

  // === More INJURY items ===
  {
    id: "news-026",
    playerId: "DAL-DE2-1",
    playerName: "DeMarcus Lawrence",
    team: "DAL",
    position: "DE2",
    category: "INJURY",
    headline: "DeMarcus Lawrence listed as doubtful with foot injury",
    description:
      "Cowboys DE DeMarcus Lawrence did not practice all week with a foot injury and is listed as doubtful for Sunday's game against the Eagles.",
    source: "Todd Archer, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(350),
  },
  {
    id: "news-027",
    playerId: "DET-WR1-1",
    playerName: "Amon-Ra St. Brown",
    team: "DET",
    position: "WR1",
    category: "INJURY",
    headline: "Amon-Ra St. Brown expected to play through ankle issue",
    description:
      "Lions WR Amon-Ra St. Brown was listed as questionable with an ankle injury but is expected to play Sunday. He practiced in full on Friday.",
    source: "Eric Woodyard, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(500),
  },

  // === More TRADE ===
  {
    id: "news-028",
    playerId: "LAR-WR2-1",
    playerName: "Cooper Kupp",
    team: "LAR",
    position: "WR2",
    category: "TRADE",
    headline: "Rams explore trade options for Cooper Kupp",
    description:
      "The Los Angeles Rams are fielding trade offers for veteran WR Cooper Kupp, according to league sources. Several contending teams have expressed interest.",
    source: "Adam Schefter, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(720),
  },

  // === More SIGNING ===
  {
    id: "news-029",
    playerId: "NE-QB-1",
    playerName: "Drake Maye",
    team: "NE",
    position: "QB",
    category: "SIGNING",
    headline: "Patriots sign Drake Maye to rookie contract extension",
    description:
      "The New England Patriots have signed 2024 first-round pick Drake Maye to his four-year rookie contract. Maye is expected to compete for the starting job in training camp.",
    source: "Mike Reiss, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(13000),
  },

  // === More DEPTH_CHART ===
  {
    id: "news-030",
    playerId: "CHI-QB-1",
    playerName: "Caleb Williams",
    team: "CHI",
    position: "QB",
    category: "DEPTH_CHART",
    headline: "Caleb Williams named Bears starter for Week 1",
    description:
      "Bears head coach Matt Eberflus has named rookie Caleb Williams as the starting quarterback for the 2024 season opener. Williams beat out Tyson Bagent in the preseason competition.",
    source: "Courtney Cronin, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(20160),
  },

  // === Additional news to reach 50+ ===
  {
    id: "news-031",
    playerId: "BAL-QB-1",
    playerName: "Lamar Jackson",
    team: "BAL",
    position: "QB",
    category: "INJURY",
    headline: "Lamar Jackson full practice participant, no injury concerns",
    description:
      "Ravens QB Lamar Jackson was a full participant in all practices this week and has no injury designation heading into Sunday's game against the Steelers.",
    source: "Jamison Hensley, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(550),
  },
  {
    id: "news-032",
    playerId: "CIN-WR1-1",
    playerName: "Ja'Marr Chase",
    team: "CIN",
    position: "WR1",
    category: "SIGNING",
    headline: "Ja'Marr Chase signs record 4-year extension with Bengals",
    description:
      "The Cincinnati Bengals and WR Ja'Marr Chase have agreed to a four-year, $140 million extension, making him the highest-paid wide receiver in NFL history.",
    source: "Adam Schefter, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(10080),
  },
  {
    id: "news-033",
    playerId: "GB-QB-1",
    playerName: "Jordan Love",
    team: "GB",
    position: "QB",
    category: "INJURY",
    headline: "Jordan Love clears concussion protocol, will start Sunday",
    description:
      "Packers QB Jordan Love has been cleared from the concussion protocol and will start Sunday's game against the Bears. Love missed last week's game after taking a hit in practice.",
    source: "Rob Demovsky, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(660),
  },
  {
    id: "news-034",
    playerId: "MIN-WR1-1",
    playerName: "Justin Jefferson",
    team: "MIN",
    position: "WR1",
    category: "RETURN",
    headline: "Justin Jefferson returns from hamstring injury, full practice",
    description:
      "Vikings WR Justin Jefferson returned to full practice on Wednesday after missing two games with a hamstring injury. He is expected to play Sunday.",
    source: "Kevin Seifert, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(700),
  },
  {
    id: "news-035",
    playerId: "ATL-RB-1",
    playerName: "Bijan Robinson",
    team: "ATL",
    position: "RB",
    category: "DEPTH_CHART",
    headline: "Bijan Robinson remains featured back, Tyler Allgeier backup",
    description:
      "Falcons head coach Arthur Smith confirmed that Bijan Robinson will continue as the featured back, with Tyler Allgeier serving as the primary backup and change-of-pace option.",
    source: "Michael Rothstein, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(2880),
  },
  {
    id: "news-036",
    playerId: "TB-QB-1",
    playerName: "Baker Mayfield",
    team: "TB",
    position: "QB",
    category: "SIGNING",
    headline: "Baker Mayfield signs 3-year extension with Buccaneers",
    description:
      "The Tampa Bay Buccaneers have signed QB Baker Mayfield to a three-year, $100 million extension with $50 million guaranteed, rewarding his impressive 2023 season.",
    source: "Jenna Laine, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(11520),
  },
  {
    id: "news-037",
    playerId: "WAS-QB-1",
    playerName: "Jayden Daniels",
    team: "WAS",
    position: "QB",
    category: "DEPTH_CHART",
    headline: "Jayden Daniels named Commanders starter for season opener",
    description:
      "The Washington Commanders have named 2024 second overall pick Jayden Daniels as their Week 1 starter. Daniels impressed in the preseason with his dual-threat ability.",
    source: "John Keim, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(20160),
  },
  {
    id: "news-038",
    playerId: "SEA-WR1-1",
    playerName: "DK Metcalf",
    team: "SEA",
    position: "WR1",
    category: "INJURY",
    headline: "DK Metcalf playing through rib injury, no limitations",
    description:
      "Seahawks WR DK Metcalf is dealing with a rib injury but practiced in full all week. He has no injury designation and is expected to play without limitations Sunday.",
    source: "Brady Henderson, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(800),
  },
  {
    id: "news-039",
    playerId: "ARI-QB-1",
    playerName: "Kyler Murray",
    team: "ARI",
    position: "QB",
    category: "RETURN",
    headline: "Kyler Murray looks sharp in return from ACL injury",
    description:
      "Cardinals QB Kyler Murray has looked sharp in practice following his return from ACL surgery. Murray is fully cleared and ready for the regular season.",
    source: "Josh Weinfuss, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(15000),
  },
  {
    id: "news-040",
    playerId: "NO-RB-1",
    playerName: "Alvin Kamara",
    team: "NO",
    position: "RB",
    category: "INJURY",
    headline: "Alvin Kamara rests Wednesday, full participant Thursday",
    description:
      "Saints RB Alvin Kamara sat out Wednesday's practice as a veteran rest day. He returned as a full participant Thursday and has no injury designation.",
    source: "Katherine Terrell, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(900),
  },
  {
    id: "news-041",
    playerId: "DET-TE-1",
    playerName: "Sam LaPorta",
    team: "DET",
    position: "TE",
    category: "DEPTH_CHART",
    headline: "Sam LaPorta solidifies TE1 role after record-breaking rookie season",
    description:
      "Lions TE Sam LaPorta has cemented himself as the team's TE1 heading into his second season. His 86-catch, 889-yard rookie campaign set records for a Lions tight end.",
    source: "Eric Woodyard, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(5000),
  },
  {
    id: "news-042",
    playerId: "JAX-QB-1",
    playerName: "Trevor Lawrence",
    team: "JAX",
    position: "QB",
    category: "SIGNING",
    headline: "Trevor Lawrence signs 5-year extension with Jaguars",
    description:
      "The Jacksonville Jaguars have signed QB Trevor Lawrence to a five-year, $275 million extension with $200 million guaranteed, making him one of the highest-paid players in NFL history.",
    source: "Michael DiRocco, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(12960),
  },
  {
    id: "news-043",
    playerId: "PIT-QB-1",
    playerName: "Russell Wilson",
    team: "PIT",
    position: "QB",
    category: "DEPTH_CHART",
    headline: "Russell Wilson wins starting QB job with Steelers",
    description:
      "Steelers head coach Mike Tomlin has named Russell Wilson as the starting quarterback over Justin Fields. Wilson showed better command of the offense in the preseason.",
    source: "Brooke Pryor, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(20160),
  },
  {
    id: "news-044",
    playerId: "IND-QB-1",
    playerName: "Anthony Richardson",
    team: "IND",
    position: "QB",
    category: "INJURY",
    headline: "Anthony Richardson practicing fully, no shoulder concerns",
    description:
      "Colts QB Anthony Richardson is a full practice participant and has no injury concerns heading into the regular season. His shoulder has fully healed from last year's surgery.",
    source: "Stephen Holder, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(1000),
  },
  {
    id: "news-045",
    playerId: "NYJ-QB-1",
    playerName: "Aaron Rodgers",
    team: "NYJ",
    position: "QB",
    category: "RETURN",
    headline: "Aaron Rodgers fully cleared after Achilles recovery",
    description:
      "Jets QB Aaron Rodgers has been fully cleared for contact after recovering from last year's torn Achilles. He looked sharp in OTAs and is ready for training camp.",
    source: "Rich Cimini, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(18000),
  },
  {
    id: "news-046",
    playerId: "LAC-QB-1",
    playerName: "Justin Herbert",
    team: "LAC",
    position: "QB",
    category: "INJURY",
    headline: "Justin Herbert healthy after offseason finger surgery",
    description:
      "Chargers QB Justin Herbert is fully healthy after offseason surgery on his index finger. He has no limitations and threw with accuracy throughout OTAs.",
    source: "Lindsey Thiry, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(14000),
  },
  {
    id: "news-047",
    playerId: "DEN-QB-1",
    playerName: "Bo Nix",
    team: "DEN",
    position: "QB",
    category: "DEPTH_CHART",
    headline: "Bo Nix named Broncos starting QB for Week 1",
    description:
      "Broncos head coach Sean Payton has named rookie Bo Nix as the starting quarterback for the season opener. Nix beat out Jarrett Stidham in a competitive preseason battle.",
    source: "Jeff Legwold, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(20160),
  },
  {
    id: "news-048",
    playerId: "CAR-QB-1",
    playerName: "Bryce Young",
    team: "CAR",
    position: "QB",
    category: "DEPTH_CHART",
    headline: "Bryce Young to remain Panthers starter despite struggles",
    description:
      "Panthers head coach Dave Canales has committed to Bryce Young as the starting quarterback despite a slow start. The team believes in his long-term potential.",
    source: "David Newton, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(3000),
  },
  {
    id: "news-049",
    playerId: "HOU-QB-1",
    playerName: "C.J. Stroud",
    team: "HOU",
    position: "QB",
    category: "SIGNING",
    headline: "C.J. Stroud honored with Offensive Rookie of the Year award",
    description:
      "Texans QB C.J. Stroud won the 2023 NFL Offensive Rookie of the Year award after a historic season. He threw for 4,108 yards and 23 TDs while leading the Texans to the playoffs.",
    source: "DJ Bien-Aime, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(17000),
  },
  {
    id: "news-050",
    playerId: "NYG-QB-1",
    playerName: "Daniel Jones",
    team: "NYG",
    position: "QB",
    category: "INJURY",
    headline: "Daniel Jones recovering from ACL surgery, timeline uncertain",
    description:
      "Giants QB Daniel Jones continues to rehab from ACL surgery suffered late last season. His availability for Week 1 remains uncertain.",
    source: "Jordan Raanan, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(10000),
  },
  {
    id: "news-051",
    playerId: "KC-DT1-1",
    playerName: "Chris Jones",
    team: "KC",
    position: "DT1",
    category: "SIGNING",
    headline: "Chris Jones signs record extension with Chiefs",
    description:
      "Chiefs DT Chris Jones has signed a five-year, $158.75 million extension, making him the highest-paid defensive player in NFL history. Jones ended his holdout and will report to the team immediately.",
    source: "Adam Teicher, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(16000),
  },
  {
    id: "news-052",
    playerId: "PHI-CB1-1",
    playerName: "Darius Slay",
    team: "PHI",
    position: "CB1",
    category: "INJURY",
    headline: "Darius Slay full participant in practice, ready for Sunday",
    description:
      "Eagles CB Darius Slay was a full participant in all practices this week after dealing with a hamstring issue. He is expected to play without limitations.",
    source: "Tim McManus, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(550),
  },
  {
    id: "news-053",
    playerId: "MIA-WR1-1",
    playerName: "Tyreek Hill",
    team: "MIA",
    position: "WR1",
    category: "INJURY",
    headline: "Tyreek Hill gets veteran rest day, no injury concerns",
    description:
      "Dolphins WR Tyreek Hill sat out Wednesday's practice for a veteran rest day. He has no injury designation and is expected to play Sunday as usual.",
    source: "Marcel Louis-Jacques, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(850),
  },
  {
    id: "news-054",
    playerId: "BUF-QB-1",
    playerName: "Josh Allen",
    team: "BUF",
    position: "QB",
    category: "SIGNING",
    headline: "Josh Allen signs massive 6-year extension with Bills",
    description:
      "The Buffalo Bills have signed QB Josh Allen to a six-year, $258 million extension, keeping him in Buffalo through the 2028 season.",
    source: "Alaina Getzenberg, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(15000),
  },
  {
    id: "news-055",
    playerId: "DET-QB-1",
    playerName: "Jared Goff",
    team: "DET",
    position: "QB",
    category: "SIGNING",
    headline: "Jared Goff signs 4-year extension to stay in Detroit",
    description:
      "Lions QB Jared Goff has signed a four-year, $212 million extension with $170 million guaranteed. The deal rewards Goff for leading Detroit to its first NFC Championship in 32 years.",
    source: "Eric Woodyard, ESPN",
    sourceUrl: "https://espn.com",
    timestamp: ago(13500),
  },
];
```

- [ ] **5.2** Verify:

```bash
npx tsc --noEmit
```

- [ ] **5.3** Commit:

```bash
git add src/data/news.ts && git commit -m "feat: add 55 mock news items across all categories"
```

---

## Task 6: RosterService — TDD

**Goal:** Build the service layer with tests first, then implementation.

### Steps

- [ ] **6.1** Create `src/services/__tests__/rosterService.test.ts` (tests first):

```typescript
import { createMockRosterService } from "@/services/rosterService";
import { RosterService } from "@/types";

describe("MockRosterService", () => {
  let service: RosterService;

  beforeEach(() => {
    service = createMockRosterService();
  });

  describe("getAllTeams", () => {
    it("returns all 32 NFL teams", () => {
      const teams = service.getAllTeams();
      expect(teams).toHaveLength(32);
    });

    it("includes teams from both conferences", () => {
      const teams = service.getAllTeams();
      const afc = teams.filter((t) => t.conference === "AFC");
      const nfc = teams.filter((t) => t.conference === "NFC");
      expect(afc).toHaveLength(16);
      expect(nfc).toHaveLength(16);
    });
  });

  describe("getTeam", () => {
    it("returns a team by ID", () => {
      const team = service.getTeam("KC");
      expect(team).toBeDefined();
      expect(team?.name).toBe("Chiefs");
      expect(team?.fullName).toBe("Kansas City Chiefs");
    });

    it("returns undefined for invalid team ID", () => {
      const team = service.getTeam("INVALID");
      expect(team).toBeUndefined();
    });
  });

  describe("getTeamRoster", () => {
    it("returns a roster with depth chart entries", () => {
      const roster = service.getTeamRoster("KC");
      expect(roster).toBeDefined();
      expect(roster?.team.id).toBe("KC");
      expect(roster?.depthChart.length).toBeGreaterThan(0);
    });

    it("groups players by position in depth chart", () => {
      const roster = service.getTeamRoster("KC");
      expect(roster).toBeDefined();

      const qbEntry = roster?.depthChart.find((e) => e.position === "QB");
      expect(qbEntry).toBeDefined();
      expect(qbEntry?.players.length).toBeGreaterThanOrEqual(1);
      expect(qbEntry?.players[0].depthOrder).toBe(1);
    });

    it("returns undefined for invalid team ID", () => {
      const roster = service.getTeamRoster("INVALID");
      expect(roster).toBeUndefined();
    });

    it("includes team news in roster", () => {
      const roster = service.getTeamRoster("KC");
      expect(roster).toBeDefined();
      expect(roster?.news.length).toBeGreaterThanOrEqual(0);
      roster?.news.forEach((item) => {
        expect(item.team).toBe("KC");
      });
    });
  });

  describe("getPlayer", () => {
    it("returns a player by ID", () => {
      const player = service.getPlayer("KC-QB-1");
      expect(player).toBeDefined();
      expect(player?.name).toBe("Patrick Mahomes");
      expect(player?.team).toBe("KC");
    });

    it("returns undefined for invalid player ID", () => {
      const player = service.getPlayer("INVALID-ID");
      expect(player).toBeUndefined();
    });
  });

  describe("getPlayerNews", () => {
    it("returns news items for a specific player", () => {
      const news = service.getPlayerNews("KC-CB2-1");
      expect(news.length).toBeGreaterThanOrEqual(1);
      news.forEach((item) => {
        expect(item.playerId).toBe("KC-CB2-1");
      });
    });

    it("returns empty array for player with no news", () => {
      const news = service.getPlayerNews("KC-LG-3");
      expect(news).toEqual([]);
    });
  });

  describe("getTeamNews", () => {
    it("returns news items for a specific team", () => {
      const news = service.getTeamNews("KC");
      expect(news.length).toBeGreaterThanOrEqual(1);
      news.forEach((item) => {
        expect(item.team).toBe("KC");
      });
    });

    it("returns empty array for team with no news", () => {
      // A team that has no news in our mock data
      const news = service.getTeamNews("INVALID");
      expect(news).toEqual([]);
    });
  });

  describe("getAllNews", () => {
    it("returns all news items when no options provided", () => {
      const news = service.getAllNews();
      expect(news.length).toBeGreaterThanOrEqual(50);
    });

    it("filters by category", () => {
      const news = service.getAllNews({ category: "INJURY" });
      expect(news.length).toBeGreaterThan(0);
      news.forEach((item) => {
        expect(item.category).toBe("INJURY");
      });
    });

    it("limits results", () => {
      const news = service.getAllNews({ limit: 5 });
      expect(news).toHaveLength(5);
    });

    it("filters by category and limits", () => {
      const news = service.getAllNews({ category: "INJURY", limit: 3 });
      expect(news.length).toBeLessThanOrEqual(3);
      news.forEach((item) => {
        expect(item.category).toBe("INJURY");
      });
    });

    it("sorts by timestamp descending (newest first)", () => {
      const news = service.getAllNews();
      for (let i = 1; i < news.length; i++) {
        expect(
          new Date(news[i - 1].timestamp).getTime()
        ).toBeGreaterThanOrEqual(new Date(news[i].timestamp).getTime());
      }
    });
  });

  describe("searchPlayers", () => {
    it("finds players by name (case-insensitive)", () => {
      const results = service.searchPlayers("mahomes");
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].name).toBe("Patrick Mahomes");
    });

    it("finds players by partial name", () => {
      const results = service.searchPlayers("maho");
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it("returns empty array for no matches", () => {
      const results = service.searchPlayers("zzzzzzzzz");
      expect(results).toEqual([]);
    });
  });

  describe("searchTeams", () => {
    it("finds teams by name", () => {
      const results = service.searchTeams("chiefs");
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].id).toBe("KC");
    });

    it("finds teams by fullName", () => {
      const results = service.searchTeams("kansas city");
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].id).toBe("KC");
    });

    it("returns empty array for no matches", () => {
      const results = service.searchTeams("zzzzzzzzz");
      expect(results).toEqual([]);
    });
  });

  describe("getLastVerified", () => {
    it("returns an ISO timestamp string", () => {
      const timestamp = service.getLastVerified();
      expect(timestamp).toBeDefined();
      expect(() => new Date(timestamp)).not.toThrow();
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });
  });
});
```

- [ ] **6.2** Run tests to confirm they fail (no implementation yet):

```bash
npm test -- --verbose 2>&1 | head -60
```

- [ ] **6.3** Create `src/services/rosterService.ts`:

```typescript
import {
  RosterService,
  Team,
  Player,
  NewsItem,
  NewsCategory,
  DepthChartEntry,
  TeamRoster,
  PositionGroup,
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

    getTeamRoster(teamId: string): TeamRoster | undefined {
      const team = teams.find((t) => t.id === teamId);
      if (!team) return undefined;

      const teamPlayers = players.filter((p) => p.team === teamId);
      const depthChart = buildDepthChart(teamPlayers);
      const news = sortedNews.filter((n) => n.team === teamId);

      return { team, depthChart, news };
    },

    getPlayer(playerId: string): Player | undefined {
      return players.find((p) => p.id === playerId);
    },

    getPlayerNews(playerId: string): NewsItem[] {
      return sortedNews.filter((n) => n.playerId === playerId);
    },

    getTeamNews(teamId: string): NewsItem[] {
      return sortedNews.filter((n) => n.team === teamId);
    },

    getAllNews(options?: {
      category?: NewsCategory;
      limit?: number;
    }): NewsItem[] {
      let result = sortedNews;

      if (options?.category) {
        result = result.filter((n) => n.category === options.category);
      }

      if (options?.limit) {
        result = result.slice(0, options.limit);
      }

      return result;
    },

    searchPlayers(query: string): Player[] {
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

    getLastVerified(): string {
      return new Date().toISOString();
    },
  };
}
```

- [ ] **6.4** Run tests to confirm they pass:

```bash
npm test -- --verbose
```

- [ ] **6.5** Commit:

```bash
git add src/services/ && git commit -m "feat: add RosterService with TDD tests"
```

---

## Task 7: Shared Components

**Goal:** Build all reusable UI components.

### Steps

- [ ] **7.1** Create `src/components/StatusBadge.tsx`:

```tsx
import { InjuryStatus } from "@/types";

const statusConfig: Record<
  InjuryStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  Active: {
    label: "ACTIVE",
    bg: "bg-status-green-bg",
    text: "text-status-green",
    border: "border-status-green",
  },
  Questionable: {
    label: "QUESTIONABLE",
    bg: "bg-status-amber-bg",
    text: "text-status-amber",
    border: "border-status-amber",
  },
  Doubtful: {
    label: "DOUBTFUL",
    bg: "bg-status-amber-bg",
    text: "text-status-amber",
    border: "border-status-amber",
  },
  Out: {
    label: "OUT",
    bg: "bg-status-red-bg",
    text: "text-status-red",
    border: "border-status-red",
  },
  IR: {
    label: "IR",
    bg: "bg-status-red-bg",
    text: "text-status-red",
    border: "border-status-red",
  },
  Suspended: {
    label: "SUSPENDED",
    bg: "bg-status-red-bg",
    text: "text-status-red",
    border: "border-status-red",
  },
  Holdout: {
    label: "HOLDOUT",
    bg: "bg-status-amber-bg",
    text: "text-status-amber",
    border: "border-status-amber",
  },
};

interface StatusBadgeProps {
  status: InjuryStatus;
  showOnlyIfNotActive?: boolean;
}

export function StatusBadge({
  status,
  showOnlyIfNotActive = false,
}: StatusBadgeProps) {
  if (showOnlyIfNotActive && status === "Active") return null;

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
```

- [ ] **7.2** Create `src/components/NewsCard.tsx`:

```tsx
import Link from "next/link";
import { NewsItem, NewsCategory } from "@/types";

const categoryConfig: Record<
  NewsCategory,
  { label: string; bg: string; text: string }
> = {
  INJURY: { label: "INJURY", bg: "bg-status-red-bg", text: "text-status-red" },
  TRADE: {
    label: "TRADE",
    bg: "bg-status-blue-bg",
    text: "text-status-blue",
  },
  SIGNING: {
    label: "SIGNING",
    bg: "bg-status-blue-bg",
    text: "text-status-blue",
  },
  IR: { label: "IR", bg: "bg-status-red-bg", text: "text-status-red" },
  DEPTH_CHART: {
    label: "DEPTH CHART",
    bg: "bg-status-green-bg",
    text: "text-status-green",
  },
  SUSPENSION: {
    label: "SUSPENSION",
    bg: "bg-status-red-bg",
    text: "text-status-red",
  },
  RETURN: {
    label: "RETURN",
    bg: "bg-status-green-bg",
    text: "text-status-green",
  },
};

function formatTimestamp(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

interface NewsCardProps {
  item: NewsItem;
}

export function NewsCard({ item }: NewsCardProps) {
  const catConfig = categoryConfig[item.category];

  return (
    <div className="border-b border-border px-4 py-3 transition-colors hover:bg-bg-card-hover">
      <div className="mb-1.5 flex items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${catConfig.bg} ${catConfig.text}`}
        >
          {catConfig.label}
        </span>
        <span className="font-mono text-[11px] text-text-muted">
          {formatTimestamp(item.timestamp)}
        </span>
      </div>
      <h3 className="mb-1 text-sm font-medium leading-snug text-text-primary">
        <Link
          href={`/player/${item.playerId}`}
          className="hover:underline"
        >
          {item.playerName}
        </Link>
        <span className="text-text-muted">
          {" "}
          \u00b7 {item.position} \u00b7 {item.team}
        </span>
      </h3>
      <p className="text-xs leading-relaxed text-text-secondary">
        {item.description}
      </p>
      {item.source && (
        <p className="mt-1 font-mono text-[10px] text-text-muted">
          {item.source}
        </p>
      )}
    </div>
  );
}
```

- [ ] **7.3** Create `src/components/NewsFeed.tsx`:

```tsx
"use client";

import { useState } from "react";
import { NewsItem, NewsCategory } from "@/types";
import { NewsCard } from "./NewsCard";

const filterOptions: { label: string; value: NewsCategory | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Injuries", value: "INJURY" },
  { label: "Transactions", value: "TRADE" },
  { label: "IR", value: "IR" },
  { label: "Depth Chart", value: "DEPTH_CHART" },
  { label: "Returns", value: "RETURN" },
  { label: "Suspensions", value: "SUSPENSION" },
  { label: "Signings", value: "SIGNING" },
];

interface NewsFeedProps {
  items: NewsItem[];
  title?: string;
  showFilters?: boolean;
  maxItems?: number;
}

export function NewsFeed({
  items,
  title = "Latest News",
  showFilters = true,
  maxItems,
}: NewsFeedProps) {
  const [activeFilter, setActiveFilter] = useState<NewsCategory | "ALL">("ALL");

  const filtered =
    activeFilter === "ALL"
      ? items
      : items.filter((item) => item.category === activeFilter);

  const displayed = maxItems ? filtered.slice(0, maxItems) : filtered;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
          {title}
        </h2>
        {showFilters && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setActiveFilter(opt.value)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  activeFilter === opt.value
                    ? "bg-text-primary text-bg"
                    : "bg-bg-card-hover text-text-secondary hover:text-text-primary"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {displayed.length > 0 ? (
          displayed.map((item) => <NewsCard key={item.id} item={item} />)
        ) : (
          <div className="px-4 py-8 text-center text-sm text-text-muted">
            No news items match this filter.
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **7.4** Create `src/components/TeamCard.tsx`:

```tsx
import Link from "next/link";
import { Team } from "@/types";

interface TeamCardProps {
  team: Team;
  newsCount: number;
}

export function TeamCard({ team, newsCount }: TeamCardProps) {
  const hasBreakingNews = newsCount > 0;

  return (
    <Link
      href={`/team/${team.id}`}
      className={`group flex items-center gap-3 rounded-lg border bg-bg-card px-3 py-2.5 transition-all hover:bg-bg-card-hover ${
        hasBreakingNews
          ? "border-status-amber/30 shadow-[0_0_8px_rgba(245,158,11,0.08)]"
          : "border-border"
      }`}
    >
      <span className="text-xl">{team.logo}</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-text-primary group-hover:text-white">
          {team.name}
        </div>
        <div className="font-mono text-[11px] text-text-muted">
          {team.record}
        </div>
      </div>
      {hasBreakingNews && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-status-amber-bg text-[10px] font-bold text-status-amber">
          {newsCount}
        </span>
      )}
    </Link>
  );
}
```

- [ ] **7.5** Create `src/components/SearchBar.tsx`:

```tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  placeholder?: string;
}

export function SearchBar({
  placeholder = "Search players or teams\u2026",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setQuery("");
      }
    },
    [query, router]
  );

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-64 rounded-lg border border-border bg-bg-card px-3 py-1.5 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-border-highlight focus:bg-bg-card-hover"
      />
    </form>
  );
}
```

- [ ] **7.6** Create `src/components/TopBar.tsx`:

```tsx
import Link from "next/link";
import { SearchBar } from "./SearchBar";

interface TopBarProps {
  lastVerified: string;
}

function formatVerified(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function TopBar({ lastVerified }: TopBarProps) {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-3">
      <Link href="/" className="flex items-center gap-3">
        <span className="text-lg font-bold tracking-tight text-text-primary">
          RosterPulse
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-status-green-bg px-2 py-0.5 text-[10px] font-semibold text-status-green">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-status-green" />
          LIVE
        </span>
      </Link>
      <div className="flex items-center gap-4">
        <SearchBar />
        <span className="font-mono text-[11px] text-text-muted">
          Verified {formatVerified(lastVerified)}
        </span>
      </div>
    </header>
  );
}
```

- [ ] **7.7** Verify build:

```bash
npx tsc --noEmit
```

- [ ] **7.8** Commit:

```bash
git add src/components/ && git commit -m "feat: add shared UI components (StatusBadge, NewsCard, NewsFeed, TeamCard, SearchBar, TopBar)"
```

---

## Task 8: Root Layout

**Goal:** Wire up TopBar into the root layout.

### Steps

- [ ] **8.1** Update `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TopBar } from "@/components/TopBar";
import { createMockRosterService } from "@/services/rosterService";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body-var",
});

export const metadata: Metadata = {
  title: "RosterPulse \u2014 NFL Roster Dashboard",
  description:
    "Real-time NFL roster and depth chart dashboard. Every team, every starter, every status change.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const service = createMockRosterService();
  const lastVerified = service.getLastVerified();

  return (
    <html lang="en">
      <body className={`${inter.variable} font-body antialiased`}>
        <TopBar lastVerified={lastVerified} />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **8.2** Verify build:

```bash
npm run build
```

- [ ] **8.3** Commit:

```bash
git add src/app/layout.tsx && git commit -m "feat: wire TopBar into root layout"
```

---

## Task 9: Home Page

**Goal:** Build the two-column home page with team grid and news feed.

### Steps

- [ ] **9.1** Update `src/app/page.tsx`:

```tsx
import { createMockRosterService } from "@/services/rosterService";
import { TeamCard } from "@/components/TeamCard";
import { NewsFeed } from "@/components/NewsFeed";
import { Conference, Division } from "@/types";

const divisions: Division[] = ["East", "North", "South", "West"];
const conferences: Conference[] = ["AFC", "NFC"];

export default function Home() {
  const service = createMockRosterService();
  const allTeams = service.getAllTeams();
  const allNews = service.getAllNews();

  // Count news per team (last 24 hours for alert badges)
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentNewsCount = new Map<string, number>();
  for (const item of allNews) {
    if (new Date(item.timestamp).getTime() > oneDayAgo) {
      recentNewsCount.set(
        item.team,
        (recentNewsCount.get(item.team) || 0) + 1
      );
    }
  }

  return (
    <div className="flex h-[calc(100vh-49px)]">
      {/* Team Grid — Left */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-8">
          {conferences.map((conf) => (
            <div key={conf}>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-muted">
                {conf}
              </h2>
              <div className="space-y-5">
                {divisions.map((div) => {
                  const divTeams = allTeams.filter(
                    (t) => t.conference === conf && t.division === div
                  );
                  return (
                    <div key={div}>
                      <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                        {conf} {div}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {divTeams.map((team) => (
                          <TeamCard
                            key={team.id}
                            team={team}
                            newsCount={recentNewsCount.get(team.id) || 0}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* News Feed — Right */}
      <div className="w-[380px] border-l border-border bg-bg-card">
        <NewsFeed items={allNews} />
      </div>
    </div>
  );
}
```

- [ ] **9.2** Verify build:

```bash
npm run build
```

- [ ] **9.3** Commit:

```bash
git add src/app/page.tsx && git commit -m "feat: build home page with team grid and news feed"
```

---

## Task 10: Team Depth Chart Page

**Goal:** Build the team detail page with depth chart grid and team-specific news.

### Steps

- [ ] **10.1** Create `src/components/DepthChartRow.tsx`:

```tsx
import Link from "next/link";
import { Player } from "@/types";
import { StatusBadge } from "./StatusBadge";

interface DepthChartRowProps {
  position: string;
  players: Player[];
}

export function DepthChartRow({ position, players }: DepthChartRowProps) {
  // Clean position display (remove trailing numbers like DE1 -> DE)
  const displayPos = position.replace(/\d+$/, "");

  const starter = players.find((p) => p.depthOrder === 1);
  const second = players.find((p) => p.depthOrder === 2);
  const third = players.find((p) => p.depthOrder === 3);

  const borderColor =
    starter?.injuryStatus === "Out" ||
    starter?.injuryStatus === "IR" ||
    starter?.injuryStatus === "Suspended"
      ? "border-l-status-red"
      : starter?.injuryStatus === "Questionable" ||
          starter?.injuryStatus === "Doubtful"
        ? "border-l-status-amber"
        : "border-l-transparent";

  return (
    <tr
      className={`border-b border-border transition-colors hover:bg-bg-card-hover border-l-2 ${borderColor}`}
    >
      <td className="px-3 py-2 font-mono text-xs font-semibold text-text-muted">
        {displayPos}
      </td>
      <td className="px-3 py-2">
        {starter && (
          <PlayerCell player={starter} showDetail />
        )}
      </td>
      <td className="px-3 py-2">
        {second && <PlayerCell player={second} />}
      </td>
      <td className="px-3 py-2">
        {third && <PlayerCell player={third} />}
      </td>
    </tr>
  );
}

function PlayerCell({
  player,
  showDetail = false,
}: {
  player: Player;
  showDetail?: boolean;
}) {
  const isOut =
    player.injuryStatus === "Out" ||
    player.injuryStatus === "IR" ||
    player.injuryStatus === "Suspended";

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/player/${player.id}`}
        className={`text-sm hover:underline ${
          isOut
            ? "text-text-muted line-through"
            : "text-text-primary"
        }`}
      >
        <span className="font-mono text-[11px] text-text-muted">
          #{player.jerseyNumber}
        </span>{" "}
        {player.name}
      </Link>
      <StatusBadge status={player.injuryStatus} showOnlyIfNotActive />
      {showDetail && player.injuryDetail && (
        <span className="text-[10px] text-text-muted">
          {player.injuryDetail}
        </span>
      )}
    </div>
  );
}
```

- [ ] **10.2** Create `src/components/DepthChartGrid.tsx`:

```tsx
"use client";

import { useState } from "react";
import { DepthChartEntry, PositionGroup } from "@/types";
import { DepthChartRow } from "./DepthChartRow";

type FilterTab = "all" | PositionGroup;

const tabs: { label: string; value: FilterTab }[] = [
  { label: "All", value: "all" },
  { label: "Offense", value: "offense" },
  { label: "Defense", value: "defense" },
  { label: "Special Teams", value: "specialTeams" },
];

interface DepthChartGridProps {
  depthChart: DepthChartEntry[];
}

export function DepthChartGrid({ depthChart }: DepthChartGridProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filtered =
    activeTab === "all"
      ? depthChart
      : depthChart.filter((e) => e.positionGroup === activeTab);

  return (
    <div>
      <div className="mb-4 flex gap-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-text-primary text-bg"
                : "bg-bg-card text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-lg border border-border bg-bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                Pos
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                Starter
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                2nd
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                3rd
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => (
              <DepthChartRow
                key={entry.position}
                position={entry.position}
                players={entry.players}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **10.3** Create `src/app/team/[teamId]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { createMockRosterService } from "@/services/rosterService";
import { DepthChartGrid } from "@/components/DepthChartGrid";
import { NewsFeed } from "@/components/NewsFeed";

function formatLastUpdated(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const service = createMockRosterService();
  const roster = service.getTeamRoster(teamId);

  if (!roster) {
    notFound();
  }

  const { team, depthChart, news } = roster;

  return (
    <div className="flex h-[calc(100vh-49px)]">
      {/* Depth Chart — Left */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Team Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{team.logo}</span>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {team.fullName}
              </h1>
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <span>
                  {team.conference} {team.division}
                </span>
                <span className="text-text-muted">\u00b7</span>
                <span>{team.record}</span>
                <span className="text-text-muted">\u00b7</span>
                <span className="font-mono text-xs text-text-muted">
                  Updated {formatLastUpdated(team.lastUpdated)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DepthChartGrid depthChart={depthChart} />
      </div>

      {/* Team News — Right */}
      <div className="w-[380px] border-l border-border bg-bg-card">
        <NewsFeed
          items={news}
          title={`${team.name} News`}
          showFilters={false}
        />
      </div>
    </div>
  );
}
```

- [ ] **10.4** Create `src/app/team/[teamId]/not-found.tsx`:

```tsx
import Link from "next/link";

export default function TeamNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <h1 className="mb-2 text-2xl font-bold text-text-primary">
        Team Not Found
      </h1>
      <p className="mb-6 text-sm text-text-secondary">
        The team you're looking for doesn't exist.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-text-primary px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
      >
        Back to Home
      </Link>
    </div>
  );
}
```

- [ ] **10.5** Verify build:

```bash
npm run build
```

- [ ] **10.6** Commit:

```bash
git add src/components/DepthChartRow.tsx src/components/DepthChartGrid.tsx src/app/team/ && git commit -m "feat: add team depth chart page with position filtering"
```

---

## Task 11: Player Detail Page

**Goal:** Build the player detail page with status card, timeline, and sidebar.

### Steps

- [ ] **11.1** Create `src/components/PlayerHeader.tsx`:

```tsx
import { Player } from "@/types";
import { StatusBadge } from "./StatusBadge";

interface PlayerHeaderProps {
  player: Player;
}

export function PlayerHeader({ player }: PlayerHeaderProps) {
  const displayPos = player.position.replace(/\d+$/, "");

  return (
    <div className="flex items-start gap-5">
      {/* Photo placeholder */}
      <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-bg-card-hover text-2xl font-bold text-text-muted">
        #{player.jerseyNumber}
      </div>
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text-primary">
            {player.name}
          </h1>
          <StatusBadge status={player.injuryStatus} />
        </div>
        <div className="mt-1 flex items-center gap-2 text-sm text-text-secondary">
          <span className="font-semibold">{displayPos}{player.depthOrder === 1 ? "1" : player.depthOrder === 2 ? "2" : "3"}</span>
          <span className="text-text-muted">\u00b7</span>
          <span>#{player.jerseyNumber}</span>
          <span className="text-text-muted">\u00b7</span>
          <span>{player.team}</span>
        </div>
        <div className="mt-2 flex gap-4 text-xs text-text-muted">
          <span>{player.height}</span>
          <span>{player.weight} lbs</span>
          <span>Age {player.age}</span>
          <span>Yr {player.experience}</span>
          <span>{player.college}</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **11.2** Create `src/components/PlayerStatusCard.tsx`:

```tsx
import { Player } from "@/types";

interface PlayerStatusCardProps {
  player: Player;
  lastVerified: string;
}

const borderColorMap: Record<string, string> = {
  Active: "border-status-green",
  Questionable: "border-status-amber",
  Doubtful: "border-status-amber",
  Out: "border-status-red",
  IR: "border-status-red",
  Suspended: "border-status-red",
  Holdout: "border-status-amber",
};

export function PlayerStatusCard({
  player,
  lastVerified,
}: PlayerStatusCardProps) {
  const borderColor = borderColorMap[player.injuryStatus] || "border-border";

  return (
    <div
      className={`rounded-lg border-l-4 bg-bg-card p-4 ${borderColor}`}
    >
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
        Current Status
      </h3>
      <p className="text-lg font-bold text-text-primary">
        {player.injuryStatus}
      </p>
      {player.injuryDetail && (
        <p className="mt-1 text-sm text-text-secondary">
          {player.injuryDetail}
        </p>
      )}
      <p className="mt-2 font-mono text-[10px] text-text-muted">
        Verified{" "}
        {new Date(lastVerified).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}
      </p>
    </div>
  );
}
```

- [ ] **11.3** Create `src/components/PlayerTimeline.tsx`:

```tsx
import { NewsItem, NewsCategory } from "@/types";

const dotColor: Record<NewsCategory, string> = {
  INJURY: "bg-status-red",
  TRADE: "bg-status-blue",
  SIGNING: "bg-status-blue",
  IR: "bg-status-red",
  DEPTH_CHART: "bg-status-green",
  SUSPENSION: "bg-status-red",
  RETURN: "bg-status-green",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface PlayerTimelineProps {
  newsItems: NewsItem[];
}

export function PlayerTimeline({ newsItems }: PlayerTimelineProps) {
  if (newsItems.length === 0) {
    return (
      <p className="py-4 text-sm text-text-muted">
        No recent news for this player.
      </p>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

      <div className="space-y-4">
        {newsItems.map((item) => (
          <div key={item.id} className="relative flex gap-4 pl-6">
            {/* Timeline dot */}
            <div
              className={`absolute left-0 top-1.5 h-[14px] w-[14px] rounded-full border-2 border-bg ${dotColor[item.category]}`}
            />
            <div>
              <p className="font-mono text-[11px] text-text-muted">
                {formatDate(item.timestamp)}
              </p>
              <h4 className="mt-0.5 text-sm font-medium text-text-primary">
                {item.headline}
              </h4>
              <p className="mt-0.5 text-xs text-text-secondary">
                {item.description}
              </p>
              {item.source && (
                <p className="mt-1 font-mono text-[10px] text-text-muted">
                  {item.source}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **11.4** Create `src/components/PlayerSidebar.tsx`:

```tsx
import Link from "next/link";
import { Player, DepthChartEntry, Team } from "@/types";

interface PlayerSidebarProps {
  player: Player;
  team: Team;
  depthChartEntry?: DepthChartEntry;
}

export function PlayerSidebar({
  player,
  team,
  depthChartEntry,
}: PlayerSidebarProps) {
  const displayPos = player.position.replace(/\d+$/, "");

  return (
    <div className="space-y-5">
      {/* Depth Chart Position */}
      {depthChartEntry && (
        <div className="rounded-lg border border-border bg-bg-card p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            {displayPos} Depth Chart
          </h3>
          <div className="space-y-1.5">
            {depthChartEntry.players.map((p) => (
              <Link
                key={p.id}
                href={`/player/${p.id}`}
                className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                  p.id === player.id
                    ? "bg-bg-card-hover font-medium text-text-primary"
                    : "text-text-secondary hover:bg-bg-card-hover hover:text-text-primary"
                }`}
              >
                <span>
                  {displayPos}{p.depthOrder} \u2014 {p.name}
                </span>
                <span className="font-mono text-[11px] text-text-muted">
                  #{p.jerseyNumber}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Next Game (placeholder) */}
      <div className="rounded-lg border border-border bg-bg-card p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Next Game
        </h3>
        <p className="text-sm text-text-secondary">
          {team.fullName}
        </p>
        <p className="mt-1 text-xs text-text-muted">
          Schedule data coming soon
        </p>
      </div>

      {/* Season Stats */}
      <div className="rounded-lg border border-border bg-bg-card p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Season Stats
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(player.stats)
            .slice(0, 4)
            .map(([key, value]) => (
              <div key={key}>
                <p className="font-mono text-[10px] uppercase text-text-muted">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </p>
                <p className="text-lg font-bold text-text-primary">
                  {typeof value === "number" && value % 1 !== 0
                    ? value.toFixed(1)
                    : value}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **11.5** Create `src/app/player/[playerId]/page.tsx`:

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { createMockRosterService } from "@/services/rosterService";
import { PlayerHeader } from "@/components/PlayerHeader";
import { PlayerStatusCard } from "@/components/PlayerStatusCard";
import { PlayerTimeline } from "@/components/PlayerTimeline";
import { PlayerSidebar } from "@/components/PlayerSidebar";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;
  const service = createMockRosterService();

  const player = service.getPlayer(playerId);
  if (!player) {
    notFound();
  }

  const team = service.getTeam(player.team);
  if (!team) {
    notFound();
  }

  const playerNews = service.getPlayerNews(playerId);
  const roster = service.getTeamRoster(player.team);
  const depthChartEntry = roster?.depthChart.find(
    (e) => e.position === player.position
  );
  const lastVerified = service.getLastVerified();

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-text-muted">
        <Link href="/" className="hover:text-text-secondary">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/team/${team.id}`}
          className="hover:text-text-secondary"
        >
          {team.fullName}
        </Link>
        <span>/</span>
        <span className="text-text-secondary">{player.name}</span>
      </nav>

      <div className="flex gap-8">
        {/* Left Column */}
        <div className="flex-1 space-y-6">
          <PlayerHeader player={player} />
          <PlayerStatusCard
            player={player}
            lastVerified={lastVerified}
          />
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-secondary">
              News Timeline
            </h2>
            <PlayerTimeline newsItems={playerNews} />
          </div>
        </div>

        {/* Right Column */}
        <div className="w-[320px]">
          <PlayerSidebar
            player={player}
            team={team}
            depthChartEntry={depthChartEntry}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **11.6** Create `src/app/player/[playerId]/not-found.tsx`:

```tsx
import Link from "next/link";

export default function PlayerNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <h1 className="mb-2 text-2xl font-bold text-text-primary">
        Player Not Found
      </h1>
      <p className="mb-6 text-sm text-text-secondary">
        The player you're looking for doesn't exist.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-text-primary px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
      >
        Back to Home
      </Link>
    </div>
  );
}
```

- [ ] **11.7** Verify build:

```bash
npm run build
```

- [ ] **11.8** Commit:

```bash
git add src/components/Player*.tsx src/app/player/ && git commit -m "feat: add player detail page with status card, timeline, and sidebar"
```

---

## Task 12: Search Functionality

**Goal:** Build the search results page.

### Steps

- [ ] **12.1** Create `src/app/search/page.tsx`:

```tsx
"use client";

import { use } from "react";
import Link from "next/link";
import { createMockRosterService } from "@/services/rosterService";
import { StatusBadge } from "@/components/StatusBadge";

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { q } = use(searchParams);
  const query = typeof q === "string" ? q : "";

  const service = createMockRosterService();
  const matchingPlayers = query ? service.searchPlayers(query) : [];
  const matchingTeams = query ? service.searchTeams(query) : [];

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-1 text-xl font-bold text-text-primary">
        Search Results
      </h1>
      <p className="mb-6 text-sm text-text-muted">
        {query ? (
          <>
            Showing results for &ldquo;{query}&rdquo;
          </>
        ) : (
          "Enter a search term to find players or teams."
        )}
      </p>

      {/* Teams */}
      {matchingTeams.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
            Teams ({matchingTeams.length})
          </h2>
          <div className="space-y-1">
            {matchingTeams.map((team) => (
              <Link
                key={team.id}
                href={`/team/${team.id}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-bg-card px-4 py-3 transition-colors hover:bg-bg-card-hover"
              >
                <span className="text-xl">{team.logo}</span>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {team.fullName}
                  </p>
                  <p className="text-xs text-text-muted">
                    {team.conference} {team.division} \u00b7 {team.record}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Players */}
      {matchingPlayers.length > 0 && (
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
            Players ({matchingPlayers.length})
          </h2>
          <div className="space-y-1">
            {matchingPlayers.map((player) => (
              <Link
                key={player.id}
                href={`/player/${player.id}`}
                className="flex items-center justify-between rounded-lg border border-border bg-bg-card px-4 py-3 transition-colors hover:bg-bg-card-hover"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-text-muted">
                    #{player.jerseyNumber}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {player.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {player.position.replace(/\d+$/, "")} \u00b7{" "}
                      {player.team}
                    </p>
                  </div>
                </div>
                <StatusBadge
                  status={player.injuryStatus}
                  showOnlyIfNotActive
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {query && matchingTeams.length === 0 && matchingPlayers.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-text-muted">
            No results found for &ldquo;{query}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **12.2** Verify build:

```bash
npm run build
```

- [ ] **12.3** Commit:

```bash
git add src/app/search/ && git commit -m "feat: add search results page"
```

---

## Task 13: Final Verification

**Goal:** Run all checks and fix any issues.

### Steps

- [ ] **13.1** Run tests:

```bash
npm test -- --verbose
```

- [ ] **13.2** Run type check:

```bash
npx tsc --noEmit
```

- [ ] **13.3** Run build:

```bash
npm run build
```

- [ ] **13.4** Manual verification checklist:
  - [ ] Home page loads at `/` with team grid and news feed
  - [ ] Team cards link to `/team/[teamId]`
  - [ ] Team page shows depth chart and team-filtered news
  - [ ] Filter tabs (All/Offense/Defense/Special Teams) work
  - [ ] Player names link to `/player/[playerId]`
  - [ ] Player page shows header, status card, timeline, sidebar
  - [ ] Breadcrumb navigation works
  - [ ] Search bar navigates to `/search?q=...`
  - [ ] Search results show matching players and teams
  - [ ] Not-found pages render for invalid team/player IDs
  - [ ] Dark theme is consistent across all pages
  - [ ] Status badges show correct colors
  - [ ] News category badges show correct colors

- [ ] **13.5** Fix any issues found during verification.

- [ ] **13.6** Final commit:

```bash
git add -A && git commit -m "chore: final verification and cleanup"
```
