# Schedule Page & Playoff Implications — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a weekly schedule page with bracket-style matchups, playoff scenario engine, and rule changes footer drawer.

**Architecture:** ESPN scoreboard API → new `EspnScheduleAdapter` → `games` table in Turso → `/schedule` page with bracket UI. Playoff engine computes scenarios from standings + remaining schedule. Rule changes are a static data file shown in a footer modal.

**Tech Stack:** Next.js 16 (App Router, server components), Turso/libsql, ESPN API, Tailwind CSS 4

**Spec:** `docs/superpowers/specs/2026-04-19-schedule-and-playoffs-design.md`

**Important:** This is a Next.js 16 codebase. Read `node_modules/next/dist/docs/` before writing code if unfamiliar. Key pattern: page `params` and `searchParams` are `Promise<{...}>` and must be awaited.

---

### Task 1: Add Game type and extend RosterService interface

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add Game type and GameStatus type to `src/types/index.ts`**

Add these after the `TeamRoster` interface (before the `RosterService` interface):

```typescript
export type GameStatus = "scheduled" | "in_progress" | "final";

export interface Game {
  id: string;
  week: number;
  seasonType: "regular" | "postseason";
  awayTeam: Team;
  homeTeam: Team;
  gameTime: string;
  tvNetwork?: string;
  awayScore?: number;
  homeScore?: number;
  status: GameStatus;
}

export interface PlayoffScenario {
  teamId: string;
  status: "clinched_division" | "clinched_playoff" | "in_hunt" | "eliminated";
  seed?: number;
  scenarioText: string;
  mustWin: boolean;
  relevantGames?: string[];
}
```

- [ ] **Step 2: Add new methods to the `RosterService` interface**

Add these two methods to the `RosterService` interface:

```typescript
  getWeekGames(week: number): Promise<Game[]>;
  getCurrentWeek(): Promise<number>;
```

- [ ] **Step 3: Verify TypeScript compiles (expect errors in service implementations)**

Run: `npx tsc --noEmit 2>&1 | grep 'error TS' | grep -v '__tests__' | grep -v '.test.' | grep -v 'node_modules' | grep -v '.next'`

