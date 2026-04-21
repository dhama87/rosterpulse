# NFL Draft Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/draft` page that evolves through the draft lifecycle: pre-draft hub, live pick tracker on draft nights (5s polling), and post-draft results with grades.

**Architecture:** One server page determines mode (pre/live/results) by date. Pre-draft and results are server-rendered. Live mode is a client component polling `/api/draft/live` every 5 seconds. Draft data is scraped from ESPN's draft API via a new `EspnDraftAdapter` and stored in Turso. The scraper ingests picks during draft nights; the API endpoint just reads from DB.

**Tech Stack:** Next.js 16 App Router, TypeScript, Turso/libsql, Tailwind CSS v4, ESPN Draft API

**Existing patterns to follow:**
- Scraper adapter: `src/scraper/adapters/espn-schedule.ts` (SourceAdapter interface, fetchJson helper, ESPN_ID_TO_ABBREV mapping)
- Orchestrator: `src/scraper/orchestrator.ts` (processes items in transaction, uses `rawData._gameData` pattern for non-player items)
- Page: `src/app/schedule/page.tsx` (server component, `force-dynamic`, async searchParams, createRosterService)
- TopBar: `src/components/TopBar.tsx` (nav links)
- Types: `src/types/index.ts` (extend with draft types)
- Schema: `src/db/schema.ts` (add tables with indexes)
- Service: `src/services/liveRosterService.ts` and `src/services/rosterService.ts` (add draft methods)

---

## File Structure

### New files
| File | Responsibility |
|------|---------------|
| `src/data/draft-prospects.ts` | Static pre-draft data: prospect rankings and team needs |
| `src/scraper/adapters/espn-draft.ts` | ESPN Draft API adapter for ingesting picks |
| `src/scraper/__tests__/adapters/espn-draft.test.ts` | Tests for draft adapter |
| `src/app/draft/page.tsx` | Server component: determines mode, fetches data, renders sub-component |
| `src/app/api/draft/live/route.ts` | API endpoint for live polling (returns picks since timestamp) |
| `src/components/draft/PreDraftHub.tsx` | Pre-draft mode: draft order, team needs, prospects, countdown |
| `src/components/draft/LiveDraftTracker.tsx` | Live mode: polling, pick feed, on-the-clock banner |
| `src/components/draft/DraftResults.tsx` | Results mode: team class cards, grades, breakdowns |
| `src/components/draft/DraftPickCard.tsx` | Shared pick display component |
| `src/components/draft/DraftCountdown.tsx` | Client-side countdown timer |

### Modified files
| File | Change |
|------|--------|
| `src/types/index.ts` | Add DraftPick, DraftProspect, TeamNeed, DraftMode, DraftLiveResponse types |
| `src/db/schema.ts` | Add draft_picks, draft_prospects, draft_team_needs, draft_meta tables |
| `src/scraper/orchestrator.ts` | Handle `_draftData` items (insert into draft tables) |
| `src/scraper/cli.ts` | Register EspnDraftAdapter |
| `src/app/api/scrape/route.ts` | Register EspnDraftAdapter |
| `src/services/liveRosterService.ts` | Add getDraftPicks, getDraftMeta, getDraftProspects, getTeamNeeds methods |
| `src/services/rosterService.ts` | Add mock draft method stubs |
| `src/components/TopBar.tsx` | Add "Draft" nav link |

---

### Task 1: Draft Types

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add draft types to the types file**

Add these types after the `PlayoffScenario` interface (around line 114):

```typescript
// === Draft Types ===

export type DraftMode = "pre" | "live" | "results";

export interface DraftPick {
  id: string;
  year: number;
  round: number;
  pickNumber: number;
  teamId: string;
  playerName: string;
  position: string;
  college: string;
  isTradeUp: boolean;
  tradeNote: string | null;
  timestamp: string | null;
}

export interface DraftProspect {
  id: string;
  name: string;
  position: string;
  college: string;
  rank: number;
  projectedRound: number;
  projectedPick: number | null;
}

export interface TeamNeed {
  teamId: string;
  position: string;
  priority: 1 | 2 | 3; // 1=critical, 2=moderate, 3=depth
}

export interface DraftLiveResponse {
  currentPick: number;
  onTheClock: { teamId: string; timeRemaining: number } | null;
  picks: DraftPick[];
  lastUpdated: string;
  isActive: boolean;
}
```

- [ ] **Step 2: Extend RosterService interface with draft methods**

Add these methods to the `RosterService` interface (before the closing `}`):

```typescript
  getDraftPicks(year: number): Promise<DraftPick[]>;
  getDraftProspects(): Promise<DraftProspect[]>;
  getTeamNeeds(teamId?: string): Promise<TeamNeed[]>;
  getDraftMeta(): Promise<Record<string, string>>;
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: Errors about missing implementations in rosterService.ts and liveRosterService.ts (expected — we'll add those next)

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(draft): add DraftPick, DraftProspect, TeamNeed, DraftLiveResponse types"
```

---

### Task 2: Database Schema

**Files:**
- Modify: `src/db/schema.ts`

- [ ] **Step 1: Add draft tables to TABLE_NAMES**

Update the `TABLE_NAMES` constant:

```typescript
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
```

- [ ] **Step 2: Add draft table CREATE statements**

Add after the games table indexes (end of the `executeMultiple` template string, before the closing backtick):

```sql
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
```

- [ ] **Step 3: Verify schema compiles**

Run: `npx tsc --noEmit 2>&1 | grep schema`
Expected: No errors related to schema.ts

- [ ] **Step 4: Commit**

```bash
git add src/db/schema.ts
git commit -m "feat(draft): add draft_picks, draft_prospects, draft_team_needs, draft_meta tables"
```

---

### Task 3: Static Pre-Draft Data

**Files:**
- Create: `src/data/draft-prospects.ts`

- [ ] **Step 1: Create the static draft data file**

This file contains pre-draft data: 2026 draft order, top prospects, and team needs. This data will be seeded into the database and can be updated later via scraper.

