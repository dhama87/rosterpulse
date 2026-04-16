# RosterPulse UI Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add bye week tags, player trending indicators, key stat lines, availability summaries, and division standings to existing views.

**Architecture:** Five independent UI enhancements that modify existing components. One new utility file (`statLine.ts`) for stat formatting. Type changes to `Team` and `Player` interfaces propagated through DB schema, seed, orchestrator, and live service.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS 4, Jest 30, better-sqlite3

---

## File Structure

**New files:**
- `src/utils/statLine.ts` — pure function for position-specific stat formatting
- `src/utils/__tests__/statLine.test.ts` — tests for stat line formatting

**Modified files:**
- `src/types/index.ts` — add `byeWeek` to Team, `depthChange` to Player
- `src/data/teams.ts` — add `byeWeek` to all 32 teams
- `src/data/players.ts` — add `depthChange` to a few demo players
- `src/db/schema.ts` — add `depthChange` column
- `src/db/seed.ts` — pass `depthChange` through
- `src/scraper/orchestrator.ts` — pass `depthChange` through
- `src/services/liveRosterService.ts` — map `depthChange` from row
- `src/components/TeamCard.tsx` — bye week label
- `src/components/DepthChartRow.tsx` — trending arrow + stat line
- `src/components/DepthChartGrid.tsx` — stats column header
- `src/app/team/[teamId]/page.tsx` — availability summary + division standings

---

### Task 1: Type Changes

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add `byeWeek` to Team interface**

In `src/types/index.ts`, add `byeWeek` after `lastUpdated` in the `Team` interface:

```typescript
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
```

- [ ] **Step 2: Add `depthChange` to Player interface**

In `src/types/index.ts`, add `depthChange` after `practiceStatus` in the `Player` interface:

```typescript
  practiceStatus?: "DNP" | "Limited" | "Full";
  depthChange?: "up" | "down";
  stats: Record<string, number>;
```

- [ ] **Step 3: Run tests to check for type errors**