Expected: Errors in `liveRosterService.ts` and `rosterService.ts` about missing `getWeekGames` and `getCurrentWeek`. This is correct — we'll implement them next.

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add Game type and schedule methods to RosterService interface"
```

---

### Task 2: Add `games` table to database schema

**Files:**
- Modify: `src/db/schema.ts`

- [ ] **Step 1: Add `GAMES` to `TABLE_NAMES` constant**

```typescript
export const TABLE_NAMES = {
  PLAYERS: "players",
  NEWS: "news",
  SCRAPE_LOG: "scrape_log",
  GAMES: "games",
} as const;
```

- [ ] **Step 2: Add `games` table and indexes to `createTables` function**

Add this SQL before the closing backtick of the `executeMultiple` call, after the existing `CREATE INDEX` statements:

```sql
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
```

- [ ] **Step 3: Create the table in production Turso**

Run locally to create the table in the live database (uses `.env.local` credentials):

```bash
npx tsx -e "
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
db.executeMultiple(\`
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
\`).then(() => { console.log('games table created'); db.close(); });
"
```

Expected: `games table created`

- [ ] **Step 4: Commit**

```bash
git add src/db/schema.ts
git commit -m "feat: add games table to database schema"
```

---

### Task 3: Create ESPN Schedule Adapter

**Files:**
- Create: `src/scraper/adapters/espn-schedule.ts`

- [ ] **Step 1: Create the schedule adapter**

Create `src/scraper/adapters/espn-schedule.ts`:

```typescript
import { SourceAdapter, ScrapedItem } from "../types";

// Reuse ESPN team ID mapping — maps our abbreviations to ESPN numeric IDs
const ESPN_TEAM_IDS: Record<string, string> = {
  ARI: "22", ATL: "1", BAL: "33", BUF: "2", CAR: "29", CHI: "3",
  CIN: "4", CLE: "5", DAL: "6", DEN: "7", DET: "8", GB: "9",
  HOU: "34", IND: "11", JAX: "30", KC: "12", LV: "13", LAC: "24",
  LAR: "14", MIA: "15", MIN: "16", NE: "17", NO: "18", NYG: "19",
  NYJ: "20", PHI: "21", PIT: "23", SF: "25", SEA: "26", TB: "27",
  TEN: "10", WAS: "28",
};

// Reverse map: ESPN numeric ID → our abbreviation
const ESPN_ID_TO_ABBREV: Record<string, string> = {};
for (const [abbrev, id] of Object.entries(ESPN_TEAM_IDS)) {
  ESPN_ID_TO_ABBREV[id] = abbrev;
}

interface EspnCompetitor {
  id: string;
  homeAway: "home" | "away";
  team: { id: string; abbreviation: string };
  score?: string;
}

interface EspnCompetition {
  id: string;
  date: string;
  status: { type: { name: string } };
  competitors: EspnCompetitor[];
  broadcasts?: Array<{ names: string[] }>;
}

interface EspnEvent {
  id: string;
  date: string;
  competitions: EspnCompetition[];
  week: { number: number };
  season: { type: number }; // 2 = regular, 3 = postseason
}

interface EspnScoreboardResponse {
  events: EspnEvent[];
  week?: { number: number };
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(30_000),
      headers: { "User-Agent": "RosterPulse/1.0" },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function mapStatus(espnStatus: string): "scheduled" | "in_progress" | "final" {
  switch (espnStatus) {
    case "STATUS_FINAL":
    case "STATUS_FINAL_OVERTIME":
      return "final";
    case "STATUS_IN_PROGRESS":
    case "STATUS_HALFTIME":
    case "STATUS_END_PERIOD":
      return "in_progress";
    default:
      return "scheduled";
  }
}

export class EspnScheduleAdapter implements SourceAdapter {
  name = "espn-schedule";
  private weeks: number[];

  /**
   * @param weeks - Which weeks to fetch. Defaults to all 18 regular season weeks.
   */
  constructor(weeks?: number[]) {
    this.weeks = weeks ?? Array.from({ length: 18 }, (_, i) => i + 1);
  }

  async fetch(): Promise<ScrapedItem[]> {
    const items: ScrapedItem[] = [];
    const now = new Date().toISOString();

    // Fetch each week's scoreboard
    for (const week of this.weeks) {
      const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?week=${week}&seasontype=2`;
      const data = await fetchJson<EspnScoreboardResponse>(url);
      if (!data?.events) continue;

      for (const event of data.events) {
        const comp = event.competitions[0];
        if (!comp) continue;

        const away = comp.competitors.find((c) => c.homeAway === "away");
        const home = comp.competitors.find((c) => c.homeAway === "home");
        if (!away || !home) continue;

        const awayAbbrev = ESPN_ID_TO_ABBREV[away.team.id] ?? away.team.abbreviation;
        const homeAbbrev = ESPN_ID_TO_ABBREV[home.team.id] ?? home.team.abbreviation;

        const tvNetwork = comp.broadcasts?.[0]?.names?.[0] ?? null;
        const status = mapStatus(comp.status.type.name);

        const awayScore = away.score != null ? parseInt(away.score, 10) : null;
        const homeScore = home.score != null ? parseInt(home.score, 10) : null;

        items.push({
          type: "player", // reuse "player" type for DB insertion via orchestrator
          sourceAdapter: this.name,
          source: "espn",
          sourceUrl: `https://www.espn.com/nfl/game/_/gameId/${event.id}`,
          confidence: "official",
          fetchedAt: now,
          rawData: {
            _gameData: true, // flag to distinguish from player items
            id: `2026-W${String(week).padStart(2, "0")}-${awayAbbrev}-${homeAbbrev}`,
            week,
            seasonType: "regular",
            awayTeam: awayAbbrev,
            homeTeam: homeAbbrev,
            gameTime: comp.date,
            tvNetwork,
            awayScore: status === "final" ? awayScore : null,
            homeScore: status === "final" ? homeScore : null,
            status,
          },
        });
      }
    }

    return items;
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep 'espn-schedule' | head -5`

Expected: No errors for this file.

- [ ] **Step 3: Commit**

```bash
git add src/scraper/adapters/espn-schedule.ts
git commit -m "feat: add ESPN schedule adapter for weekly matchup data"
```

---

### Task 4: Update orchestrator to handle game data

**Files:**
- Modify: `src/scraper/orchestrator.ts`

- [ ] **Step 1: Add game insertion logic to the orchestrator**

In `src/scraper/orchestrator.ts`, inside the `try` block of the transaction, after the existing `for (const item of adapterResult.items)` loop's `else if (item.type === "news")` block, add a new condition to handle game data. Find the closing `}` of the news else-if block and add:

```typescript
        // Handle game data (from schedule adapter)
        if (item.type === "player" && item.rawData._gameData) {
          const g = item.rawData;
          await tx.execute({
            sql: `INSERT OR REPLACE INTO games
              (id, week, seasonType, awayTeam, homeTeam, gameTime, tvNetwork,
               awayScore, homeScore, status, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              g.id as string, g.week as number, g.seasonType as string,
              g.awayTeam as string, g.homeTeam as string, g.gameTime as string,
              (g.tvNetwork as string) ?? null,
              (g.awayScore as number) ?? null, (g.homeScore as number) ?? null,
              g.status as string, item.fetchedAt,
            ],
          });
          itemsNew++;
          continue; // skip player normalization for game data
        }
```

This must be placed **before** the existing `if (item.type === "player")` block. Move the existing player block into an `else if`:

Find:
```typescript
        if (item.type === "player") {
```

Replace with:
```typescript
        if (item.type === "player" && item.rawData._gameData) {
          const g = item.rawData;
          await tx.execute({
            sql: `INSERT OR REPLACE INTO games
              (id, week, seasonType, awayTeam, homeTeam, gameTime, tvNetwork,
               awayScore, homeScore, status, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              g.id as string, g.week as number, g.seasonType as string,
              g.awayTeam as string, g.homeTeam as string, g.gameTime as string,
              (g.tvNetwork as string) ?? null,
              (g.awayScore as number) ?? null, (g.homeScore as number) ?? null,
              g.status as string, item.fetchedAt,
            ],
          });
          itemsNew++;
        } else if (item.type === "player") {
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep 'orchestrator' | head -5`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/scraper/orchestrator.ts
git commit -m "feat: handle game data insertion in scrape orchestrator"
```

---

### Task 5: Register schedule adapter in scrape route and CLI

**Files:**
- Modify: `src/app/api/scrape/route.ts`
- Modify: `src/scraper/cli.ts`

- [ ] **Step 1: Add schedule adapter to the API route**

In `src/app/api/scrape/route.ts`, add import:

```typescript
import { EspnScheduleAdapter } from "@/scraper/adapters/espn-schedule";
```

Add the adapter to the adapters array:

```typescript
    const adapters = [
      new EspnRssAdapter(),
      new NflTransactionsAdapter(),
      new EspnRosterAdapter(),
      new RotoworldRssAdapter(),
      new EspnScheduleAdapter(),
    ];
```

- [ ] **Step 2: Add schedule adapter to the CLI**

In `src/scraper/cli.ts`, add import:

```typescript
import { EspnScheduleAdapter } from "./adapters/espn-schedule";
```

Add to adapters array:

```typescript
  const adapters = [
    new EspnRssAdapter(),
    new NflTransactionsAdapter(),
    new EspnRosterAdapter(),
    new RotoworldRssAdapter(),
    new EspnScheduleAdapter(),
  ];
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/scrape/route.ts src/scraper/cli.ts
git commit -m "feat: register ESPN schedule adapter in scrape pipeline"
```

---

### Task 6: Implement `getWeekGames` and `getCurrentWeek` in services

**Files:**
- Modify: `src/services/liveRosterService.ts`
- Modify: `src/services/rosterService.ts`

- [ ] **Step 1: Add game methods to live roster service**

In `src/services/liveRosterService.ts`, add `Game` and `GameStatus` to the imports from `@/types`:

```typescript
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
} from "@/types";
```

Add these two methods before the closing `};` of the return object in `createLiveRosterService`:

```typescript
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
        "SELECT MAX(week) as week FROM games WHERE gameTime <= datetime('now') AND seasonType = 'regular'"
      );
      const week = result.rows[0]?.week as number | null;
      // Default to week 1 if no games found, cap at 18
      return Math.min(Math.max(week ?? 1, 1), 18);
    },
```

- [ ] **Step 2: Add game methods to mock roster service**

In `src/services/rosterService.ts`, add `Game` to the imports:

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
  Game,
} from "@/types";
```

Add these two methods before the closing `};` of the return object in `createMockRosterService`:

```typescript
    async getWeekGames(_week: number): Promise<Game[]> {
      return [];
    },

    async getCurrentWeek(): Promise<number> {
      return 1;
    },