```typescript
import type { DraftPick, DraftProspect, TeamNeed } from "@/types";

// 2026 NFL Draft order (first round) — picks without playerName are unfilled
// Source: Current draft order as of April 2026
export const draftOrder: DraftPick[] = [
  { id: "2026-R1-P1", year: 2026, round: 1, pickNumber: 1, teamId: "CHI", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P2", year: 2026, round: 1, pickNumber: 2, teamId: "JAX", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P3", year: 2026, round: 1, pickNumber: 3, teamId: "CLE", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P4", year: 2026, round: 1, pickNumber: 4, teamId: "NYG", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P5", year: 2026, round: 1, pickNumber: 5, teamId: "NE", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P6", year: 2026, round: 1, pickNumber: 6, teamId: "LV", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P7", year: 2026, round: 1, pickNumber: 7, teamId: "TEN", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P8", year: 2026, round: 1, pickNumber: 8, teamId: "CAR", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P9", year: 2026, round: 1, pickNumber: 9, teamId: "DAL", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P10", year: 2026, round: 1, pickNumber: 10, teamId: "NO", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P11", year: 2026, round: 1, pickNumber: 11, teamId: "SF", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P12", year: 2026, round: 1, pickNumber: 12, teamId: "IND", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P13", year: 2026, round: 1, pickNumber: 13, teamId: "MIA", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P14", year: 2026, round: 1, pickNumber: 14, teamId: "CIN", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P15", year: 2026, round: 1, pickNumber: 15, teamId: "ARI", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P16", year: 2026, round: 1, pickNumber: 16, teamId: "ATL", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P17", year: 2026, round: 1, pickNumber: 17, teamId: "SEA", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P18", year: 2026, round: 1, pickNumber: 18, teamId: "TB", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P19", year: 2026, round: 1, pickNumber: 19, teamId: "LAC", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P20", year: 2026, round: 1, pickNumber: 20, teamId: "DEN", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P21", year: 2026, round: 1, pickNumber: 21, teamId: "GB", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P22", year: 2026, round: 1, pickNumber: 22, teamId: "PIT", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P23", year: 2026, round: 1, pickNumber: 23, teamId: "LAR", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P24", year: 2026, round: 1, pickNumber: 24, teamId: "HOU", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P25", year: 2026, round: 1, pickNumber: 25, teamId: "MIN", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P26", year: 2026, round: 1, pickNumber: 26, teamId: "PHI", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P27", year: 2026, round: 1, pickNumber: 27, teamId: "BAL", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P28", year: 2026, round: 1, pickNumber: 28, teamId: "DET", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P29", year: 2026, round: 1, pickNumber: 29, teamId: "WAS", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P30", year: 2026, round: 1, pickNumber: 30, teamId: "BUF", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P31", year: 2026, round: 1, pickNumber: 31, teamId: "KC", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P32", year: 2026, round: 1, pickNumber: 32, teamId: "NYJ", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
];

// Top 32 prospects (consensus big board)
export const topProspects: DraftProspect[] = [
  { id: "cam-ward", name: "Cam Ward", position: "QB", college: "Miami", rank: 1, projectedRound: 1, projectedPick: 1 },
  { id: "travis-hunter", name: "Travis Hunter", position: "CB/WR", college: "Colorado", rank: 2, projectedRound: 1, projectedPick: 2 },
  { id: "shedeur-sanders", name: "Shedeur Sanders", position: "QB", college: "Colorado", rank: 3, projectedRound: 1, projectedPick: 3 },
  { id: "abdul-carter", name: "Abdul Carter", position: "EDGE", college: "Penn State", rank: 4, projectedRound: 1, projectedPick: 4 },
  { id: "mason-graham", name: "Mason Graham", position: "DT", college: "Michigan", rank: 5, projectedRound: 1, projectedPick: 5 },
  { id: "tetairoa-mcmillan", name: "Tetairoa McMillan", position: "WR", college: "Arizona", rank: 6, projectedRound: 1, projectedPick: 6 },
  { id: "will-campbell", name: "Will Campbell", position: "OT", college: "LSU", rank: 7, projectedRound: 1, projectedPick: 7 },
  { id: "will-johnson", name: "Will Johnson", position: "CB", college: "Michigan", rank: 8, projectedRound: 1, projectedPick: 8 },
  { id: "ashton-jeanty", name: "Ashton Jeanty", position: "RB", college: "Boise State", rank: 9, projectedRound: 1, projectedPick: 9 },
  { id: "kelvin-banks", name: "Kelvin Banks Jr.", position: "OT", college: "Texas", rank: 10, projectedRound: 1, projectedPick: 10 },
  { id: "tyler-warren", name: "Tyler Warren", position: "TE", college: "Penn State", rank: 11, projectedRound: 1, projectedPick: 11 },
  { id: "mykel-williams", name: "Mykel Williams", position: "EDGE", college: "Georgia", rank: 12, projectedRound: 1, projectedPick: 12 },
  { id: "james-pearce", name: "James Pearce Jr.", position: "EDGE", college: "Tennessee", rank: 13, projectedRound: 1, projectedPick: 13 },
  { id: "jalon-walker", name: "Jalon Walker", position: "LB", college: "Georgia", rank: 14, projectedRound: 1, projectedPick: 14 },
  { id: "luther-burden", name: "Luther Burden III", position: "WR", college: "Missouri", rank: 15, projectedRound: 1, projectedPick: 15 },
  { id: "malaki-starks", name: "Malaki Starks", position: "S", college: "Georgia", rank: 16, projectedRound: 1, projectedPick: 16 },
  { id: "kenneth-grant", name: "Kenneth Grant", position: "DT", college: "Michigan", rank: 17, projectedRound: 1, projectedPick: null },
  { id: "derrick-harmon", name: "Derrick Harmon", position: "DT", college: "Oregon", rank: 18, projectedRound: 1, projectedPick: null },
  { id: "benjamin-morrison", name: "Benjamin Morrison", position: "CB", college: "Notre Dame", rank: 19, projectedRound: 1, projectedPick: null },
  { id: "nick-singleton", name: "Nick Singleton", position: "RB", college: "Penn State", rank: 20, projectedRound: 1, projectedPick: null },
  { id: "colston-loveland", name: "Colston Loveland", position: "TE", college: "Michigan", rank: 21, projectedRound: 1, projectedPick: null },
  { id: "nic-scourton", name: "Nic Scourton", position: "EDGE", college: "Texas A&M", rank: 22, projectedRound: 1, projectedPick: null },
  { id: "emeka-egbuka", name: "Emeka Egbuka", position: "WR", college: "Ohio State", rank: 23, projectedRound: 1, projectedPick: null },
  { id: "sheffield-grey", name: "Grey Sheffield", position: "OT", college: "Ohio State", rank: 24, projectedRound: 1, projectedPick: null },
  { id: "oronde-gadsden", name: "Oronde Gadsden II", position: "TE", college: "Syracuse", rank: 25, projectedRound: 1, projectedPick: null },
  { id: "cameron-williams", name: "Cameron Williams", position: "OT", college: "Texas", rank: 26, projectedRound: 1, projectedPick: null },
  { id: "tyleik-williams", name: "Tyleik Williams", position: "DT", college: "Ohio State", rank: 27, projectedRound: 1, projectedPick: null },
  { id: "donovan-ezeiruaku", name: "Donovan Ezeiruaku", position: "EDGE", college: "Boston College", rank: 28, projectedRound: 1, projectedPick: null },
  { id: "shavon-revel", name: "Shavon Revel Jr.", position: "CB", college: "East Carolina", rank: 29, projectedRound: 1, projectedPick: null },
  { id: "josh-simmons", name: "Josh Simmons", position: "OT", college: "Ohio State", rank: 30, projectedRound: 1, projectedPick: null },
  { id: "omarion-hampton", name: "Omarion Hampton", position: "RB", college: "North Carolina", rank: 31, projectedRound: 1, projectedPick: null },
  { id: "jalen-milroe", name: "Jalen Milroe", position: "QB", college: "Alabama", rank: 32, projectedRound: 1, projectedPick: null },
];

// Team needs by position priority (1=critical, 2=moderate, 3=depth)
export const teamNeeds: TeamNeed[] = [
  // CHI - Pick 1
  { teamId: "CHI", position: "QB", priority: 1 },
  { teamId: "CHI", position: "OL", priority: 2 },
  { teamId: "CHI", position: "EDGE", priority: 3 },
  // JAX - Pick 2
  { teamId: "JAX", position: "QB", priority: 1 },
  { teamId: "JAX", position: "OL", priority: 2 },
  { teamId: "JAX", position: "WR", priority: 3 },
  // CLE - Pick 3
  { teamId: "CLE", position: "QB", priority: 1 },
  { teamId: "CLE", position: "OL", priority: 2 },
  { teamId: "CLE", position: "WR", priority: 2 },
  // NYG - Pick 4
  { teamId: "NYG", position: "EDGE", priority: 1 },
  { teamId: "NYG", position: "CB", priority: 2 },
  { teamId: "NYG", position: "OL", priority: 2 },
  // NE - Pick 5
  { teamId: "NE", position: "WR", priority: 1 },
  { teamId: "NE", position: "OL", priority: 2 },
  { teamId: "NE", position: "EDGE", priority: 3 },
  // LV - Pick 6
  { teamId: "LV", position: "QB", priority: 1 },
  { teamId: "LV", position: "EDGE", priority: 2 },
  { teamId: "LV", position: "OL", priority: 3 },
  // TEN - Pick 7
  { teamId: "TEN", position: "OL", priority: 1 },
  { teamId: "TEN", position: "WR", priority: 2 },
  { teamId: "TEN", position: "CB", priority: 3 },
  // CAR - Pick 8
  { teamId: "CAR", position: "OL", priority: 1 },
  { teamId: "CAR", position: "EDGE", priority: 2 },
  { teamId: "CAR", position: "CB", priority: 3 },
  // DAL - Pick 9
  { teamId: "DAL", position: "EDGE", priority: 1 },
  { teamId: "DAL", position: "OL", priority: 1 },
  { teamId: "DAL", position: "S", priority: 3 },
  // NO - Pick 10
  { teamId: "NO", position: "WR", priority: 1 },
  { teamId: "NO", position: "OL", priority: 2 },
  { teamId: "NO", position: "CB", priority: 3 },
  // SF - Pick 11
  { teamId: "SF", position: "OL", priority: 1 },
  { teamId: "SF", position: "DL", priority: 2 },
  { teamId: "SF", position: "S", priority: 3 },
  // IND - Pick 12
  { teamId: "IND", position: "WR", priority: 1 },
  { teamId: "IND", position: "EDGE", priority: 2 },
  { teamId: "IND", position: "CB", priority: 3 },
  // MIA - Pick 13
  { teamId: "MIA", position: "OL", priority: 1 },
  { teamId: "MIA", position: "DL", priority: 2 },
  { teamId: "MIA", position: "LB", priority: 3 },
  // CIN - Pick 14
  { teamId: "CIN", position: "OL", priority: 1 },
  { teamId: "CIN", position: "DL", priority: 2 },
  { teamId: "CIN", position: "LB", priority: 3 },
  // ARI - Pick 15
  { teamId: "ARI", position: "EDGE", priority: 1 },
  { teamId: "ARI", position: "DL", priority: 2 },
  { teamId: "ARI", position: "CB", priority: 3 },
  // ATL - Pick 16
  { teamId: "ATL", position: "EDGE", priority: 1 },
  { teamId: "ATL", position: "S", priority: 2 },
  { teamId: "ATL", position: "OL", priority: 3 },
  // SEA - Pick 17
  { teamId: "SEA", position: "OL", priority: 1 },
  { teamId: "SEA", position: "DL", priority: 2 },
  { teamId: "SEA", position: "LB", priority: 3 },
  // TB - Pick 18
  { teamId: "TB", position: "EDGE", priority: 1 },
  { teamId: "TB", position: "OL", priority: 2 },
  { teamId: "TB", position: "S", priority: 3 },
  // LAC - Pick 19
  { teamId: "LAC", position: "WR", priority: 1 },
  { teamId: "LAC", position: "OL", priority: 2 },
  { teamId: "LAC", position: "CB", priority: 3 },
  // DEN - Pick 20
  { teamId: "DEN", position: "WR", priority: 1 },
  { teamId: "DEN", position: "OL", priority: 2 },
  { teamId: "DEN", position: "EDGE", priority: 3 },
  // GB - Pick 21
  { teamId: "GB", position: "DL", priority: 1 },
  { teamId: "GB", position: "S", priority: 2 },
  { teamId: "GB", position: "EDGE", priority: 3 },
  // PIT - Pick 22
  { teamId: "PIT", position: "QB", priority: 1 },
  { teamId: "PIT", position: "OL", priority: 2 },
  { teamId: "PIT", position: "WR", priority: 3 },
  // LAR - Pick 23
  { teamId: "LAR", position: "EDGE", priority: 1 },
  { teamId: "LAR", position: "OL", priority: 2 },
  { teamId: "LAR", position: "CB", priority: 3 },
  // HOU - Pick 24
  { teamId: "HOU", position: "OL", priority: 1 },
  { teamId: "HOU", position: "EDGE", priority: 2 },
  { teamId: "HOU", position: "CB", priority: 3 },
  // MIN - Pick 25
  { teamId: "MIN", position: "OL", priority: 1 },
  { teamId: "MIN", position: "CB", priority: 2 },
  { teamId: "MIN", position: "EDGE", priority: 3 },
  // PHI - Pick 26
  { teamId: "PHI", position: "CB", priority: 1 },
  { teamId: "PHI", position: "LB", priority: 2 },
  { teamId: "PHI", position: "S", priority: 3 },
  // BAL - Pick 27
  { teamId: "BAL", position: "WR", priority: 1 },
  { teamId: "BAL", position: "OL", priority: 2 },
  { teamId: "BAL", position: "CB", priority: 3 },
  // DET - Pick 28
  { teamId: "DET", position: "DL", priority: 1 },
  { teamId: "DET", position: "EDGE", priority: 2 },
  { teamId: "DET", position: "CB", priority: 3 },
  // WAS - Pick 29
  { teamId: "WAS", position: "DL", priority: 1 },
  { teamId: "WAS", position: "OL", priority: 2 },
  { teamId: "WAS", position: "LB", priority: 3 },
  // BUF - Pick 30
  { teamId: "BUF", position: "WR", priority: 1 },
  { teamId: "BUF", position: "EDGE", priority: 2 },
  { teamId: "BUF", position: "OL", priority: 3 },
  // KC - Pick 31
  { teamId: "KC", position: "WR", priority: 1 },
  { teamId: "KC", position: "OL", priority: 2 },
  { teamId: "KC", position: "CB", priority: 3 },
  // NYJ - Pick 32
  { teamId: "NYJ", position: "OL", priority: 1 },
  { teamId: "NYJ", position: "EDGE", priority: 2 },
  { teamId: "NYJ", position: "CB", priority: 3 },
];
```