Run: `npx jest --passWithNoTests 2>&1 | tail -5`
Expected: Type errors in `src/data/teams.ts` because `byeWeek` is now required but not yet provided. This is expected — we fix it in Task 2.

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add byeWeek to Team and depthChange to Player types"
```

---

### Task 2: Bye Week Data

**Files:**
- Modify: `src/data/teams.ts`

- [ ] **Step 1: Add `byeWeek` to every team entry**

In `src/data/teams.ts`, add `byeWeek` to each team object. These are 2025 NFL bye weeks:

```typescript
  // === AFC East ===
  {
    id: "BUF", name: "Bills", fullName: "Buffalo Bills",
    conference: "AFC", division: "East", record: "13-4",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/buf.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 12,
  },
  {
    id: "MIA", name: "Dolphins", fullName: "Miami Dolphins",
    conference: "AFC", division: "East", record: "11-6",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/mia.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 6,
  },
  {
    id: "NE", name: "Patriots", fullName: "New England Patriots",
    conference: "AFC", division: "East", record: "4-13",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/ne.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 14,
  },
  {
    id: "NYJ", name: "Jets", fullName: "New York Jets",
    conference: "AFC", division: "East", record: "5-12",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 12,
  },
  // === AFC North ===
  {
    id: "BAL", name: "Ravens", fullName: "Baltimore Ravens",
    conference: "AFC", division: "North", record: "12-5",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/bal.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 14,
  },
  {
    id: "CIN", name: "Bengals", fullName: "Cincinnati Bengals",
    conference: "AFC", division: "North", record: "9-8",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/cin.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 12,
  },
  {
    id: "CLE", name: "Browns", fullName: "Cleveland Browns",
    conference: "AFC", division: "North", record: "3-14",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/cle.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 10,
  },
  {
    id: "PIT", name: "Steelers", fullName: "Pittsburgh Steelers",
    conference: "AFC", division: "North", record: "10-7",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/pit.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 9,
  },
  // === AFC South ===
  {
    id: "HOU", name: "Texans", fullName: "Houston Texans",
    conference: "AFC", division: "South", record: "10-7",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/hou.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 14,
  },
  {
    id: "IND", name: "Colts", fullName: "Indianapolis Colts",
    conference: "AFC", division: "South", record: "8-9",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/ind.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 14,
  },
  {
    id: "JAX", name: "Jaguars", fullName: "Jacksonville Jaguars",
    conference: "AFC", division: "South", record: "4-13",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/jax.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 12,
  },
  {
    id: "TEN", name: "Titans", fullName: "Tennessee Titans",
    conference: "AFC", division: "South", record: "3-14",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/ten.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 5,
  },
  // === AFC West ===
  {
    id: "KC", name: "Chiefs", fullName: "Kansas City Chiefs",
    conference: "AFC", division: "West", record: "15-2",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 6,
  },
  {
    id: "LV", name: "Raiders", fullName: "Las Vegas Raiders",
    conference: "AFC", division: "West", record: "4-13",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/lv.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 10,
  },
  {
    id: "LAC", name: "Chargers", fullName: "Los Angeles Chargers",
    conference: "AFC", division: "West", record: "11-6",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/lac.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 5,
  },
  {
    id: "DEN", name: "Broncos", fullName: "Denver Broncos",
    conference: "AFC", division: "West", record: "10-7",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/den.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 14,
  },
  // === NFC East ===
  {
    id: "DAL", name: "Cowboys", fullName: "Dallas Cowboys",
    conference: "NFC", division: "East", record: "7-10",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/dal.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 7,
  },
  {
    id: "NYG", name: "Giants", fullName: "New York Giants",
    conference: "NFC", division: "East", record: "3-14",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 11,
  },
  {
    id: "PHI", name: "Eagles", fullName: "Philadelphia Eagles",
    conference: "NFC", division: "East", record: "14-3",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/phi.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 5,
  },
  {
    id: "WAS", name: "Commanders", fullName: "Washington Commanders",
    conference: "NFC", division: "East", record: "12-5",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 14,
  },
  // === NFC North ===
  {
    id: "CHI", name: "Bears", fullName: "Chicago Bears",
    conference: "NFC", division: "North", record: "5-12",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/chi.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 7,
  },
  {
    id: "DET", name: "Lions", fullName: "Detroit Lions",
    conference: "NFC", division: "North", record: "15-2",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/det.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 5,
  },
  {
    id: "GB", name: "Packers", fullName: "Green Bay Packers",
    conference: "NFC", division: "North", record: "11-6",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/gb.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 10,
  },
  {
    id: "MIN", name: "Vikings", fullName: "Minnesota Vikings",
    conference: "NFC", division: "North", record: "14-3",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/min.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 6,
  },
  // === NFC South ===
  {
    id: "ATL", name: "Falcons", fullName: "Atlanta Falcons",
    conference: "NFC", division: "South", record: "8-9",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/atl.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 12,
  },
  {
    id: "CAR", name: "Panthers", fullName: "Carolina Panthers",
    conference: "NFC", division: "South", record: "4-13",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/car.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 11,
  },
  {
    id: "NO", name: "Saints", fullName: "New Orleans Saints",
    conference: "NFC", division: "South", record: "5-12",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/no.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 12,
  },
  {
    id: "TB", name: "Buccaneers", fullName: "Tampa Bay Buccaneers",
    conference: "NFC", division: "South", record: "10-7",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/tb.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 11,
  },
  // === NFC West ===
  {
    id: "ARI", name: "Cardinals", fullName: "Arizona Cardinals",
    conference: "NFC", division: "West", record: "8-9",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/ari.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 11,
  },
  {
    id: "LAR", name: "Rams", fullName: "Los Angeles Rams",
    conference: "NFC", division: "West", record: "10-7",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/lar.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 6,
  },
  {
    id: "SF", name: "49ers", fullName: "San Francisco 49ers",
    conference: "NFC", division: "West", record: "6-11",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/sf.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 9,
  },
  {
    id: "SEA", name: "Seahawks", fullName: "Seattle Seahawks",
    conference: "NFC", division: "West", record: "10-7",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/sea.png",
    lastUpdated: new Date().toISOString(),
    byeWeek: 10,
  },