```

- [ ] **Step 3: Verify TypeScript compiles with no source errors**

Run: `npx tsc --noEmit 2>&1 | grep 'error TS' | grep -v '__tests__' | grep -v '.test.' | grep -v 'node_modules' | grep -v '.next' | head -10`

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/services/liveRosterService.ts src/services/rosterService.ts
git commit -m "feat: implement getWeekGames and getCurrentWeek in roster services"
```

---

### Task 7: Create rule changes data file

**Files:**
- Create: `src/data/rule-changes.ts`

- [ ] **Step 1: Create the data file**

Create `src/data/rule-changes.ts`:

```typescript
export interface RuleChange {
  title: string;
  description: string;
}

export const ruleChanges: RuleChange[] = [
  // Updated once per year when NFL announces rule changes.
  // Leave empty to hide the "Rule Changes" link in the footer.
  //
  // Example:
  // {
  //   title: "Dynamic Kickoff",
  //   description: "New kickoff format with aligned teams, designed to increase return rates and reduce injuries.",
  // },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/data/rule-changes.ts
git commit -m "feat: add rule changes data file (empty, populated annually)"
```

---

### Task 8: Create RuleChangesModal component

**Files:**
- Create: `src/components/RuleChangesModal.tsx`

- [ ] **Step 1: Create the modal component**

Create `src/components/RuleChangesModal.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { ruleChanges } from "@/data/rule-changes";

export function RuleChangesModal() {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (ruleChanges.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-text-muted hover:text-text-secondary transition-colors"
      >
        2026 Rule Changes
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Drawer */}
          <div
            ref={drawerRef}
            className="relative w-full max-w-2xl rounded-t-xl border border-border bg-bg-card p-6 shadow-2xl"
            style={{ maxHeight: "70vh", overflowY: "auto" }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-primary">
                2026 NFL Rule Changes
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-text-muted hover:text-text-secondary text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              {ruleChanges.map((rule, i) => (
                <div key={i} className="border-b border-border pb-4 last:border-0">
                  <h3 className="text-sm font-semibold text-text-primary">
                    {rule.title}
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    {rule.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/RuleChangesModal.tsx
git commit -m "feat: add RuleChangesModal component (footer drawer)"
```

---

### Task 9: Add rule changes link and Schedule nav to Footer and TopBar

**Files:**
- Modify: `src/components/Footer.tsx`
- Modify: `src/components/TopBar.tsx`

- [ ] **Step 1: Update Footer to include RuleChangesModal**

Replace `src/components/Footer.tsx`:

```tsx
import { RuleChangesModal } from "./RuleChangesModal";

export function Footer() {
  return (
    <footer className="border-t border-border px-4 sm:px-6 py-3 text-[11px] text-text-muted flex items-center justify-between">
      <span>Data via ESPN. Not affiliated with the NFL.</span>
      <div className="flex items-center gap-3">
        <RuleChangesModal />
        <span className="font-mono">RosterPulse &copy; {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Add Schedule link to TopBar**

In `src/components/TopBar.tsx`, add the Schedule link inside the left section, after the LIVE badge `</span>` and before the closing `</Link>`:

Actually, the Schedule link should be **outside** the home Link. Find the closing `</Link>` tag for the logo link and add the Schedule link right after it:

```tsx
        <Link href="/" className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight text-text-primary">
            RosterPulse
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-status-green-bg px-2 py-0.5 text-[10px] font-semibold text-status-green">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-status-green" />
            LIVE
          </span>
        </Link>
        <Link
          href="/schedule"
          className="hidden sm:inline text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          Schedule
        </Link>
```

- [ ] **Step 3: Verify the build compiles**

Run: `npx next build 2>&1 | tail -15`

Expected: Build succeeds with all routes listed.

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.tsx src/components/TopBar.tsx
git commit -m "feat: add Schedule nav link and rule changes footer drawer"
```

---

### Task 10: Create ScheduleBracket component

**Files:**
- Create: `src/components/ScheduleBracket.tsx`

- [ ] **Step 1: Create the bracket component**

Create `src/components/ScheduleBracket.tsx`:

```tsx
import Link from "next/link";
import Image from "next/image";
import type { Game, Player } from "@/types";

interface ScheduleBracketProps {
  game: Game;
  /** Starter injuries for both teams (optional, for injury badges) */
  injurySummary?: {
    awayOut: number;
    awayQuestionable: number;
    homeOut: number;
    homeQuestionable: number;
  };
  /** Whether away or home team is a favorite */
  favTeams?: Set<string>;
  /** Primetime style: "snf" | "mnf" | null */
  primetime?: "snf" | "mnf" | null;
  /** Playoff tag text, e.g. "Win & in" */
  playoffTag?: { text: string; color: string } | null;
}

function formatGameTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  });
}

export function ScheduleBracket({
  game,
  injurySummary,
  favTeams,
  primetime,
  playoffTag,
}: ScheduleBracketProps) {
  const isFavAway = favTeams?.has(game.awayTeam.id) ?? false;
  const isFavHome = favTeams?.has(game.homeTeam.id) ?? false;

  const borderClass =
    primetime === "snf"
      ? "border-status-blue/20 shadow-[0_0_12px_rgba(59,130,246,0.06)]"
      : primetime === "mnf"
        ? "border-status-amber/20 shadow-[0_0_12px_rgba(245,158,11,0.06)]"
        : "border-border";

  return (
    <div className="w-[220px]">
      <div className={`flex flex-col rounded-lg border overflow-hidden ${borderClass}`}>
        {/* Away team (top) */}
        <Link
          href={`/team/${game.awayTeam.id}`}
          className={`flex items-center gap-2.5 px-3 py-2.5 border-b-2 border-border/50 transition-colors hover:bg-bg-card-hover ${isFavAway ? "bg-status-blue-bg/30" : ""}`}
        >
          <Image
            src={game.awayTeam.logo}
            alt={game.awayTeam.name}
            width={26}
            height={26}
            className="h-[26px] w-[26px] object-contain"
          />
          <span className="flex-1 text-[13px] font-semibold text-text-primary">
            {game.awayTeam.name}
          </span>
          <span className="font-mono text-[11px] text-text-muted">
            {game.awayTeam.record}
          </span>
        </Link>

        {/* Home team (bottom) */}
        <Link
          href={`/team/${game.homeTeam.id}`}
          className={`flex items-center gap-2.5 px-3 py-2.5 transition-colors hover:bg-bg-card-hover ${isFavHome ? "bg-status-blue-bg/30" : ""}`}
        >
          <Image
            src={game.homeTeam.logo}
            alt={game.homeTeam.name}
            width={26}
            height={26}
            className="h-[26px] w-[26px] object-contain"
          />
          <span className="flex-1 text-[13px] font-semibold text-text-primary">
            {game.homeTeam.name}
          </span>
          <span className="font-mono text-[11px] text-text-muted">
            {game.homeTeam.record}
          </span>
        </Link>
      </div>

      {/* Game info / injury badges below bracket */}
      <div className="mt-1 flex items-center justify-between px-1">
        <span className="text-[10px] text-text-muted">
          {game.status === "final"
            ? `Final ${game.awayScore}–${game.homeScore}`
            : formatGameTime(game.gameTime)}
        </span>
        <div className="flex items-center gap-1.5">
          {injurySummary && injurySummary.awayOut + injurySummary.homeOut > 0 && (
            <span className="text-[9px] text-status-red">
              {injurySummary.awayOut + injurySummary.homeOut} Out
            </span>
          )}
          {injurySummary &&
            injurySummary.awayQuestionable + injurySummary.homeQuestionable > 0 && (
              <span className="text-[9px] text-status-amber">
                {injurySummary.awayQuestionable + injurySummary.homeQuestionable} Q
              </span>
            )}
        </div>
      </div>

      {/* Playoff tag */}
      {playoffTag && (
        <div className="mt-0.5 px-1">
          <span className={`text-[9px] font-semibold ${playoffTag.color}`}>
            {playoffTag.text}
          </span>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ScheduleBracket.tsx
git commit -m "feat: add ScheduleBracket component for matchup display"
```

---

### Task 11: Create ScheduleGrid client component

**Files:**
- Create: `src/components/ScheduleGrid.tsx`

- [ ] **Step 1: Create the grid component**

Create `src/components/ScheduleGrid.tsx`:

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ScheduleBracket } from "./ScheduleBracket";
import { useFavoriteTeams } from "@/hooks/useFavorites";
import type { Game, PlayoffScenario } from "@/types";

interface TimeSlot {
  label: string;
  primetime: "snf" | "mnf" | null;
  games: Game[];
}

interface ScheduleGridProps {
  games: Game[];
  week: number;
  maxWeek: number;
  byeTeams: string[];
  injuryMap: Record<string, { out: number; questionable: number }>;
  playoffScenarios?: PlayoffScenario[];
}

function groupByTimeSlot(games: Game[]): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const slotMap = new Map<string, { label: string; primetime: "snf" | "mnf" | null; games: Game[] }>();

  for (const game of games) {
    const d = new Date(game.gameTime);
    const dayOfWeek = d.getUTCDay(); // 0=Sun, 1=Mon, ..., 4=Thu
    const hour = d.getUTCHours();

    let label: string;
    let primetime: "snf" | "mnf" | null = null;

    if (dayOfWeek === 4) {
      // Thursday
      label = "Thursday Night Football";
    } else if (dayOfWeek === 0 && hour >= 23) {
      // Sunday ~8pm ET = 00-01 UTC Monday
      label = "Sunday Night Football";
      primetime = "snf";
    } else if (dayOfWeek === 1 && hour <= 2) {
      // Sunday night game that starts late
      label = "Sunday Night Football";
      primetime = "snf";
    } else if (dayOfWeek === 1 || (dayOfWeek === 2 && hour <= 5)) {
      // Monday
      label = "Monday Night Football";
      primetime = "mnf";
    } else if (dayOfWeek === 0 && hour < 20) {
      // Sunday early/late
      if (hour < 19) {
        label = "Sunday Early · 1:00 PM";
      } else {
        label = "Sunday Late · 4:25 PM";
      }
    } else if (dayOfWeek === 6) {
      // Saturday (late season / playoffs)
      label = "Saturday";
    } else {
      label = d.toLocaleDateString("en-US", { weekday: "long", timeZone: "America/New_York" });
    }

    const existing = slotMap.get(label);
    if (existing) {
      existing.games.push(game);
    } else {
      slotMap.set(label, { label, primetime, games: [game] });
    }
  }

  for (const slot of slotMap.values()) {
    slots.push(slot);
  }

  return slots;
}