- [ ] **Step 2: Verify file compiles**

Run: `npx tsc --noEmit src/data/draft-prospects.ts 2>&1 | head -10`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/data/draft-prospects.ts
git commit -m "feat(draft): add static pre-draft data — draft order, prospects, team needs"
```

---

### Task 4: Service Layer — Draft Methods

**Files:**
- Modify: `src/services/liveRosterService.ts`
- Modify: `src/services/rosterService.ts`

- [ ] **Step 1: Add draft methods to liveRosterService**

Add these methods inside the returned object in `createLiveRosterService` (before the closing `};` of the return):

```typescript
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
```

Also add the `DraftPick`, `DraftProspect`, and `TeamNeed` imports at the top:

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
  DraftPick,
  DraftProspect,
  TeamNeed,
} from "@/types";
```

- [ ] **Step 2: Add mock draft stubs to rosterService**

Add to the `createMockRosterService` return object (before the closing `};`) and add to the imports:

```typescript
// Add to imports at top:
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
  DraftPick,
  DraftProspect,
  TeamNeed,
} from "@/types";

// Add to the return object:
    async getDraftPicks(_year: number): Promise<DraftPick[]> {
      return [];
    },

    async getDraftProspects(): Promise<DraftProspect[]> {
      return [];
    },

    async getTeamNeeds(_teamId?: string): Promise<TeamNeed[]> {
      return [];
    },

    async getDraftMeta(): Promise<Record<string, string>> {
      return {};
    },
```