```

- [ ] **Step 2: Run tests**

Run: `npx jest --passWithNoTests 2>&1 | tail -5`
Expected: PASS (all 114 tests)

- [ ] **Step 3: Commit**

```bash
git add src/data/teams.ts
git commit -m "feat: add 2025 bye week data for all 32 teams"
```

---

### Task 3: Stat Line Utility (TDD)

**Files:**
- Create: `src/utils/statLine.ts`
- Create: `src/utils/__tests__/statLine.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/utils/__tests__/statLine.test.ts`:

```typescript
import { getStatLine } from "../statLine";
import { Player } from "@/types";

function makeTestPlayer(position: string, stats: Record<string, number>): Player {
  return {
    id: "test-1",
    name: "Test Player",
    team: "KC",
    position,
    positionGroup: "offense",
    depthOrder: 1,
    jerseyNumber: 1,
    height: "6-0",
    weight: "200",
    age: 25,
    college: "Test U",
    experience: 3,
    injuryStatus: "Active",
    stats,
  };
}

describe("getStatLine", () => {
  it("formats QB stats", () => {
    const player = makeTestPlayer("QB", { passYds: 4183, passTD: 30, int: 11, qbr: 94.2 });
    expect(getStatLine(player)).toBe("4,183 yds / 30 TD");
  });

  it("formats RB stats", () => {
    const player = makeTestPlayer("RB", { rushYds: 1012, rushTD: 7, ypc: 4.5, rec: 32 });
    expect(getStatLine(player)).toBe("1,012 yds / 7 TD");
  });

  it("formats WR stats (WR1, WR2, WR3)", () => {
    const player = makeTestPlayer("WR1", { recYds: 858, recTD: 5, rec: 68, targets: 100 });
    expect(getStatLine(player)).toBe("68 rec / 858 yds");
  });

  it("formats TE stats", () => {
    const player = makeTestPlayer("TE", { recYds: 823, recTD: 5, rec: 75, targets: 98 });
    expect(getStatLine(player)).toBe("75 rec / 823 yds");
  });

  it("formats OL stats (LT, LG, C, RG, RT)", () => {
    const player = makeTestPlayer("LT", { gamesStarted: 14, sacks: 2 });
    expect(getStatLine(player)).toBe("14 GS");
  });

  it("formats DL stats (DE1, DE2, DT1, DT2)", () => {
    const player = makeTestPlayer("DE1", { tackles: 45, sacks: 8.5, tfl: 10, ff: 2 });
    expect(getStatLine(player)).toBe("8.5 sacks");
  });

  it("formats LB stats", () => {
    const player = makeTestPlayer("LB1", { tackles: 95, sacks: 4.5, tfl: 8, int: 1 });
    expect(getStatLine(player)).toBe("95 tkl / 4.5 sacks");
  });

  it("formats CB stats", () => {
    const player = makeTestPlayer("CB1", { tackles: 58, int: 3, pd: 12, ff: 1 });
    expect(getStatLine(player)).toBe("3 INT / 12 PD");
  });

  it("formats S stats (SS, FS)", () => {
    const player = makeTestPlayer("SS", { tackles: 75, int: 2, pd: 8, ff: 1 });
    expect(getStatLine(player)).toBe("75 tkl / 2 INT");
  });

  it("formats K stats", () => {
    const player = makeTestPlayer("K", { fgMade: 28, fgAtt: 32, xpMade: 40, longFG: 55 });
    expect(getStatLine(player)).toBe("28/32 FG");
  });

  it("formats P stats", () => {
    const player = makeTestPlayer("P", { punts: 60, puntAvg: 45.2, inside20: 25, longPunt: 62 });
    expect(getStatLine(player)).toBe("45.2 avg");
  });

  it("returns empty string for KR", () => {
    const player = makeTestPlayer("KR", { krYds: 500, krAvg: 24.0, krTD: 1, krLong: 98 });
    expect(getStatLine(player)).toBe("");
  });

  it("returns empty string for PR", () => {
    const player = makeTestPlayer("PR", { prYds: 200, prAvg: 10.0, prTD: 0, prLong: 45 });
    expect(getStatLine(player)).toBe("");
  });

  it("returns empty string for LS", () => {
    const player = makeTestPlayer("LS", { gamesPlayed: 17, badSnaps: 0 });
    expect(getStatLine(player)).toBe("");
  });

  it("handles zero stats gracefully", () => {
    const player = makeTestPlayer("QB", { passYds: 0, passTD: 0, int: 0, qbr: 0 });
    expect(getStatLine(player)).toBe("0 yds / 0 TD");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest src/utils/__tests__/statLine.test.ts 2>&1 | tail -5`
Expected: FAIL — module not found

- [ ] **Step 3: Implement `getStatLine`**

Create `src/utils/statLine.ts`:

```typescript
import { Player } from "@/types";

function fmt(n: number): string {
  return n >= 1000 ? n.toLocaleString("en-US") : String(n);
}

export function getStatLine(player: Player): string {
  const s = player.stats;
  const pos = player.position;

  if (pos === "QB") {
    return `${fmt(s.passYds ?? 0)} yds / ${s.passTD ?? 0} TD`;
  }
  if (pos === "RB") {
    return `${fmt(s.rushYds ?? 0)} yds / ${s.rushTD ?? 0} TD`;
  }
  if (pos.startsWith("WR") || pos === "TE") {
    return `${s.rec ?? 0} rec / ${fmt(s.recYds ?? 0)} yds`;
  }
  if (["LT", "LG", "C", "RG", "RT"].includes(pos)) {
    return `${s.gamesStarted ?? 0} GS`;
  }
  if (pos.startsWith("DE") || pos.startsWith("DT")) {
    return `${s.sacks ?? 0} sacks`;
  }
  if (pos.startsWith("LB")) {
    return `${s.tackles ?? 0} tkl / ${s.sacks ?? 0} sacks`;
  }
  if (pos.startsWith("CB")) {
    return `${s.int ?? 0} INT / ${s.pd ?? 0} PD`;
  }
  if (pos === "SS" || pos === "FS") {
    return `${s.tackles ?? 0} tkl / ${s.int ?? 0} INT`;
  }
  if (pos === "K") {
    return `${s.fgMade ?? 0}/${s.fgAtt ?? 0} FG`;
  }
  if (pos === "P") {
    return `${s.puntAvg ?? 0} avg`;
  }

  return "";
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest src/utils/__tests__/statLine.test.ts 2>&1 | tail -5`
Expected: PASS (16 tests)

- [ ] **Step 5: Run all tests**

Run: `npx jest --passWithNoTests 2>&1 | tail -5`
Expected: PASS (all tests)

- [ ] **Step 6: Commit**

```bash
git add src/utils/statLine.ts src/utils/__tests__/statLine.test.ts
git commit -m "feat: add getStatLine utility with position-specific formatting"
```

---

### Task 4: Depth Change Data Plumbing

**Files:**
- Modify: `src/data/players.ts`
- Modify: `src/db/schema.ts`
- Modify: `src/db/seed.ts`
- Modify: `src/scraper/orchestrator.ts`
- Modify: `src/services/liveRosterService.ts`

- [ ] **Step 1: Add `depthChange` column to schema**

In `src/db/schema.ts`, add after the `practiceStatus` column:

```typescript
      practiceStatus TEXT,
      depthChange TEXT,
      stats TEXT NOT NULL DEFAULT '{}',
```

- [ ] **Step 2: Add `depthChange` to PlayerRow and rowToPlayer in liveRosterService**

In `src/services/liveRosterService.ts`, add to the `PlayerRow` interface after `practiceStatus`:

```typescript
  practiceStatus: string | null;
  depthChange: string | null;
  stats: string;
```

In the `rowToPlayer` function, add after the `practiceStatus` mapping:

```typescript
    ...(row.practiceStatus != null ? { practiceStatus: row.practiceStatus as "DNP" | "Limited" | "Full" } : {}),
    ...(row.depthChange != null ? { depthChange: row.depthChange as "up" | "down" } : {}),
    stats: JSON.parse(row.stats) as Record<string, number>,
```

- [ ] **Step 3: Add `depthChange` to seed.ts INSERT**

In `src/db/seed.ts`, update the INSERT statement columns and values to include `depthChange`:

```typescript
  const insertPlayer = db.prepare(`
    INSERT OR REPLACE INTO players (
      id, name, team, position, positionGroup, depthOrder, jerseyNumber,
      height, weight, age, college, experience, injuryStatus, injuryDetail,
      injuryDate, estimatedReturn, irDesignation, practiceStatus, depthChange,
      stats, source, sourceUrl, updatedAt
    ) VALUES (
      @id, @name, @team, @position, @positionGroup, @depthOrder, @jerseyNumber,
      @height, @weight, @age, @college, @experience, @injuryStatus, @injuryDetail,
      @injuryDate, @estimatedReturn, @irDesignation, @practiceStatus, @depthChange,
      @stats, @source, @sourceUrl, @updatedAt
    )
  `);
```

And in the `seedPlayers` transaction, add the mapping:

```typescript
        practiceStatus: player.practiceStatus ?? null,
        depthChange: player.depthChange ?? null,
        stats: JSON.stringify(player.stats),
```

- [ ] **Step 4: Add `depthChange` to orchestrator.ts INSERT**

In `src/scraper/orchestrator.ts`, update the INSERT statement columns and values to include `depthChange`:

```typescript
  const insertPlayer = db.prepare(`
    INSERT OR REPLACE INTO players
      (id, name, team, position, positionGroup, depthOrder, jerseyNumber,
       height, weight, age, college, experience, injuryStatus, injuryDetail,
       injuryDate, estimatedReturn, irDesignation, practiceStatus, depthChange,
       stats, source, sourceUrl, updatedAt)
    VALUES
      (@id, @name, @team, @position, @positionGroup, @depthOrder, @jerseyNumber,
       @height, @weight, @age, @college, @experience, @injuryStatus, @injuryDetail,
       @injuryDate, @estimatedReturn, @irDesignation, @practiceStatus, @depthChange,
       @stats, @source, @sourceUrl, @updatedAt)
  `);
```

And in the player insert call:

```typescript
          insertPlayer.run({
            ...player,
            injuryDetail: player.injuryDetail ?? null,
            injuryDate: player.injuryDate ?? null,
            estimatedReturn: player.estimatedReturn ?? null,
            irDesignation: player.irDesignation ?? null,
            practiceStatus: player.practiceStatus ?? null,
            depthChange: player.depthChange ?? null,
            stats: JSON.stringify(player.stats ?? {}),
            source: item.source,
            sourceUrl: item.sourceUrl,
            updatedAt: item.fetchedAt,
          });
```

- [ ] **Step 5: Add demo `depthChange` values to mock data**

In `src/data/players.ts`, add `depthChange` to a few notable showcase-team players. Find and update these lines:

For KC Xavier Worthy (WR1 depth 2 — recently promoted to start while Rice is suspended):
```typescript
  { id: pid("KC", "WR1", 2), ..., injuryStatus: "Active", depthChange: "up", stats: ... },
```

For PHI Kenny Gainwell (RB depth 2 — promoted due to starter's workload):
Find the PHI RB depth 2 player and add `depthChange: "up"`.

For SF Jordan Mason (RB depth 2 — promoted while McCaffrey is on IR):
Find the SF RB depth 2 player and add `depthChange: "up"`.

- [ ] **Step 6: Run tests**

Run: `npx jest --passWithNoTests 2>&1 | tail -5`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/db/schema.ts src/db/seed.ts src/scraper/orchestrator.ts src/services/liveRosterService.ts src/data/players.ts
git commit -m "feat: add depthChange plumbing through DB and services"
```

---

### Task 5: Bye Week Tag on TeamCard

**Files:**
- Modify: `src/components/TeamCard.tsx`

- [ ] **Step 1: Add `byeWeek` display**

The `TeamCard` component receives a `Team` via props, which now has `byeWeek`. Add the bye week label next to the record. Replace the record div:

```typescript
        <div className="font-mono text-[11px] text-text-muted">
          {team.record}
        </div>
```

with:

```typescript
        <div className="flex items-center gap-2 font-mono text-[11px] text-text-muted">
          <span>{team.record}</span>
          <span className="text-text-muted/60">BYE {team.byeWeek}</span>
        </div>
```

- [ ] **Step 2: Verify in browser**

Run: dev server should be running at `http://localhost:5173`
Check: Home page team cards now show record + bye week (e.g., "15-2 BYE 6")

- [ ] **Step 3: Commit**

```bash
git add src/components/TeamCard.tsx
git commit -m "feat: add bye week label to team cards"
```

---

### Task 6: Trending Arrow + Stat Line on DepthChartRow

**Files:**
- Modify: `src/components/DepthChartRow.tsx`
- Modify: `src/components/DepthChartGrid.tsx`

- [ ] **Step 1: Add stats column header to DepthChartGrid**

In `src/components/DepthChartGrid.tsx`, add a new `<th>` after the "3rd" column header:

```typescript
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
              <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                Stats
              </th>
            </tr>
```

- [ ] **Step 2: Add trending arrow to PlayerCell**

In `src/components/DepthChartRow.tsx`, add the `getStatLine` import at the top:

```typescript
import { getStatLine } from "@/utils/statLine";
```

In the `PlayerCell` component, add a trending arrow after the player name, before the StatusBadge:

```typescript
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
          isOut ? "text-text-muted line-through" : "text-text-primary"
        }`}
      >
        <span className="font-mono text-[11px] text-text-muted">
          #{player.jerseyNumber}
        </span>{" "}
        {player.name}
      </Link>
      {player.depthChange === "up" && (
        <span className="text-[10px] text-status-green">▲</span>
      )}
      {player.depthChange === "down" && (
        <span className="text-[10px] text-status-red">▼</span>
      )}
      <StatusBadge status={player.injuryStatus} showOnlyIfNotActive />
      {showDetail && player.injuryDetail && (
        <span className="text-[10px] text-text-muted">
          {player.injuryDetail}
        </span>
      )}
      {showDetail && player.estimatedReturn && (
        <span className="text-[10px] font-medium text-status-blue">
          ETA: {player.estimatedReturn}
        </span>
      )}
      {showDetail && player.practiceStatus && player.injuryStatus !== "Active" && (
        <span className={`text-[10px] font-medium ${
          player.practiceStatus === "Full" ? "text-status-green" :
          player.practiceStatus === "Limited" ? "text-status-amber" :
          "text-status-red"
        }`}>
          {player.practiceStatus}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Add stat line column to DepthChartRow**

In the `DepthChartRow` component's return, add a new `<td>` after the third player cell:

```typescript
      <td className="px-3 py-2">
        {third && <PlayerCell player={third} />}
      </td>
      <td className="px-3 py-2 text-right">
        {starter && (
          <span className="font-mono text-[11px] text-text-muted">
            {getStatLine(starter)}
          </span>
        )}
      </td>
```

- [ ] **Step 4: Verify in browser**

Check: `/team/KC` — should see stats column with "4,183 yds / 30 TD" for Mahomes, green ▲ next to Xavier Worthy

- [ ] **Step 5: Run all tests**

Run: `npx jest --passWithNoTests 2>&1 | tail -5`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/DepthChartRow.tsx src/components/DepthChartGrid.tsx
git commit -m "feat: add trending arrows and stat line column to depth chart"
```

---

### Task 7: Availability Summary on Team Page

**Files:**
- Modify: `src/app/team/[teamId]/page.tsx`

- [ ] **Step 1: Add availability summary computation and display**

In `src/app/team/[teamId]/page.tsx`, after destructuring `{ team, depthChart, news }`, compute the starter injury counts:

```typescript
  const { team, depthChart, news } = roster;

  // Count injured starters for availability summary
  const starterInjuries = depthChart
    .flatMap((e) => e.players)
    .filter((p) => p.depthOrder === 1 && p.injuryStatus !== "Active");

  const injuryCounts: Record<string, { count: number; color: string }> = {};
  for (const p of starterInjuries) {
    const status = p.injuryStatus;
    if (!injuryCounts[status]) {
      const color = status === "Questionable" || status === "Doubtful" || status === "Holdout"
        ? "text-status-amber"
        : "text-status-red";
      injuryCounts[status] = { count: 0, color };
    }
    injuryCounts[status].count++;
  }
```

Then add the summary display in the team header, after the record/division line. Insert it right after the closing `</div>` of the info line and before the closing `</div>` of the flex container:

```typescript
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {team.fullName}
              </h1>
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <span>
                  {team.conference} {team.division}
                </span>
                <span className="text-text-muted">&middot;</span>
                <span>{team.record}</span>
                <span className="text-text-muted">&middot;</span>
                <span className="font-mono text-xs text-text-muted">
                  Updated {formatLastUpdated(team.lastUpdated)}
                </span>
              </div>
              {starterInjuries.length > 0 && (
                <div className="mt-1 flex items-center gap-2 text-[11px]">
                  {Object.entries(injuryCounts).map(([status, { count, color }]) => (
                    <span key={status} className={color}>
                      {count} {status}
                    </span>
                  ))}
                </div>
              )}
            </div>
```

- [ ] **Step 2: Verify in browser**

Check: `/team/KC` — should see something like "2 Questionable · 1 Out · 1 IR · 1 Suspended" below the record line

- [ ] **Step 3: Commit**

```bash
git add src/app/team/\\[teamId\\]/page.tsx
git commit -m "feat: add starter availability summary to team page header"
```

---

### Task 8: Division Standings Snippet on Team Page

**Files:**
- Modify: `src/app/team/[teamId]/page.tsx`

- [ ] **Step 1: Add division standings computation**

In `src/app/team/[teamId]/page.tsx`, after the `injuryCounts` computation, add:

```typescript
  // Division standings
  const allTeams = service.getAllTeams();
  const divisionTeams = allTeams
    .filter((t) => t.conference === team.conference && t.division === team.division)
    .sort((a, b) => {
      const parseWinPct = (record: string) => {
        const [w, l] = record.split("-").map(Number);
        return w / (w + l);
      };
      return parseWinPct(b.record) - parseWinPct(a.record);
    });
```

- [ ] **Step 2: Add standings display below team header**

Insert the standings snippet between the team header `</div>` and `<DepthChartGrid>`:

```typescript
        {/* Division Standings */}
        <div className="mb-6 flex items-center gap-3 text-[11px]">
          <span className="font-semibold uppercase tracking-wider text-text-muted">
            {team.conference} {team.division}
          </span>
          {divisionTeams.map((t, i) => (
            <span key={t.id} className="flex items-center gap-1">
              {i > 0 && <span className="text-text-muted/40 mr-1">·</span>}
              <span className={t.id === team.id ? "font-bold text-text-primary" : "text-text-secondary"}>
                {t.id}
              </span>
              <span className="font-mono text-text-muted">{t.record}</span>
            </span>
          ))}
        </div>
```

- [ ] **Step 3: Verify in browser**

Check: `/team/KC` — should see "AFC West KC 15-2 · LAC 11-6 · DEN 10-7 · LV 4-13" with KC bolded

- [ ] **Step 4: Run all tests**

Run: `npx jest --passWithNoTests 2>&1 | tail -5`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/team/\\[teamId\\]/page.tsx
git commit -m "feat: add division standings snippet to team page"
```

---

### Task 9: Re-seed Database and Final Verification

**Files:**
- No code changes — operational step

- [ ] **Step 1: Delete old DB and re-seed**

```bash
rm data/rosterpulse.db && npx tsx src/scraper/cli.ts
```

Expected: Seeds 2592+ players with new `depthChange` and `byeWeek` data, fetches from adapters.

- [ ] **Step 2: Run full test suite**

Run: `npx jest --passWithNoTests 2>&1 | tail -5`
Expected: PASS (all tests including new statLine tests)

- [ ] **Step 3: Verify all features in browser**

Check the following at `http://localhost:5173`:
1. Home page: Team cards show bye week (e.g., "15-2 BYE 6")
2. `/team/KC`: Division standings row below header
3. `/team/KC`: Availability summary (Questionable, Out, IR, Suspended counts)
4. `/team/KC`: Stats column with position-appropriate stats
5. `/team/KC`: Green ▲ next to Xavier Worthy
6. `/player/SF-RB-1`: Full injury detail card (unchanged, still working)

- [ ] **Step 4: Commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: post-integration adjustments for roster enhancements"
```