function getPlayoffTag(
  game: Game,
  scenarios?: PlayoffScenario[]
): { text: string; color: string } | null {
  if (!scenarios || scenarios.length === 0) return null;

  const awayScenario = scenarios.find((s) => s.teamId === game.awayTeam.id);
  const homeScenario = scenarios.find((s) => s.teamId === game.homeTeam.id);

  // Check for elimination game
  if (
    awayScenario?.mustWin &&
    awayScenario.status === "in_hunt" &&
    homeScenario?.mustWin &&
    homeScenario.status === "in_hunt"
  ) {
    return { text: "Elimination game", color: "text-status-red" };
  }

  // Check for win-and-in
  if (awayScenario?.scenarioText?.includes("win") && awayScenario?.scenarioText?.includes("clinch")) {
    return { text: "Win & in", color: "text-status-green" };
  }
  if (homeScenario?.scenarioText?.includes("win") && homeScenario?.scenarioText?.includes("clinch")) {
    return { text: "Win & in", color: "text-status-green" };
  }

  // Controls destiny
  if (awayScenario?.scenarioText?.includes("destiny") || homeScenario?.scenarioText?.includes("destiny")) {
    return { text: "Controls destiny", color: "text-status-blue" };
  }

  return null;
}

export function ScheduleGrid({
  games,
  week,
  maxWeek,
  byeTeams,
  injuryMap,
  playoffScenarios,
}: ScheduleGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { favTeams } = useFavoriteTeams();

  const favSet = new Set(favTeams);
  const slots = groupByTimeSlot(games);

  function navigateWeek(newWeek: number) {
    if (newWeek < 1 || newWeek > maxWeek) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("week", String(newWeek));
    router.push(`/schedule?${params.toString()}`);
  }

  return (
    <div>
      {/* Week Navigator */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigateWeek(week - 1)}
          disabled={week <= 1}
          className="rounded bg-bg-card px-2.5 py-1 text-sm text-text-muted hover:bg-bg-card-hover disabled:opacity-30"
        >
          ‹
        </button>
        <span className="text-base font-bold text-text-primary tracking-wide">
          WEEK {week}
        </span>
        <button
          onClick={() => navigateWeek(week + 1)}
          disabled={week >= maxWeek}
          className="rounded bg-bg-card px-2.5 py-1 text-sm text-text-muted hover:bg-bg-card-hover disabled:opacity-30"
        >
          ›
        </button>
      </div>

      {/* Time Slot Sections */}
      {slots.map((slot) => (
        <div key={slot.label} className="mb-7">
          <div className="mb-3 border-b border-border/50 pb-1.5">
            <span className="text-[9px] font-bold uppercase tracking-[2px] text-text-muted">
              {slot.label}
            </span>
          </div>
          <div className="flex flex-wrap gap-5">
            {slot.games.map((game) => {
              const awayInjury = injuryMap[game.awayTeam.id];
              const homeInjury = injuryMap[game.homeTeam.id];

              return (
                <ScheduleBracket
                  key={game.id}
                  game={game}
                  favTeams={favSet}
                  primetime={slot.primetime}
                  injurySummary={
                    awayInjury || homeInjury
                      ? {
                          awayOut: awayInjury?.out ?? 0,
                          awayQuestionable: awayInjury?.questionable ?? 0,
                          homeOut: homeInjury?.out ?? 0,
                          homeQuestionable: homeInjury?.questionable ?? 0,
                        }
                      : undefined
                  }
                  playoffTag={getPlayoffTag(game, playoffScenarios)}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* No games */}
      {games.length === 0 && (
        <div className="py-12 text-center text-sm text-text-muted">
          No games scheduled for this week yet.
        </div>
      )}

      {/* Bye Week */}
      {byeTeams.length > 0 && (
        <div className="mt-8 rounded-lg border border-border/30 bg-bg-card/50 px-4 py-3">
          <span className="text-[9px] font-bold uppercase tracking-[1.5px] text-text-muted">
            Bye Week:{" "}
          </span>
          <span className="text-[11px] text-text-secondary">
            {byeTeams.join(" · ")}
          </span>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ScheduleGrid.tsx
git commit -m "feat: add ScheduleGrid client component with week navigation"
```

---

### Task 12: Create the schedule page

**Files:**
- Create: `src/app/schedule/page.tsx`

- [ ] **Step 1: Create the schedule page**

Create `src/app/schedule/page.tsx`:

```tsx
import { createRosterService } from "@/services/createRosterService";
import { ScheduleGrid } from "@/components/ScheduleGrid";
import { NewsFeed } from "@/components/NewsFeed";
import { MobileNewsToggle } from "@/components/MobileNewsToggle";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { week: weekParam } = await searchParams;
  const service = createRosterService();

  const currentWeek = await service.getCurrentWeek();
  const week =
    typeof weekParam === "string" ? Math.max(1, Math.min(18, parseInt(weekParam, 10) || currentWeek)) : currentWeek;

  const [games, allNews] = await Promise.all([
    service.getWeekGames(week),
    service.getAllNews({ limit: 30 }),
  ]);

  // Compute bye teams for this week
  const allTeams = service.getAllTeams();
  const teamsPlaying = new Set<string>();
  for (const game of games) {
    teamsPlaying.add(game.awayTeam.id);
    teamsPlaying.add(game.homeTeam.id);
  }
  const byeTeams = allTeams
    .filter((t) => t.byeWeek === week || (!teamsPlaying.has(t.id) && games.length > 0))
    .map((t) => t.fullName);

  // Compute injury map: team → { out, questionable } for starters only
  const injuryMap: Record<string, { out: number; questionable: number }> = {};
  const teamIds = [...teamsPlaying];
  for (const teamId of teamIds) {
    const roster = await service.getTeamRoster(teamId);
    if (!roster) continue;

    let out = 0;
    let questionable = 0;
    for (const entry of roster.depthChart) {
      for (const p of entry.players) {
        if (p.depthOrder !== 1) continue; // starters only
        if (p.injuryStatus === "Out" || p.injuryStatus === "IR" || p.injuryStatus === "Suspended") out++;
        else if (p.injuryStatus === "Questionable" || p.injuryStatus === "Doubtful") questionable++;
      }
    }
    if (out > 0 || questionable > 0) {
      injuryMap[teamId] = { out, questionable };
    }
  }

  return (
    <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-49px)]">
      {/* Schedule Brackets — Left */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <ScheduleGrid
          games={games}
          week={week}
          maxWeek={18}
          byeTeams={byeTeams}
          injuryMap={injuryMap}
        />
      </div>

      {/* News Feed — Right (hidden on mobile) */}
      <div className="hidden lg:block w-[380px] border-l border-border bg-bg-card">
        <NewsFeed items={allNews} />
      </div>

      {/* Mobile News */}
      <MobileNewsToggle items={allNews} />
    </div>
  );
}
```

- [ ] **Step 2: Build and verify**

Run: `npx next build 2>&1 | tail -20`

Expected: Build succeeds. `/schedule` should appear in the route list as `ƒ` (dynamic).

- [ ] **Step 3: Commit**

```bash
git add src/app/schedule/page.tsx
git commit -m "feat: add schedule page with bracket matchups and injury badges"
```

---

### Task 13: Create playoff scenario engine

**Files:**
- Create: `src/services/playoffEngine.ts`

- [ ] **Step 1: Create the playoff engine**

Create `src/services/playoffEngine.ts`:

```typescript
import type { Game, PlayoffScenario, Team } from "@/types";

const PLAYOFF_SPOTS_PER_CONFERENCE = 7;

interface TeamStanding {
  team: Team;
  wins: number;
  losses: number;
  remainingGames: Game[];
  maxPossibleWins: number;
}

function parseRecord(record: string): { wins: number; losses: number } {
  const parts = record.split("-").map(Number);
  return { wins: parts[0] ?? 0, losses: parts[1] ?? 0 };
}

function getConferenceStandings(
  teams: Team[],
  allGames: Game[],
  conference: "AFC" | "NFC"
): TeamStanding[] {
  const confTeams = teams.filter((t) => t.conference === conference);

  return confTeams.map((team) => {
    const { wins, losses } = parseRecord(team.record);
    const remainingGames = allGames.filter(
      (g) =>
        g.status !== "final" &&
        (g.awayTeam.id === team.id || g.homeTeam.id === team.id)
    );
    const maxPossibleWins = wins + remainingGames.length;

    return { team, wins, losses, remainingGames, maxPossibleWins };
  });
}

function isEliminated(standing: TeamStanding, allStandings: TeamStanding[]): boolean {
  // A team is eliminated if even with max wins, they can't make the top 7
  const otherTeams = allStandings
    .filter((s) => s.team.id !== standing.team.id)
    .map((s) => s.wins) // current wins (minimum they'll finish with)
    .sort((a, b) => b - a);

  // Need to beat at least the 7th-best team's current wins
  const seventhBestCurrentWins = otherTeams[PLAYOFF_SPOTS_PER_CONFERENCE - 1] ?? 0;

  return standing.maxPossibleWins < seventhBestCurrentWins;
}

function hasClinched(standing: TeamStanding, allStandings: TeamStanding[]): boolean {
  // A team has clinched if even with no more wins, they're guaranteed top 7
  const otherTeams = allStandings
    .filter((s) => s.team.id !== standing.team.id)
    .map((s) => s.maxPossibleWins)
    .sort((a, b) => b - a);

  // If only 6 other teams can possibly finish above us, we've clinched
  const teamsWhoCanFinishAbove = otherTeams.filter(
    (maxWins) => maxWins > standing.wins
  );

  return teamsWhoCanFinishAbove.length < PLAYOFF_SPOTS_PER_CONFERENCE;
}

function hasClinchDivision(
  standing: TeamStanding,
  allStandings: TeamStanding[],
  teams: Team[]
): boolean {
  const divTeams = allStandings.filter(
    (s) =>
      s.team.id !== standing.team.id &&
      s.team.division === standing.team.division
  );

  // Clinched division if no other division team can match our current wins
  return divTeams.every((s) => s.maxPossibleWins < standing.wins);
}

function buildScenarioText(
  standing: TeamStanding,
  allStandings: TeamStanding[],
  status: PlayoffScenario["status"]
): string {
  if (status === "clinched_division") {
    return `Clinched ${standing.team.conference} ${standing.team.division}`;
  }
  if (status === "clinched_playoff") {
    return "Clinched playoff spot";
  }
  if (status === "eliminated") {
    return "Eliminated from playoff contention";
  }

  // "in_hunt" — compute what they need
  const remainingCount = standing.remainingGames.length;

  if (remainingCount === 0) {
    return "Season complete — waiting on tiebreakers";
  }

  // Check if they control their own destiny (win out = clinch)
  const winsIfWinOut = standing.wins + remainingCount;
  const teamsWhoCouldStillFinishAbove = allStandings
    .filter((s) => s.team.id !== standing.team.id)
    .filter((s) => s.maxPossibleWins >= winsIfWinOut);

  if (teamsWhoCouldStillFinishAbove.length < PLAYOFF_SPOTS_PER_CONFERENCE) {
    if (remainingCount === 1) {
      return "Win to clinch a playoff spot";
    }
    return "Control their own destiny — win out to clinch";
  }

  // They need help — find which teams' losses matter
  // Teams currently ahead whose losses would help
  const teamsAhead = allStandings
    .filter(
      (s) => s.team.id !== standing.team.id && s.wins >= standing.wins
    )
    .sort((a, b) => b.wins - a.wins);

  const mustWinRemaining = remainingCount <= 3;

  if (teamsAhead.length > 0) {
    const relevantTeams = teamsAhead
      .slice(0, 3)
      .map((s) => s.team.id);

    if (mustWinRemaining && relevantTeams.length > 0) {
      const neededLosses = relevantTeams.map((id) => `${id} loss`).join(", ");
      return `Must win${remainingCount > 1 ? " out" : ""} + need: ${neededLosses}`;
    }

    if (relevantTeams.length === 1) {
      return `Need to win + ${relevantTeams[0]} loss (may depend on tiebreakers)`;
    }

    return `Need wins + help from ${relevantTeams.length} teams' losses (may depend on tiebreakers)`;
  }

  return "In the hunt — scenario depends on remaining results";
}

export function computePlayoffScenarios(
  teams: Team[],
  allGames: Game[]
): PlayoffScenario[] {
  const scenarios: PlayoffScenario[] = [];

  for (const conference of ["AFC", "NFC"] as const) {
    const standings = getConferenceStandings(teams, allGames, conference);

    // Sort by wins descending for seeding
    const sorted = [...standings].sort((a, b) => b.wins - a.wins);

    for (const standing of standings) {
      let status: PlayoffScenario["status"];
      const eliminated = isEliminated(standing, standings);
      const clinched = hasClinched(standing, standings);
      const clinchDiv = hasClinchDivision(standing, standings, teams);

      if (clinchDiv) {
        status = "clinched_division";
      } else if (clinched) {
        status = "clinched_playoff";
      } else if (eliminated) {
        status = "eliminated";
      } else {
        status = "in_hunt";
      }

      // Compute seed (current position in conference)
      const seed = sorted.findIndex((s) => s.team.id === standing.team.id) + 1;

      // Does this team MUST win their next game?
      const mustWin =
        status === "in_hunt" &&
        standing.remainingGames.length <= 3 &&
        !clinched;

      const scenarioText = buildScenarioText(standing, standings, status);

      // Find relevant games for this team
      const relevantGames =
        status === "in_hunt"
          ? standings
              .filter(
                (s) =>
                  s.team.id !== standing.team.id &&
                  s.wins >= standing.wins
              )
              .flatMap((s) =>
                s.remainingGames.map(
                  (g) => `${g.awayTeam.id}@${g.homeTeam.id}`
                )
              )
              .slice(0, 5)
          : undefined;

      scenarios.push({
        teamId: standing.team.id,
        status,
        seed: seed <= PLAYOFF_SPOTS_PER_CONFERENCE ? seed : undefined,
        scenarioText,
        mustWin,
        relevantGames,
      });
    }
  }

  return scenarios;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep 'playoffEngine' | head -5`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/services/playoffEngine.ts
git commit -m "feat: add playoff scenario engine with elimination/clinch logic"
```

---

### Task 14: Create PlayoffPicture component

**Files:**
- Create: `src/components/PlayoffPicture.tsx`

- [ ] **Step 1: Create the playoff picture component**

Create `src/components/PlayoffPicture.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { PlayoffScenario, Team } from "@/types";

const PLAYOFF_IMPLICATIONS_START_WEEK = 12;

interface PlayoffPictureProps {
  scenarios: PlayoffScenario[];
  teams: Team[];
  currentWeek: number;
}

function ConferenceColumn({
  conference,
  scenarios,
  teams,
}: {
  conference: "AFC" | "NFC";
  scenarios: PlayoffScenario[];
  teams: Team[];
}) {
  const confScenarios = scenarios.filter((s) => {
    const team = teams.find((t) => t.id === s.teamId);
    return team?.conference === conference;
  });

  const seeds = confScenarios
    .filter((s) => s.seed != null && s.seed <= 7)
    .sort((a, b) => (a.seed ?? 99) - (b.seed ?? 99));

  const inHunt = confScenarios.filter(
    (s) => s.status === "in_hunt" && (s.seed == null || s.seed > 7)
  );

  const eliminated = confScenarios.filter((s) => s.status === "eliminated");

  return (
    <div className="flex-1 min-w-0">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-[2px] text-text-muted">
        {conference}
      </h3>

      {/* Playoff seeds */}
      <div className="space-y-1 mb-4">
        {seeds.map((s) => {
          const team = teams.find((t) => t.id === s.teamId);
          if (!team) return null;
          const statusColor =
            s.status === "clinched_division" || s.status === "clinched_playoff"
              ? "text-status-green"
              : "text-text-primary";
          return (
            <div key={s.teamId} className="flex items-center gap-2 py-1">
              <span className="w-5 text-center font-mono text-[10px] text-text-muted">
                {s.seed}
              </span>
              <span className={`flex-1 text-sm font-medium ${statusColor}`}>
                {team.name}
              </span>
              <span className="font-mono text-[11px] text-text-muted">
                {team.record}
              </span>
            </div>
          );
        })}
      </div>

      {/* In the hunt */}
      {inHunt.length > 0 && (
        <div className="mb-4">
          <div className="mb-1 text-[9px] font-bold uppercase tracking-[1.5px] text-status-amber">
            In the Hunt
          </div>
          <div className="space-y-1">
            {inHunt.map((s) => {
              const team = teams.find((t) => t.id === s.teamId);
              if (!team) return null;
              return (
                <div key={s.teamId} className="py-1">
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-sm text-text-secondary">
                      {team.name}
                    </span>
                    <span className="font-mono text-[11px] text-text-muted">
                      {team.record}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-text-muted">
                    {s.scenarioText}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Eliminated */}
      {eliminated.length > 0 && (
        <div>
          <div className="mb-1 text-[9px] font-bold uppercase tracking-[1.5px] text-text-muted/50">
            Eliminated
          </div>
          <div className="space-y-0.5">
            {eliminated.map((s) => {
              const team = teams.find((t) => t.id === s.teamId);
              if (!team) return null;
              return (
                <div
                  key={s.teamId}
                  className="flex items-center gap-2 py-0.5 opacity-40"
                >
                  <span className="flex-1 text-sm text-text-muted line-through">
                    {team.name}
                  </span>
                  <span className="font-mono text-[11px] text-text-muted">
                    {team.record}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function PlayoffPicture({
  scenarios,
  teams,
  currentWeek,
}: PlayoffPictureProps) {
  const [expanded, setExpanded] = useState(false);

  if (currentWeek < PLAYOFF_IMPLICATIONS_START_WEEK) return null;
  if (scenarios.length === 0) return null;

  return (
    <div className="mb-6 rounded-lg border border-border bg-bg-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-xs font-bold uppercase tracking-[2px] text-text-muted">
          Playoff Picture
        </span>
        <span className="text-text-muted text-sm">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-4">
          <div className="flex gap-8">
            <ConferenceColumn
              conference="AFC"
              scenarios={scenarios}
              teams={teams}
            />
            <ConferenceColumn
              conference="NFC"
              scenarios={scenarios}
              teams={teams}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PlayoffPicture.tsx
git commit -m "feat: add PlayoffPicture collapsible panel component"
```

---

### Task 15: Integrate playoff engine into schedule page

**Files:**
- Modify: `src/app/schedule/page.tsx`

- [ ] **Step 1: Add playoff engine imports and computation**

In `src/app/schedule/page.tsx`, add imports:

```typescript
import { computePlayoffScenarios } from "@/services/playoffEngine";
import { PlayoffPicture } from "@/components/PlayoffPicture";
```

After the `injuryMap` computation and before the `return`, add:

```typescript
  // Compute playoff scenarios (only meaningful from week 12+)
  let playoffScenarios: import("@/types").PlayoffScenario[] = [];
  if (week >= 12) {
    // Fetch all games for the full season to compute scenarios
    const allSeasonGames: import("@/types").Game[] = [];
    for (let w = 1; w <= 18; w++) {
      const weekGames = w === week ? games : await service.getWeekGames(w);
      allSeasonGames.push(...weekGames);
    }
    playoffScenarios = computePlayoffScenarios(allTeams, allSeasonGames);
  }
```

- [ ] **Step 2: Add PlayoffPicture and pass scenarios to ScheduleGrid**

In the JSX return, add the `PlayoffPicture` component before `ScheduleGrid`, and pass `playoffScenarios` to `ScheduleGrid`:

```tsx
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <PlayoffPicture
          scenarios={playoffScenarios}
          teams={allTeams}
          currentWeek={week}
        />
        <ScheduleGrid
          games={games}
          week={week}
          maxWeek={18}
          byeTeams={byeTeams}
          injuryMap={injuryMap}
          playoffScenarios={playoffScenarios}
        />
      </div>
```

- [ ] **Step 3: Build and verify**

Run: `npx next build 2>&1 | tail -15`

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/schedule/page.tsx
git commit -m "feat: integrate playoff engine into schedule page"
```

---

### Task 16: Push to GitHub and trigger initial schedule scrape

**Files:** None (deployment)

- [ ] **Step 1: Push all changes to GitHub**

```bash
git push origin main
```

- [ ] **Step 2: Wait for Vercel deployment**

Run: `sleep 40 && npx vercel ls 2>&1 | head -7`

Expected: Latest deployment shows `● Ready`.

- [ ] **Step 3: Trigger scrape to populate schedule data**

```bash
curl -s https://rosterpulse.vercel.app/api/scrape 2>&1
```

This will timeout on Vercel hobby plan but the data should be committed to Turso. Verify:

```bash
npx tsx -e "
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@libsql/client');
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
db.execute('SELECT COUNT(*) as count FROM games').then(r => {
  console.log('Games in DB:', r.rows[0].count);
  db.close();
});
"
```

Expected: `Games in DB: <some number >0>` (likely 256+ for a full 18-week schedule)

- [ ] **Step 4: Verify schedule page loads**

```bash
curl -s -o /dev/null -w "%{http_code}" https://rosterpulse.vercel.app/schedule
```

Expected: `200`

- [ ] **Step 5: Commit any remaining changes**

If all looks good, no additional commit needed. The feature is live.

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Schedule page at `/schedule` with bracket matchups (Tasks 10–12)
- ✅ Week navigator with arrows (Task 11)
- ✅ Games grouped by time slot with section headers (Task 11)
- ✅ Team logos, records, injury badges (Task 10)
- ✅ Bye week footer (Task 11)
- ✅ Primetime styling — SNF blue, MNF amber (Task 10)
- ✅ Favorite team highlights (Task 11)
- ✅ Playoff bracket tags (Tasks 11, 13)
- ✅ Playoff picture panel — collapsible, AFC/NFC, seeds/hunt/eliminated (Task 14)
- ✅ Scenario engine with specific text (Task 13)
- ✅ Rule changes footer modal (Tasks 7–9)
- ✅ TopBar "Schedule" link (Task 9)
- ✅ ESPN schedule adapter (Task 3)
- ✅ Games table in Turso (Task 2)
- ✅ RosterService additions (Tasks 1, 6)
- ✅ Navigation (Task 9)

**Placeholder scan:** No TBDs, TODOs, or "implement later" found.

**Type consistency:** `Game`, `GameStatus`, `PlayoffScenario` types defined in Task 1, used consistently in Tasks 3, 6, 10–15. `RuleChange` type defined in Task 7, used in Task 8.