- [ ] **Step 3: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/services/liveRosterService.ts src/services/rosterService.ts
git commit -m "feat(draft): add getDraftPicks, getDraftProspects, getTeamNeeds, getDraftMeta to services"
```

---

### Task 5: ESPN Draft Adapter

**Files:**
- Create: `src/scraper/adapters/espn-draft.ts`
- Create: `src/scraper/__tests__/adapters/espn-draft.test.ts`

- [ ] **Step 1: Write the test file**

```typescript
import { EspnDraftAdapter } from "../../adapters/espn-draft";

// Sample ESPN draft API response for round 1
const SAMPLE_DRAFT_RESPONSE = {
  rounds: [
    {
      number: 1,
      picks: [
        {
          overall: 1,
          round: { number: 1 },
          team: { id: "3", abbreviation: "CHI" },
          athlete: {
            displayName: "Cam Ward",
            position: { abbreviation: "QB" },
            college: { name: "Miami" },
          },
          tradedFrom: null,
          tradeNote: null,
        },
        {
          overall: 2,
          round: { number: 1 },
          team: { id: "30", abbreviation: "JAX" },
          athlete: {
            displayName: "Travis Hunter",
            position: { abbreviation: "CB" },
            college: { name: "Colorado" },
          },
          tradedFrom: null,
          tradeNote: null,
        },
      ],
    },
  ],
};

function makeOkResponse(body: object): Response {
  return {
    ok: true,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

function makeNotFoundResponse(): Response {
  return {
    ok: false,
    json: () => Promise.reject(new Error("Not found")),
  } as unknown as Response;
}

describe("EspnDraftAdapter", () => {
  let adapter: EspnDraftAdapter;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    adapter = new EspnDraftAdapter(2026);
    fetchSpy = jest.spyOn(global, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("has correct name", () => {
    expect(adapter.name).toBe("espn-draft");
  });

  it("parses draft picks from ESPN response", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse(SAMPLE_DRAFT_RESPONSE));

    const items = await adapter.fetch();

    expect(items).toHaveLength(2);
    expect(items[0].type).toBe("player");
    expect(items[0].rawData._draftData).toBe(true);
    expect(items[0].rawData.playerName).toBe("Cam Ward");
    expect(items[0].rawData.position).toBe("QB");
    expect(items[0].rawData.college).toBe("Miami");
    expect(items[0].rawData.teamId).toBe("CHI");
    expect(items[0].rawData.round).toBe(1);
    expect(items[0].rawData.pickNumber).toBe(1);
  });

  it("generates correct pick IDs", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse(SAMPLE_DRAFT_RESPONSE));

    const items = await adapter.fetch();

    expect(items[0].rawData.id).toBe("2026-R1-P1");
    expect(items[1].rawData.id).toBe("2026-R1-P2");
  });

  it("returns empty array on API failure", async () => {
    fetchSpy.mockResolvedValueOnce(makeNotFoundResponse());

    const items = await adapter.fetch();

    expect(items).toHaveLength(0);
  });

  it("sets confidence to official", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse(SAMPLE_DRAFT_RESPONSE));

    const items = await adapter.fetch();

    expect(items[0].confidence).toBe("official");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/scraper/__tests__/adapters/espn-draft.test.ts 2>&1 | tail -5`
Expected: FAIL — Cannot find module '../../adapters/espn-draft'

- [ ] **Step 3: Write the adapter**

```typescript
import { SourceAdapter, ScrapedItem } from "../types";

// ESPN team ID → our abbreviation (reuse from schedule adapter)
const ESPN_ID_TO_ABBREV: Record<string, string> = {
  "22": "ARI", "1": "ATL", "33": "BAL", "2": "BUF", "29": "CAR", "3": "CHI",
  "4": "CIN", "5": "CLE", "6": "DAL", "7": "DEN", "8": "DET", "9": "GB",
  "34": "HOU", "11": "IND", "30": "JAX", "12": "KC", "13": "LV", "24": "LAC",
  "14": "LAR", "15": "MIA", "16": "MIN", "17": "NE", "18": "NO", "19": "NYG",
  "20": "NYJ", "21": "PHI", "23": "PIT", "25": "SF", "26": "SEA", "27": "TB",
  "10": "TEN", "28": "WAS",
};

interface EspnDraftPick {
  overall: number;
  round: { number: number };
  team: { id: string; abbreviation: string };
  athlete?: {
    displayName: string;
    position: { abbreviation: string };
    college?: { name: string };
  };
  tradedFrom?: { id: string; abbreviation: string } | null;
  tradeNote?: string | null;
}

interface EspnDraftRound {
  number: number;
  picks: EspnDraftPick[];
}

interface EspnDraftResponse {
  rounds: EspnDraftRound[];
}

export class EspnDraftAdapter implements SourceAdapter {
  name = "espn-draft";
  private year: number;

  constructor(year: number = 2026) {
    this.year = year;
  }

  async fetch(): Promise<ScrapedItem[]> {
    const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/draft?year=${this.year}`;
    const items: ScrapedItem[] = [];
    const now = new Date().toISOString();

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(30_000),
        headers: { "User-Agent": "RosterPulse/1.0" },
      });
      if (!response.ok) return [];

      const data = (await response.json()) as EspnDraftResponse;
      if (!data.rounds) return [];

      for (const round of data.rounds) {
        for (const pick of round.picks) {
          if (!pick.athlete) continue; // skip unfilled picks

          const teamAbbrev = ESPN_ID_TO_ABBREV[pick.team.id] ?? pick.team.abbreviation;
          const isTradeUp = pick.tradedFrom != null;

          items.push({
            type: "player",
            sourceAdapter: this.name,
            source: "espn",
            sourceUrl: `https://www.espn.com/nfl/draft/${this.year}`,
            confidence: "official",
            fetchedAt: now,
            rawData: {
              _draftData: true,
              id: `${this.year}-R${pick.round.number}-P${pick.overall}`,
              year: this.year,
              round: pick.round.number,
              pickNumber: pick.overall,
              teamId: teamAbbrev,
              playerName: pick.athlete.displayName,
              position: pick.athlete.position.abbreviation,
              college: pick.athlete.college?.name ?? "",
              isTradeUp: isTradeUp ? 1 : 0,
              tradeNote: pick.tradeNote ?? null,
              timestamp: now,
            },
          });
        }
      }
    } catch {
      return [];
    }

    return items;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest src/scraper/__tests__/adapters/espn-draft.test.ts 2>&1 | tail -10`
Expected: 5 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/scraper/adapters/espn-draft.ts src/scraper/__tests__/adapters/espn-draft.test.ts
git commit -m "feat(draft): add EspnDraftAdapter with tests"
```

---

### Task 6: Orchestrator — Handle Draft Data

**Files:**
- Modify: `src/scraper/orchestrator.ts`

- [ ] **Step 1: Add draft data handling in the transaction block**

In `orchestrator.ts`, inside the `for (const item of adapterResult.items)` loop, add a new condition after the `_gameData` block (around line 101) and before the `else if (item.type === "player")` block:

```typescript
        if (item.type === "player" && item.rawData._gameData) {
          // ... existing game data handling ...
        } else if (item.type === "player" && item.rawData._draftData) {
          const d = item.rawData;
          await tx.execute({
            sql: `INSERT OR REPLACE INTO draft_picks
              (id, year, round, pickNumber, teamId, playerName, position, college,
               isTradeUp, tradeNote, timestamp, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              d.id as string, d.year as number, d.round as number,
              d.pickNumber as number, d.teamId as string,
              d.playerName as string, d.position as string,
              d.college as string, d.isTradeUp as number,
              (d.tradeNote as string) ?? null,
              (d.timestamp as string) ?? null, item.fetchedAt,
            ],
          });
          itemsNew++;
        } else if (item.type === "player") {
          // ... existing player handling ...
```

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | head -10`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/scraper/orchestrator.ts
git commit -m "feat(draft): handle _draftData items in orchestrator transaction"
```

---

### Task 7: Register Adapter in CLI and API Route

**Files:**
- Modify: `src/scraper/cli.ts`
- Modify: `src/app/api/scrape/route.ts`

- [ ] **Step 1: Add adapter to CLI**

In `src/scraper/cli.ts`, add the import:

```typescript
import { EspnDraftAdapter } from "./adapters/espn-draft";
```

And add to the adapters array:

```typescript
  const adapters = [
    new EspnRssAdapter(),
    new NflTransactionsAdapter(),
    new EspnRosterAdapter(),
    new RotoworldRssAdapter(),
    new EspnScheduleAdapter(),
    new EspnDraftAdapter(),
  ];
```

- [ ] **Step 2: Add adapter to API route**

In `src/app/api/scrape/route.ts`, add the import:

```typescript
import { EspnDraftAdapter } from "@/scraper/adapters/espn-draft";
```

And add to the adapters array:

```typescript
    const adapters = [
      new EspnRssAdapter(),
      new NflTransactionsAdapter(),
      new EspnRosterAdapter(),
      new RotoworldRssAdapter(),
      new EspnScheduleAdapter(),
      new EspnDraftAdapter(),
    ];
```

- [ ] **Step 3: Commit**

```bash
git add src/scraper/cli.ts src/app/api/scrape/route.ts
git commit -m "feat(draft): register EspnDraftAdapter in CLI and API scrape route"
```

---

### Task 8: Seed Draft Data

**Files:**
- Modify: `src/scraper/orchestrator.ts` (or add seeding logic)

We need to seed the draft_picks (empty slots), draft_prospects, and draft_team_needs tables from static data. The simplest approach: add a seed step to the scrape flow that runs when draft tables are empty.

- [ ] **Step 1: Add draft seeding function to orchestrator**

Add this function before `runScrape` in `src/scraper/orchestrator.ts`:

```typescript
async function seedDraftDataIfEmpty(tx: import("@libsql/client").Transaction): Promise<void> {
  const countResult = await tx.execute("SELECT COUNT(*) as count FROM draft_picks");
  const count = countResult.rows[0].count as number;
  if (count > 0) return;

  // Dynamically import static data to avoid bundling in non-draft contexts
  const { draftOrder, topProspects, teamNeeds } = await import("@/data/draft-prospects");
  const now = new Date().toISOString();

  for (const pick of draftOrder) {
    await tx.execute({
      sql: `INSERT OR IGNORE INTO draft_picks
        (id, year, round, pickNumber, teamId, playerName, position, college, isTradeUp, tradeNote, timestamp, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [pick.id, pick.year, pick.round, pick.pickNumber, pick.teamId, pick.playerName, pick.position, pick.college, pick.isTradeUp ? 1 : 0, pick.tradeNote, pick.timestamp, now],
    });
  }

  for (const prospect of topProspects) {
    await tx.execute({
      sql: `INSERT OR IGNORE INTO draft_prospects
        (id, name, position, college, rank, projectedRound, projectedPick, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [prospect.id, prospect.name, prospect.position, prospect.college, prospect.rank, prospect.projectedRound, prospect.projectedPick, now],
    });
  }

  for (const need of teamNeeds) {
    await tx.execute({
      sql: `INSERT OR IGNORE INTO draft_team_needs
        (id, teamId, position, priority, updatedAt)
      VALUES (?, ?, ?, ?, ?)`,
      args: [`${need.teamId}-${need.position}`, need.teamId, need.position, need.priority, now],
    });
  }

  // Set draft meta
  await tx.execute({
    sql: `INSERT OR IGNORE INTO draft_meta (key, value, updatedAt) VALUES (?, ?, ?)`,
    args: ["draftYear", "2026", now],
  });
  await tx.execute({
    sql: `INSERT OR IGNORE INTO draft_meta (key, value, updatedAt) VALUES (?, ?, ?)`,
    args: ["draftDates", JSON.stringify(["2026-04-23T20:00:00-04:00", "2026-04-24T19:00:00-04:00", "2026-04-25T12:00:00-04:00"]), now],
  });
}
```

Then call it inside `runScrape`, right after `await tx.execute("DELETE FROM players");` (around line 92):

```typescript
    await tx.execute("DELETE FROM players");
    await seedDraftDataIfEmpty(tx);
```

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | head -10`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/scraper/orchestrator.ts
git commit -m "feat(draft): seed draft_picks, prospects, and team needs on first scrape"
```

---

### Task 9: Live API Endpoint

**Files:**
- Create: `src/app/api/draft/live/route.ts`

- [ ] **Step 1: Create the live draft API endpoint**

```typescript
import { NextResponse } from "next/server";
import { createRosterService } from "@/services/createRosterService";
import type { DraftLiveResponse } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const since = searchParams.get("since");

  const service = createRosterService();
  const meta = await service.getDraftMeta();
  const year = parseInt(meta.draftYear ?? "2026", 10);
  const allPicks = await service.getDraftPicks(year);

  // Filter to only filled picks (have a playerName)
  const filledPicks = allPicks.filter((p) => p.playerName !== "");

  // If `since` param, return only picks after that timestamp
  const newPicks = since
    ? filledPicks.filter((p) => p.timestamp && p.timestamp > since)
    : filledPicks;

  // Determine current pick (next unfilled)
  const nextUnfilled = allPicks.find((p) => p.playerName === "");
  const currentPick = nextUnfilled?.pickNumber ?? filledPicks.length + 1;

  // Check if draft is currently active
  const draftDates = JSON.parse(meta.draftDates ?? "[]") as string[];
  const now = new Date();
  const isActive = draftDates.some((dateStr) => {
    const start = new Date(dateStr);
    const end = new Date(start.getTime() + 6 * 60 * 60 * 1000); // 6 hour window
    return now >= start && now <= end;
  });

  const response: DraftLiveResponse = {
    currentPick,
    onTheClock: nextUnfilled
      ? { teamId: nextUnfilled.teamId, timeRemaining: 0 }
      : null,
    picks: newPicks,
    lastUpdated: meta.lastUpdated ?? new Date().toISOString(),
    isActive,
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
```

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | head -10`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/app/api/draft/live/route.ts
git commit -m "feat(draft): add /api/draft/live endpoint for 5s polling"
```

---

### Task 10: DraftPickCard Component

**Files:**
- Create: `src/components/draft/DraftPickCard.tsx`

- [ ] **Step 1: Create the shared pick card component**

```typescript
import Image from "next/image";
import type { DraftPick, Team } from "@/types";

interface DraftPickCardProps {
  pick: DraftPick;
  team?: Team;
  isNew?: boolean;
  showRound?: boolean;
}

export function DraftPickCard({ pick, team, isNew, showRound }: DraftPickCardProps) {
  const isFilled = pick.playerName !== "";

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all ${
        isNew
          ? "animate-pulse border-status-green/40 bg-status-green-bg/20"
          : "border-border bg-bg-card"
      }`}
    >
      {/* Pick number */}
      <div className="flex flex-col items-center justify-center w-10">
        <span className="text-xs text-text-muted">
          {showRound ? `R${pick.round}` : ""}
        </span>
        <span className="text-lg font-bold font-mono text-text-primary">
          {pick.pickNumber}
        </span>
      </div>

      {/* Team logo */}
      {team && (
        <Image
          src={team.logo}
          alt={team.name}
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
        />
      )}

      {/* Player info */}
      <div className="flex-1 min-w-0">
        {isFilled ? (
          <>
            <div className="text-sm font-semibold text-text-primary truncate">
              {pick.playerName}
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span className="font-medium text-text-secondary">{pick.position}</span>
              <span>{pick.college}</span>
            </div>
          </>
        ) : (
          <div className="text-sm text-text-muted">{team?.fullName ?? "TBD"}</div>
        )}
      </div>

      {/* Trade badge */}
      {pick.isTradeUp && (
        <span className="shrink-0 rounded-full bg-status-amber-bg px-2 py-0.5 text-[10px] font-semibold text-status-amber">
          TRADE
        </span>
      )}

      {/* New pick indicator */}
      {isNew && (
        <span className="shrink-0 rounded-full bg-status-green-bg px-2 py-0.5 text-[10px] font-semibold text-status-green">
          JUST IN
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | head -10`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/draft/DraftPickCard.tsx
git commit -m "feat(draft): add shared DraftPickCard component"
```

---

### Task 11: DraftCountdown Component

**Files:**
- Create: `src/components/draft/DraftCountdown.tsx`

- [ ] **Step 1: Create the countdown timer client component**

```typescript
"use client";

import { useState, useEffect } from "react";

interface DraftCountdownProps {
  targetDate: string; // ISO date string
}

function getTimeRemaining(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

export function DraftCountdown({ targetDate }: DraftCountdownProps) {
  const target = new Date(targetDate);
  const [time, setTime] = useState(getTimeRemaining(target));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeRemaining(target));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (time.expired) {
    return (
      <div className="text-center">
        <span className="text-sm font-semibold text-status-green">Draft is LIVE</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <TimeUnit value={time.days} label="DAYS" />
      <span className="text-xl font-bold text-text-muted">:</span>
      <TimeUnit value={time.hours} label="HRS" />
      <span className="text-xl font-bold text-text-muted">:</span>
      <TimeUnit value={time.minutes} label="MIN" />
      <span className="text-xl font-bold text-text-muted">:</span>
      <TimeUnit value={time.seconds} label="SEC" />
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl sm:text-3xl font-bold font-mono text-text-primary tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] text-text-muted tracking-wider">{label}</span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/draft/DraftCountdown.tsx
git commit -m "feat(draft): add DraftCountdown client component"
```

---

### Task 12: PreDraftHub Component

**Files:**
- Create: `src/components/draft/PreDraftHub.tsx`

- [ ] **Step 1: Create the pre-draft hub component**

```typescript
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { DraftPick, DraftProspect, TeamNeed, Team } from "@/types";
import { DraftCountdown } from "./DraftCountdown";
import { DraftPickCard } from "./DraftPickCard";

interface PreDraftHubProps {
  draftOrder: DraftPick[];
  prospects: DraftProspect[];
  teamNeeds: TeamNeed[];
  teams: Team[];
  draftStartDate: string;
}

type Tab = "order" | "needs" | "prospects";

const PRIORITY_COLORS: Record<number, string> = {
  1: "bg-status-red text-white",
  2: "bg-status-amber text-black",
  3: "bg-bg-card-hover text-text-muted",
};

export function PreDraftHub({
  draftOrder,
  prospects,
  teamNeeds,
  teams,
  draftStartDate,
}: PreDraftHubProps) {
  const [tab, setTab] = useState<Tab>("order");
  const teamMap = new Map(teams.map((t) => [t.id, t]));

  // Group needs by team
  const needsByTeam = new Map<string, TeamNeed[]>();
  for (const need of teamNeeds) {
    const existing = needsByTeam.get(need.teamId) ?? [];
    existing.push(need);
    needsByTeam.set(need.teamId, existing);
  }

  return (
    <div>
      {/* Countdown */}
      <div className="mb-6 rounded-lg border border-border bg-bg-card p-6 text-center">
        <h2 className="mb-1 text-sm font-semibold text-text-muted uppercase tracking-wider">
          2026 NFL Draft
        </h2>
        <p className="mb-4 text-xs text-text-muted">April 23-25, 2026</p>
        <DraftCountdown targetDate={draftStartDate} />
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-lg border border-border bg-bg-card p-1">
        {(["order", "needs", "prospects"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === t
                ? "bg-bg-card-hover text-text-primary"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {t === "order" ? "Draft Order" : t === "needs" ? "Team Needs" : "Top Prospects"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "order" && (
        <div className="space-y-2">
          {draftOrder.map((pick) => (
            <DraftPickCard
              key={pick.id}
              pick={pick}
              team={teamMap.get(pick.teamId)}
              showRound
            />
          ))}
        </div>
      )}

      {tab === "needs" && (
        <div className="space-y-2">
          {draftOrder.map((pick) => {
            const team = teamMap.get(pick.teamId);
            const needs = needsByTeam.get(pick.teamId) ?? [];
            if (!team) return null;

            return (
              <Link
                key={pick.id}
                href={`/team/${team.id}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-bg-card px-3 py-2.5 hover:bg-bg-card-hover transition-colors"
              >
                <span className="w-8 text-center font-mono text-sm font-bold text-text-muted">
                  {pick.pickNumber}
                </span>
                <Image src={team.logo} alt={team.name} width={28} height={28} className="h-7 w-7 object-contain" />
                <span className="text-sm font-semibold text-text-primary">{team.name}</span>
                <div className="ml-auto flex gap-1.5">
                  {needs.sort((a, b) => a.priority - b.priority).map((n) => (
                    <span
                      key={n.position}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_COLORS[n.priority]}`}
                    >
                      {n.position}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {tab === "prospects" && (
        <div className="space-y-2">
          {prospects.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-bg-card px-3 py-2.5"
            >
              <span className="w-8 text-center font-mono text-sm font-bold text-text-muted">
                {p.rank}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text-primary">{p.name}</div>
                <div className="text-xs text-text-muted">{p.college}</div>
              </div>
              <span className="rounded-full bg-bg-card-hover px-2 py-0.5 text-[10px] font-semibold text-text-secondary">
                {p.position}
              </span>
              {p.projectedPick && (
                <span className="text-xs text-text-muted font-mono">
                  ~{p.projectedPick}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/draft/PreDraftHub.tsx
git commit -m "feat(draft): add PreDraftHub component with tabs for order, needs, prospects"
```

---

### Task 13: LiveDraftTracker Component

**Files:**
- Create: `src/components/draft/LiveDraftTracker.tsx`

- [ ] **Step 1: Create the live draft tracker client component**

```typescript
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import type { DraftPick, DraftLiveResponse, Team } from "@/types";
import { DraftPickCard } from "./DraftPickCard";

interface LiveDraftTrackerProps {
  initialPicks: DraftPick[];
  teams: Team[];
  draftYear: number;
}

const POLL_INTERVAL_MS = 5_000;

export function LiveDraftTracker({ initialPicks, teams, draftYear }: LiveDraftTrackerProps) {
  const [picks, setPicks] = useState<DraftPick[]>(initialPicks.filter((p) => p.playerName !== ""));
  const [newPickIds, setNewPickIds] = useState<Set<string>>(new Set());
  const [onTheClock, setOnTheClock] = useState<{ teamId: string; timeRemaining: number } | null>(null);
  const [currentPick, setCurrentPick] = useState(initialPicks.filter((p) => p.playerName !== "").length + 1);
  const [isActive, setIsActive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [connectionError, setConnectionError] = useState(false);
  const lastTimestamp = useRef<string | null>(null);

  const teamMap = new Map(teams.map((t) => [t.id, t]));

  const poll = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (lastTimestamp.current) params.set("since", lastTimestamp.current);

      const res = await fetch(`/api/draft/live?${params.toString()}`);
      if (!res.ok) throw new Error("Poll failed");

      const data = (await res.json()) as DraftLiveResponse;

      if (data.picks.length > 0) {
        const newIds = new Set(data.picks.map((p) => p.id));
        setNewPickIds(newIds);

        setPicks((prev) => {
          const existing = new Set(prev.map((p) => p.id));
          const fresh = data.picks.filter((p) => !existing.has(p.id));
          return [...fresh, ...prev];
        });

        // Clear "JUST IN" after 3 seconds
        setTimeout(() => setNewPickIds(new Set()), 3000);

        // Update last timestamp to the newest pick
        const latestPick = data.picks[data.picks.length - 1];
        if (latestPick?.timestamp) {
          lastTimestamp.current = latestPick.timestamp;
        }
      }

      setOnTheClock(data.onTheClock);
      setCurrentPick(data.currentPick);
      setIsActive(data.isActive);
      setLastUpdated(data.lastUpdated);
      setConnectionError(false);
    } catch {
      setConnectionError(true);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [poll]);

  // Figure out which round we're in
  const currentRound = picks.length > 0
    ? picks[0].round
    : 1;
  const picksInRound = picks.filter((p) => p.round === currentRound);

  const clockTeam = onTheClock ? teamMap.get(onTheClock.teamId) : null;

  return (
    <div>
      {/* On the Clock banner */}
      {clockTeam && (
        <div className="mb-6 rounded-lg border border-status-green/30 bg-status-green-bg/10 p-4">
          <div className="text-center">
            <span className="text-[10px] font-semibold text-status-green uppercase tracking-wider">
              On the Clock — Pick {currentPick}
            </span>
            <div className="mt-2 flex items-center justify-center gap-3">
              <Image
                src={clockTeam.logo}
                alt={clockTeam.name}
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
              <span className="text-xl font-bold text-text-primary">{clockTeam.fullName}</span>
            </div>
          </div>
        </div>
      )}

      {/* Connection status */}
      {connectionError && (
        <div className="mb-4 rounded-lg border border-status-amber/30 bg-status-amber-bg/10 px-3 py-2 text-center text-xs text-status-amber">
          Connection lost — retrying...
        </div>
      )}

      {/* Round progress */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-secondary">
          Round {currentRound} — {picksInRound.length}/32 picks
        </h2>
        {!isActive && (
          <span className="text-xs text-text-muted">Between rounds</span>
        )}
        <span className="text-[10px] text-text-muted font-mono">
          Updated {new Date(lastUpdated).toLocaleTimeString()}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-6 h-1.5 rounded-full bg-bg-card-hover">
        <div
          className="h-full rounded-full bg-status-green transition-all duration-500"
          style={{ width: `${(picksInRound.length / 32) * 100}%` }}
        />
      </div>

      {/* Pick feed — newest first */}
      <div className="space-y-2">
        {picks.map((pick) => (
          <DraftPickCard
            key={pick.id}
            pick={pick}
            team={teamMap.get(pick.teamId)}
            isNew={newPickIds.has(pick.id)}
            showRound
          />
        ))}
      </div>

      {picks.length === 0 && (
        <div className="text-center py-12 text-text-muted text-sm">
          Waiting for picks...
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/draft/LiveDraftTracker.tsx
git commit -m "feat(draft): add LiveDraftTracker with 5s polling and pick animations"
```

---

### Task 14: DraftResults Component

**Files:**
- Create: `src/components/draft/DraftResults.tsx`

- [ ] **Step 1: Create the post-draft results component**

```typescript
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { DraftPick, TeamNeed, Team } from "@/types";

interface DraftResultsProps {
  picks: DraftPick[];
  teamNeeds: TeamNeed[];
  teams: Team[];
}

type ViewMode = "team" | "round" | "position";

export function DraftResults({ picks, teamNeeds, teams }: DraftResultsProps) {
  const [view, setView] = useState<ViewMode>("team");
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const filledPicks = picks.filter((p) => p.playerName !== "");

  // Group needs by team for "needs addressed" display
  const needsByTeam = new Map<string, Set<string>>();
  for (const need of teamNeeds) {
    const existing = needsByTeam.get(need.teamId) ?? new Set();
    existing.add(need.position);
    needsByTeam.set(need.teamId, existing);
  }

  return (
    <div>
      {/* Summary header */}
      <div className="mb-6 rounded-lg border border-border bg-bg-card p-4 text-center">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
          2026 NFL Draft Results
        </h2>
        <p className="mt-1 text-xs text-text-muted">
          {filledPicks.length} picks across {new Set(filledPicks.map((p) => p.round)).size} rounds
        </p>
      </div>

      {/* View toggles */}
      <div className="mb-4 flex gap-1 rounded-lg border border-border bg-bg-card p-1">
        {(["team", "round", "position"] as ViewMode[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              view === v
                ? "bg-bg-card-hover text-text-primary"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {v === "team" ? "By Team" : v === "round" ? "By Round" : "By Position"}
          </button>
        ))}
      </div>

      {/* By Team view */}
      {view === "team" && (
        <div className="space-y-4">
          {teams
            .filter((t) => filledPicks.some((p) => p.teamId === t.id))
            .map((team) => {
              const teamPicks = filledPicks.filter((p) => p.teamId === team.id);
              const needs = needsByTeam.get(team.id) ?? new Set();
              const addressed = new Set(teamPicks.map((p) => p.position));
              const needsMet = [...needs].filter((n) => addressed.has(n));

              return (
                <div key={team.id} className="rounded-lg border border-border bg-bg-card overflow-hidden">
                  <Link
                    href={`/team/${team.id}`}
                    className="flex items-center gap-3 px-4 py-3 border-b border-border hover:bg-bg-card-hover transition-colors"
                  >
                    <Image src={team.logo} alt={team.name} width={28} height={28} className="h-7 w-7 object-contain" />
                    <span className="text-sm font-semibold text-text-primary">{team.fullName}</span>
                    <span className="ml-auto text-xs text-text-muted">{teamPicks.length} picks</span>
                    {needsMet.length > 0 && (
                      <span className="text-[10px] text-status-green">
                        {needsMet.length} needs addressed
                      </span>
                    )}
                  </Link>
                  <div className="divide-y divide-border/50">
                    {teamPicks.map((pick) => (
                      <div key={pick.id} className="flex items-center gap-3 px-4 py-2">
                        <span className="w-16 text-xs text-text-muted font-mono">
                          Rd {pick.round} · #{pick.pickNumber}
                        </span>
                        <span className="text-sm font-semibold text-text-primary">{pick.playerName}</span>
                        <span className="text-xs text-text-secondary">{pick.position}</span>
                        <span className="text-xs text-text-muted">{pick.college}</span>
                        {pick.isTradeUp && (
                          <span className="ml-auto rounded-full bg-status-amber-bg px-2 py-0.5 text-[10px] font-semibold text-status-amber">
                            TRADE
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* By Round view */}
      {view === "round" && (
        <div className="space-y-6">
          {Array.from(new Set(filledPicks.map((p) => p.round)))
            .sort((a, b) => a - b)
            .map((round) => {
              const roundPicks = filledPicks.filter((p) => p.round === round);
              return (
                <div key={round}>
                  <h3 className="mb-2 text-sm font-semibold text-text-secondary">
                    Round {round} ({roundPicks.length} picks)
                  </h3>
                  <div className="space-y-1.5">
                    {roundPicks.map((pick) => {
                      const team = teamMap.get(pick.teamId);
                      return (
                        <div key={pick.id} className="flex items-center gap-3 rounded-lg border border-border bg-bg-card px-3 py-2">
                          <span className="w-8 text-center font-mono text-sm font-bold text-text-muted">
                            {pick.pickNumber}
                          </span>
                          {team && (
                            <Image src={team.logo} alt={team.name} width={24} height={24} className="h-6 w-6 object-contain" />
                          )}
                          <span className="text-sm font-semibold text-text-primary">{pick.playerName}</span>
                          <span className="text-xs text-text-secondary">{pick.position}</span>
                          <span className="ml-auto text-xs text-text-muted">{pick.college}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* By Position view */}
      {view === "position" && (
        <div className="space-y-6">
          {Array.from(new Set(filledPicks.map((p) => p.position)))
            .sort()
            .map((pos) => {
              const posPicks = filledPicks.filter((p) => p.position === pos);
              return (
                <div key={pos}>
                  <h3 className="mb-2 text-sm font-semibold text-text-secondary">
                    {pos} ({posPicks.length} drafted)
                  </h3>
                  <div className="space-y-1.5">
                    {posPicks.map((pick) => {
                      const team = teamMap.get(pick.teamId);
                      return (
                        <div key={pick.id} className="flex items-center gap-3 rounded-lg border border-border bg-bg-card px-3 py-2">
                          <span className="w-8 text-center font-mono text-sm font-bold text-text-muted">
                            {pick.pickNumber}
                          </span>
                          {team && (
                            <Image src={team.logo} alt={team.name} width={24} height={24} className="h-6 w-6 object-contain" />
                          )}
                          <span className="text-sm font-semibold text-text-primary">{pick.playerName}</span>
                          <span className="ml-auto text-xs text-text-muted">{team?.name} · {pick.college}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/draft/DraftResults.tsx
git commit -m "feat(draft): add DraftResults component with team/round/position views"
```

---

### Task 15: Draft Page

**Files:**
- Create: `src/app/draft/page.tsx`

- [ ] **Step 1: Create the draft page server component**

```typescript
import { createRosterService } from "@/services/createRosterService";
import { PreDraftHub } from "@/components/draft/PreDraftHub";
import { LiveDraftTracker } from "@/components/draft/LiveDraftTracker";
import { DraftResults } from "@/components/draft/DraftResults";
import { NewsFeed } from "@/components/NewsFeed";
import { MobileNewsToggle } from "@/components/MobileNewsToggle";
import type { DraftMode } from "@/types";

export const dynamic = "force-dynamic";

function getDraftMode(now: Date, draftDates: string[]): DraftMode {
  if (draftDates.length === 0) return "pre";

  const firstDay = new Date(draftDates[0]);
  const lastDay = new Date(draftDates[draftDates.length - 1]);
  // Last day window: start + 12 hours
  const draftEnd = new Date(lastDay.getTime() + 12 * 60 * 60 * 1000);

  if (now < firstDay) return "pre";
  if (now <= draftEnd) return "live";
  return "results";
}

export default async function DraftPage() {
  const service = createRosterService();
  const meta = await service.getDraftMeta();
  const year = parseInt(meta.draftYear ?? "2026", 10);
  const draftDates = JSON.parse(meta.draftDates ?? "[]") as string[];
  const draftStartDate = draftDates[0] ?? "2026-04-23T20:00:00-04:00";

  const now = new Date();
  const mode = getDraftMode(now, draftDates);

  const [picks, prospects, teamNeeds, allNews] = await Promise.all([
    service.getDraftPicks(year),
    service.getDraftProspects(),
    service.getTeamNeeds(),
    service.getAllNews({ limit: 30 }),
  ]);

  const teams = service.getAllTeams();

  return (
    <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-49px)]">
      {/* Draft content — Left */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {mode === "pre" && (
          <PreDraftHub
            draftOrder={picks}
            prospects={prospects}
            teamNeeds={teamNeeds}
            teams={teams}
            draftStartDate={draftStartDate}
          />
        )}

        {mode === "live" && (
          <LiveDraftTracker
            initialPicks={picks}
            teams={teams}
            draftYear={year}
          />
        )}

        {mode === "results" && (
          <DraftResults
            picks={picks}
            teamNeeds={teamNeeds}
            teams={teams}
          />
        )}
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

- [ ] **Step 2: Verify the page compiles**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/app/draft/page.tsx
git commit -m "feat(draft): add /draft page with pre/live/results mode switching"
```

---

### Task 16: TopBar — Add Draft Nav Link

**Files:**
- Modify: `src/components/TopBar.tsx`

- [ ] **Step 1: Add Draft link next to Schedule**

In `TopBar.tsx`, after the existing Schedule link (around line 32-35), add the Draft link:

```typescript
        <Link
          href="/schedule"
          className="hidden sm:inline text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          Schedule
        </Link>
        <Link
          href="/draft"
          className="hidden sm:inline text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          Draft
        </Link>
```

- [ ] **Step 2: Verify it renders properly**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/TopBar.tsx
git commit -m "feat(draft): add Draft nav link to TopBar"
```

---

### Task 17: Seed Database and Verify

**Files:** No new files — this is a verification task.

- [ ] **Step 1: Run the scraper locally to seed draft data**

```bash
export TURSO_DATABASE_URL=$(grep TURSO_DATABASE_URL .env.local | cut -d= -f2-)
export TURSO_AUTH_TOKEN=$(grep TURSO_AUTH_TOKEN .env.local | cut -d= -f2-)
npx tsx src/scraper/cli.ts
```

Expected: Scraper completes, shows espn-draft adapter with items found.

- [ ] **Step 2: Verify draft data in database**

```bash
export TURSO_DATABASE_URL=$(grep TURSO_DATABASE_URL .env.local | cut -d= -f2-)
export TURSO_AUTH_TOKEN=$(grep TURSO_AUTH_TOKEN .env.local | cut -d= -f2-)
npx tsx -e "
const { getDb, closeDb } = require('./src/db/client');
const db = getDb();
const picks = await db.execute('SELECT COUNT(*) as c FROM draft_picks');
const prospects = await db.execute('SELECT COUNT(*) as c FROM draft_prospects');
const needs = await db.execute('SELECT COUNT(*) as c FROM draft_team_needs');
const meta = await db.execute('SELECT * FROM draft_meta');
console.log('Picks:', picks.rows[0].c);
console.log('Prospects:', prospects.rows[0].c);
console.log('Needs:', needs.rows[0].c);
console.log('Meta:', meta.rows);
closeDb();
"
```

Expected: Picks: 32, Prospects: 32, Needs: ~96, Meta: draftYear=2026 + draftDates

- [ ] **Step 3: Start dev server and verify page**

Run: `npm run dev`

Visit: `http://localhost:3000/draft`

Expected: Pre-draft hub showing with countdown, draft order tab, team needs tab, and prospect rankings tab.

- [ ] **Step 4: Verify live API endpoint**

Run: `curl -s http://localhost:3000/api/draft/live | npx json`

Expected: JSON response with currentPick, onTheClock, picks array, lastUpdated, isActive.

---

### Task 18: Run All Tests

**Files:** No changes — verification only.

- [ ] **Step 1: Run existing test suite to ensure nothing is broken**

Run: `npx jest 2>&1 | tail -20`
Expected: All existing tests pass. New espn-draft tests pass.

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds with /draft page listed
