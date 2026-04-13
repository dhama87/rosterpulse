# RosterPulse Data Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace static mock data with a real-time scraping pipeline that fetches from free RSS feeds and ESPN's public API every 2 hours, stores in SQLite, and serves through the existing RosterService interface with mock data as fallback.

**Architecture:** Source adapters fetch from 4 free sources in parallel, normalize into existing types, deduplicate, and upsert into a SQLite database. A new service factory checks DB freshness and transparently switches between live and mock data. Pages change one import line each.

**Tech Stack:** better-sqlite3 (SQLite), fast-xml-parser (RSS), Node.js native fetch, Jest for testing

---

## File Structure

```
src/
  scraper/
    types.ts                — ScrapedItem, AdapterResult, SourceAdapter interfaces
    normalize.ts            — ScrapedItem → Player/NewsItem conversion
    dedup.ts                — Headline hashing + duplicate detection
    orchestrator.ts         — Runs all adapters, normalizes, deduplicates, writes DB
    cli.ts                  — npm run scrape entry point
    adapters/
      espn-rss.ts           — ESPN NFL RSS feed adapter
      nfl-transactions.ts   — NFL.com transaction wire RSS adapter
      espn-roster.ts        — ESPN public API roster adapter
      rotoworld-rss.ts      — Rotoworld/NBC RSS adapter
    __tests__/
      normalize.test.ts
      dedup.test.ts
      orchestrator.test.ts
      adapters/
        espn-rss.test.ts
        nfl-transactions.test.ts
        espn-roster.test.ts
        rotoworld-rss.test.ts
  db/
    schema.ts               — Table creation SQL statements
    client.ts               — better-sqlite3 connection + query helpers
    seed.ts                 — Populate DB from existing mock data
    __tests__/
      client.test.ts
      schema.test.ts
  services/
    rosterService.ts        — existing (unchanged)
    liveRosterService.ts    — reads from SQLite, implements RosterService
    createRosterService.ts  — factory: picks live vs mock
    __tests__/
      rosterService.test.ts — existing (unchanged)
      liveRosterService.test.ts
      createRosterService.test.ts
  types/
    index.ts                — add confidence field to NewsItem
  components/
    NewsCard.tsx            — add source attribution display
  app/
    page.tsx                — change import to createRosterService
    team/[teamId]/page.tsx  — change import to createRosterService
    player/[playerId]/page.tsx — change import to createRosterService
    search/page.tsx         — change import to createRosterService
    api/scrape/route.ts     — API route for production cron
data/
  rosterpulse.db            — SQLite database (gitignored)
```

---

### Task 1: Install Dependencies and Project Setup

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Install better-sqlite3 and fast-xml-parser**

```bash
cd /Users/davidhamamura/Documents/claude/med
npm install better-sqlite3 fast-xml-parser
npm install --save-dev @types/better-sqlite3
```

- [ ] **Step 2: Add scrape script to package.json**

In `package.json`, add to the `"scripts"` section:

```json
"scrape": "npx tsx src/scraper/cli.ts"
```

The full scripts section should be:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "jest",
  "test:watch": "jest --watch",
  "scrape": "npx tsx src/scraper/cli.ts"
}
```

- [ ] **Step 3: Add rosterpulse.db to .gitignore**

Add this line to `.gitignore`:

```
# data pipeline
/data/
```

- [ ] **Step 4: Create the data directory**

```bash
mkdir -p /Users/davidhamamura/Documents/claude/med/data
```

- [ ] **Step 5: Verify installation**

```bash
cd /Users/davidhamamura/Documents/claude/med
node -e "require('better-sqlite3'); require('fast-xml-parser'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "chore: add better-sqlite3, fast-xml-parser dependencies and scrape script"
```

---

### Task 2: Scraper Types

**Files:**
- Create: `src/scraper/types.ts`
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add confidence field to NewsItem type**

In `src/types/index.ts`, add `confidence` as an optional field to the `NewsItem` interface:

```typescript
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
```

- [ ] **Step 2: Create scraper types file**

Create `src/scraper/types.ts`:

```typescript
export interface ScrapedItem {
  type: "player" | "news";
  sourceAdapter: string;
  source: string;
  sourceUrl: string;
  confidence: "reported" | "official";
  rawData: Record<string, unknown>;
  fetchedAt: string;
}

export interface AdapterResult {
  adapter: string;
  status: "success" | "error";
  items: ScrapedItem[];
  itemsFound: number;
  errorMessage?: string;
  startedAt: string;
  completedAt: string;
}

export interface SourceAdapter {
  name: string;
  fetch(): Promise<ScrapedItem[]>;
}
```

- [ ] **Step 3: Verify types compile**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx tsc --noEmit src/scraper/types.ts 2>&1 | head -20
```

Expected: No errors (or only unrelated Next.js type issues)

- [ ] **Step 4: Run existing tests to confirm no regressions**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest --passWithNoTests 2>&1 | tail -10
```

Expected: All existing tests pass

- [ ] **Step 5: Commit**

```bash
git add src/scraper/types.ts src/types/index.ts
git commit -m "feat: add scraper types and confidence field to NewsItem"
```

---

### Task 3: SQLite Database Schema and Client

**Files:**
- Create: `src/db/schema.ts`
- Create: `src/db/client.ts`
- Create: `src/db/__tests__/schema.test.ts`
- Create: `src/db/__tests__/client.test.ts`

- [ ] **Step 1: Write failing test for schema**

Create `src/db/__tests__/schema.test.ts`:

```typescript
import { createTables, TABLE_NAMES } from "../schema";
import Database from "better-sqlite3";

describe("schema", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(":memory:");
  });

  afterEach(() => {
    db.close();
  });

  it("creates all required tables", () => {
    createTables(db);

    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as { name: string }[];

    const tableNames = tables.map((t) => t.name);
    expect(tableNames).toContain("players");
    expect(tableNames).toContain("news");
    expect(tableNames).toContain("scrape_log");
  });

  it("exports correct table names", () => {
    expect(TABLE_NAMES).toEqual({
      players: "players",
      news: "news",
      scrapeLog: "scrape_log",
    });
  });

  it("is idempotent (can run twice without error)", () => {
    createTables(db);
    expect(() => createTables(db)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest src/db/__tests__/schema.test.ts --no-cache 2>&1 | tail -10
```

Expected: FAIL — cannot find module `../schema`

- [ ] **Step 3: Implement schema**

Create `src/db/schema.ts`:

```typescript
import Database from "better-sqlite3";

export const TABLE_NAMES = {
  players: "players",
  news: "news",
  scrapeLog: "scrape_log",
} as const;

export function createTables(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.players} (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      team TEXT NOT NULL,
      position TEXT NOT NULL,
      positionGroup TEXT NOT NULL,
      depthOrder INTEGER NOT NULL,
      jerseyNumber INTEGER NOT NULL,
      height TEXT NOT NULL,
      weight TEXT NOT NULL,
      age INTEGER NOT NULL,
      college TEXT NOT NULL,
      experience INTEGER NOT NULL,
      injuryStatus TEXT NOT NULL DEFAULT 'Active',
      injuryDetail TEXT,
      stats TEXT NOT NULL DEFAULT '{}',
      source TEXT,
      sourceUrl TEXT,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.news} (
      id TEXT PRIMARY KEY,
      dedupKey TEXT UNIQUE,
      playerId TEXT,
      playerName TEXT NOT NULL,
      team TEXT NOT NULL,
      position TEXT NOT NULL,
      category TEXT NOT NULL,
      headline TEXT NOT NULL,
      description TEXT NOT NULL,
      source TEXT,
      sourceUrl TEXT,
      confidence TEXT NOT NULL DEFAULT 'reported',
      timestamp TEXT NOT NULL,
      fetchedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.scrapeLog} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      adapter TEXT NOT NULL,
      status TEXT NOT NULL,
      itemsFound INTEGER NOT NULL DEFAULT 0,
      itemsNew INTEGER NOT NULL DEFAULT 0,
      itemsUpdated INTEGER NOT NULL DEFAULT 0,
      errorMessage TEXT,
      startedAt TEXT NOT NULL,
      completedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_players_team ON ${TABLE_NAMES.players}(team);
    CREATE INDEX IF NOT EXISTS idx_news_team ON ${TABLE_NAMES.news}(team);
    CREATE INDEX IF NOT EXISTS idx_news_playerId ON ${TABLE_NAMES.news}(playerId);
    CREATE INDEX IF NOT EXISTS idx_news_timestamp ON ${TABLE_NAMES.news}(timestamp);
    CREATE INDEX IF NOT EXISTS idx_scrape_log_adapter ON ${TABLE_NAMES.scrapeLog}(adapter);
  `);
}
```

- [ ] **Step 4: Run schema test to verify it passes**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest src/db/__tests__/schema.test.ts --no-cache 2>&1 | tail -10
```

Expected: PASS — 3 tests passing

- [ ] **Step 5: Write failing test for client**

Create `src/db/__tests__/client.test.ts`:

```typescript
import { getDb, closeDb, DB_PATH } from "../client";
import fs from "fs";
import path from "path";

describe("client", () => {
  const testDbPath = path.join(__dirname, "test-rosterpulse.db");

  afterEach(() => {
    closeDb();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  it("creates a database connection with tables", () => {
    const db = getDb(testDbPath);
    expect(db).toBeDefined();

    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as { name: string }[];

    const tableNames = tables.map((t) => t.name);
    expect(tableNames).toContain("players");
    expect(tableNames).toContain("news");
    expect(tableNames).toContain("scrape_log");
  });

  it("returns the same instance on repeated calls", () => {
    const db1 = getDb(testDbPath);
    const db2 = getDb(testDbPath);
    expect(db1).toBe(db2);
  });

  it("exports the default DB_PATH", () => {
    expect(DB_PATH).toContain("rosterpulse.db");
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest src/db/__tests__/client.test.ts --no-cache 2>&1 | tail -10
```

Expected: FAIL — cannot find module `../client`

- [ ] **Step 7: Implement client**

Create `src/db/client.ts`:

```typescript
import Database from "better-sqlite3";
import path from "path";
import { createTables } from "./schema";

export const DB_PATH = path.join(
  process.cwd(),
  "data",
  "rosterpulse.db"
);

let instance: Database.Database | null = null;

export function getDb(dbPath: string = DB_PATH): Database.Database {
  if (instance) return instance;

  instance = new Database(dbPath);
  instance.pragma("journal_mode = WAL");
  instance.pragma("foreign_keys = ON");
  createTables(instance);

  return instance;
}

export function closeDb(): void {
  if (instance) {
    instance.close();
    instance = null;
  }
}
```

- [ ] **Step 8: Run client test to verify it passes**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest src/db/__tests__/client.test.ts --no-cache 2>&1 | tail -10
```

Expected: PASS — 3 tests passing

- [ ] **Step 9: Run all tests**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest --no-cache 2>&1 | tail -10
```

Expected: All tests pass

- [ ] **Step 10: Commit**

```bash
git add src/db/
git commit -m "feat: add SQLite schema and database client"
```

---

### Task 4: Database Seed from Mock Data

**Files:**
- Create: `src/db/seed.ts`
- Create: `src/db/__tests__/seed.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/db/__tests__/seed.test.ts`:

```typescript
import Database from "better-sqlite3";
import { createTables } from "../schema";
import { seedFromMock } from "../seed";

describe("seed", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(":memory:");
    createTables(db);
  });

  afterEach(() => {
    db.close();
  });

  it("seeds players from mock data", () => {
    const result = seedFromMock(db);

    const count = db
      .prepare("SELECT COUNT(*) as count FROM players")
      .get() as { count: number };

    expect(count.count).toBeGreaterThan(0);
    expect(result.playersSeeded).toBe(count.count);
  });

  it("seeds news from mock data", () => {
    const result = seedFromMock(db);

    const count = db
      .prepare("SELECT COUNT(*) as count FROM news")
      .get() as { count: number };

    expect(count.count).toBeGreaterThan(0);
    expect(result.newsSeeded).toBe(count.count);
  });

  it("seeds all 32 teams worth of players", () => {
    seedFromMock(db);

    const teams = db
      .prepare("SELECT DISTINCT team FROM players")
      .all() as { team: string }[];

    expect(teams.length).toBe(32);
  });

  it("is idempotent (upserts, does not duplicate)", () => {
    seedFromMock(db);
    seedFromMock(db);

    const firstCount = db
      .prepare("SELECT COUNT(*) as count FROM players")
      .get() as { count: number };

    seedFromMock(db);

    const secondCount = db
      .prepare("SELECT COUNT(*) as count FROM players")
      .get() as { count: number };

    expect(firstCount.count).toBe(secondCount.count);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest src/db/__tests__/seed.test.ts --no-cache 2>&1 | tail -10
```

Expected: FAIL — cannot find module `../seed`

- [ ] **Step 3: Implement seed**

Create `src/db/seed.ts`:

```typescript
import Database from "better-sqlite3";
import { players } from "@/data/players";
import { newsItems } from "@/data/news";
import { createHash } from "crypto";

interface SeedResult {
  playersSeeded: number;
  newsSeeded: number;
}

function makeDedupKey(source: string, headline: string): string {
  const normalized = `${source}:${headline}`.toLowerCase().trim();
  return createHash("sha256").update(normalized).digest("hex").slice(0, 16);
}

export function seedFromMock(db: Database.Database): SeedResult {
  const now = new Date().toISOString();

  const insertPlayer = db.prepare(`
    INSERT OR REPLACE INTO players
    (id, name, team, position, positionGroup, depthOrder, jerseyNumber,
     height, weight, age, college, experience, injuryStatus, injuryDetail,
     stats, source, sourceUrl, updatedAt)
    VALUES
    (@id, @name, @team, @position, @positionGroup, @depthOrder, @jerseyNumber,
     @height, @weight, @age, @college, @experience, @injuryStatus, @injuryDetail,
     @stats, @source, @sourceUrl, @updatedAt)
  `);

  const insertNews = db.prepare(`
    INSERT OR REPLACE INTO news
    (id, dedupKey, playerId, playerName, team, position, category,
     headline, description, source, sourceUrl, confidence, timestamp, fetchedAt)
    VALUES
    (@id, @dedupKey, @playerId, @playerName, @team, @position, @category,
     @headline, @description, @source, @sourceUrl, @confidence, @timestamp, @fetchedAt)
  `);

  const seedPlayers = db.transaction(() => {
    for (const p of players) {
      insertPlayer.run({
        id: p.id,
        name: p.name,
        team: p.team,
        position: p.position,
        positionGroup: p.positionGroup,
        depthOrder: p.depthOrder,
        jerseyNumber: p.jerseyNumber,
        height: p.height,
        weight: p.weight,
        age: p.age,
        college: p.college,
        experience: p.experience,
        injuryStatus: p.injuryStatus,
        injuryDetail: p.injuryDetail || null,
        stats: JSON.stringify(p.stats),
        source: "mock",
        sourceUrl: null,
        updatedAt: now,
      });
    }
  });

  const seedNews = db.transaction(() => {
    for (const n of newsItems) {
      insertNews.run({
        id: n.id,
        dedupKey: makeDedupKey(n.source || "mock", n.headline),
        playerId: n.playerId,
        playerName: n.playerName,
        team: n.team,
        position: n.position,
        category: n.category,
        headline: n.headline,
        description: n.description,
        source: n.source || "mock",
        sourceUrl: n.sourceUrl || null,
        confidence: "official",
        timestamp: n.timestamp,
        fetchedAt: now,
      });
    }
  });

  seedPlayers();
  seedNews();

  return {
    playersSeeded: players.length,
    newsSeeded: newsItems.length,
  };
}
```

- [ ] **Step 4: Run seed test to verify it passes**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest src/db/__tests__/seed.test.ts --no-cache 2>&1 | tail -10
```

Expected: PASS — 4 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/db/seed.ts src/db/__tests__/seed.test.ts
git commit -m "feat: add database seed from mock data"
```

---

### Task 5: Deduplication Logic

**Files:**
- Create: `src/scraper/dedup.ts`
- Create: `src/scraper/__tests__/dedup.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/scraper/__tests__/dedup.test.ts`:

```typescript
import { makeDedupKey, isDuplicate, shouldUpgradeConfidence } from "../dedup";

describe("dedup", () => {
  describe("makeDedupKey", () => {
    it("produces consistent hash for same input", () => {
      const key1 = makeDedupKey("ESPN", "Player X traded to Team Y");
      const key2 = makeDedupKey("ESPN", "Player X traded to Team Y");
      expect(key1).toBe(key2);
    });

    it("is case-insensitive", () => {
      const key1 = makeDedupKey("ESPN", "Player Traded");
      const key2 = makeDedupKey("espn", "player traded");
      expect(key1).toBe(key2);
    });

    it("produces different keys for different content", () => {
      const key1 = makeDedupKey("ESPN", "Player X traded");
      const key2 = makeDedupKey("ESPN", "Player Y traded");
      expect(key1).not.toBe(key2);
    });

    it("returns a 16-character hex string", () => {
      const key = makeDedupKey("ESPN", "Some headline");
      expect(key).toMatch(/^[a-f0-9]{16}$/);
    });
  });

  describe("isDuplicate", () => {
    it("returns true for matching dedupKey", () => {
      const existingKeys = new Set(["abc123def456abcd"]);
      expect(isDuplicate("abc123def456abcd", existingKeys)).toBe(true);
    });

    it("returns false for new dedupKey", () => {
      const existingKeys = new Set(["abc123def456abcd"]);
      expect(isDuplicate("9999999999999999", existingKeys)).toBe(false);
    });
  });

  describe("shouldUpgradeConfidence", () => {
    it("returns true when existing is reported and new is official", () => {
      expect(shouldUpgradeConfidence("reported", "official")).toBe(true);
    });

    it("returns false when existing is already official", () => {
      expect(shouldUpgradeConfidence("official", "official")).toBe(false);
    });

    it("returns false when new is reported", () => {
      expect(shouldUpgradeConfidence("reported", "reported")).toBe(false);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest src/scraper/__tests__/dedup.test.ts --no-cache 2>&1 | tail -10
```

Expected: FAIL — cannot find module `../dedup`

- [ ] **Step 3: Implement dedup**

Create `src/scraper/dedup.ts`:

```typescript
import { createHash } from "crypto";

export function makeDedupKey(source: string, headline: string): string {
  const normalized = `${source}:${headline}`.toLowerCase().trim();
  return createHash("sha256").update(normalized).digest("hex").slice(0, 16);
}

export function isDuplicate(
  dedupKey: string,
  existingKeys: Set<string>
): boolean {
  return existingKeys.has(dedupKey);
}

export function shouldUpgradeConfidence(
  existingConfidence: string,
  newConfidence: string
): boolean {
  return existingConfidence === "reported" && newConfidence === "official";
}
```

- [ ] **Step 4: Run dedup test to verify it passes**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest src/scraper/__tests__/dedup.test.ts --no-cache 2>&1 | tail -10
```

Expected: PASS — 7 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/scraper/dedup.ts src/scraper/__tests__/dedup.test.ts
git commit -m "feat: add news deduplication logic with confidence upgrade"
```

---

### Task 6: Normalizer (ScrapedItem → Player/NewsItem)

**Files:**
- Create: `src/scraper/normalize.ts`
- Create: `src/scraper/__tests__/normalize.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/scraper/__tests__/normalize.test.ts`:

```typescript
import { normalizeToPlayer, normalizeToNewsItem } from "../normalize";
import { ScrapedItem } from "../types";

describe("normalize", () => {
  describe("normalizeToPlayer", () => {
    it("converts a player ScrapedItem to a Player", () => {
      const item: ScrapedItem = {
        type: "player",
        sourceAdapter: "espn-roster",
        source: "ESPN",
        sourceUrl: "https://espn.com/team/roster",
        confidence: "official",
        fetchedAt: "2026-04-13T12:00:00.000Z",
        rawData: {
          id: "KC-QB-1",
          name: "Patrick Mahomes",
          team: "KC",
          position: "QB",
          positionGroup: "offense",
          depthOrder: 1,
          jerseyNumber: 15,
          height: "6-2",
          weight: "225",
          age: 30,
          college: "Texas Tech",
          experience: 8,
          injuryStatus: "Active",
        },
      };

      const player = normalizeToPlayer(item);
      expect(player).toEqual({
        id: "KC-QB-1",
        name: "Patrick Mahomes",
        team: "KC",
        position: "QB",
        positionGroup: "offense",
        depthOrder: 1,
        jerseyNumber: 15,
        height: "6-2",
        weight: "225",
        age: 30,
        college: "Texas Tech",
        experience: 8,
        injuryStatus: "Active",
        injuryDetail: undefined,
        stats: {},
      });
    });

    it("includes injuryDetail and stats when present", () => {
      const item: ScrapedItem = {
        type: "player",
        sourceAdapter: "espn-roster",
        source: "ESPN",
        sourceUrl: "https://espn.com",
        confidence: "official",
        fetchedAt: "2026-04-13T12:00:00.000Z",
        rawData: {
          id: "KC-QB-1",
          name: "Patrick Mahomes",
          team: "KC",
          position: "QB",
          positionGroup: "offense",
          depthOrder: 1,
          jerseyNumber: 15,
          height: "6-2",
          weight: "225",
          age: 30,
          college: "Texas Tech",
          experience: 8,
          injuryStatus: "Questionable",
          injuryDetail: "Ankle",
          stats: { passingYards: 5000 },
        },
      };

      const player = normalizeToPlayer(item);
      expect(player.injuryDetail).toBe("Ankle");
      expect(player.stats).toEqual({ passingYards: 5000 });
    });
  });

  describe("normalizeToNewsItem", () => {
    it("converts a news ScrapedItem to a NewsItem", () => {
      const item: ScrapedItem = {
        type: "news",
        sourceAdapter: "espn-rss",
        source: "ESPN",
        sourceUrl: "https://espn.com/article/123",
        confidence: "reported",
        fetchedAt: "2026-04-13T12:00:00.000Z",
        rawData: {
          playerId: "KC-CB2-1",
          playerName: "Jaylen Watson",
          team: "KC",
          position: "CB2",
          category: "INJURY",
          headline: "Watson tears ACL",
          description: "Chiefs CB Watson suffered a torn ACL.",
          timestamp: "2026-04-13T10:00:00.000Z",
        },
      };

      const news = normalizeToNewsItem(item);
      expect(news).toEqual({
        id: expect.any(String),
        playerId: "KC-CB2-1",
        playerName: "Jaylen Watson",
        team: "KC",
        position: "CB2",
        category: "INJURY",
        headline: "Watson tears ACL",
        description: "Chiefs CB Watson suffered a torn ACL.",
        source: "ESPN",
        sourceUrl: "https://espn.com/article/123",
        confidence: "reported",
        timestamp: "2026-04-13T10:00:00.000Z",
      });
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest src/scraper/__tests__/normalize.test.ts --no-cache 2>&1 | tail -10
```

Expected: FAIL — cannot find module `../normalize`

- [ ] **Step 3: Implement normalizer**

Create `src/scraper/normalize.ts`:

```typescript
import { Player, NewsItem, PositionGroup, InjuryStatus, NewsCategory } from "@/types";
import { ScrapedItem } from "./types";
import { randomUUID } from "crypto";

export function normalizeToPlayer(item: ScrapedItem): Player {
  const d = item.rawData;
  return {
    id: d.id as string,
    name: d.name as string,
    team: d.team as string,
    position: d.position as string,
    positionGroup: d.positionGroup as PositionGroup,
    depthOrder: d.depthOrder as number,
    jerseyNumber: d.jerseyNumber as number,
    height: d.height as string,
    weight: d.weight as string,
    age: d.age as number,
    college: d.college as string,
    experience: d.experience as number,
    injuryStatus: (d.injuryStatus as InjuryStatus) || "Active",
    injuryDetail: d.injuryDetail as string | undefined,
    stats: (d.stats as Record<string, number>) || {},
  };
}

export function normalizeToNewsItem(item: ScrapedItem): NewsItem {
  const d = item.rawData;
  return {
    id: (d.id as string) || randomUUID(),
    playerId: d.playerId as string,
    playerName: d.playerName as string,
    team: d.team as string,
    position: d.position as string,
    category: d.category as NewsCategory,
    headline: d.headline as string,
    description: d.description as string,
    source: item.source,
    sourceUrl: item.sourceUrl,
    confidence: item.confidence,
    timestamp: d.timestamp as string,
  };
}
```

- [ ] **Step 4: Run normalize test to verify it passes**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest src/scraper/__tests__/normalize.test.ts --no-cache 2>&1 | tail -10
```

Expected: PASS — 3 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/scraper/normalize.ts src/scraper/__tests__/normalize.test.ts
git commit -m "feat: add ScrapedItem normalizer for Player and NewsItem"
```

---

### Task 7: ESPN RSS Adapter

**Files:**
- Create: `src/scraper/adapters/espn-rss.ts`
- Create: `src/scraper/__tests__/adapters/espn-rss.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/scraper/__tests__/adapters/espn-rss.test.ts`:

```typescript
import { EspnRssAdapter } from "../../adapters/espn-rss";

// Sample ESPN RSS XML response
const SAMPLE_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>ESPN - NFL News</title>
    <item>
      <title>Chiefs trade WR to Packers in blockbuster deal</title>
      <description>Kansas City traded wide receiver in a surprising move that reshapes both rosters.</description>
      <link>https://espn.com/nfl/story/12345</link>
      <pubDate>Sun, 13 Apr 2026 12:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Eagles QB hurts shoulder in practice</title>
      <description>Philadelphia quarterback left practice early with a shoulder issue.</description>
      <link>https://espn.com/nfl/story/12346</link>
      <pubDate>Sun, 13 Apr 2026 11:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

describe("EspnRssAdapter", () => {
  let adapter: EspnRssAdapter;
  let mockFetch: jest.SpyInstance;

  beforeEach(() => {
    adapter = new EspnRssAdapter();
    mockFetch = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(SAMPLE_RSS),
    } as Response);
  });

  afterEach(() => {
    mockFetch.mockRestore();
  });

  it("has the correct name", () => {
    expect(adapter.name).toBe("espn-rss");
  });

  it("fetches and parses RSS items", async () => {
    const items = await adapter.fetch();
    expect(items.length).toBe(2);
    expect(items[0].type).toBe("news");
    expect(items[0].sourceAdapter).toBe("espn-rss");
    expect(items[0].source).toBe("ESPN");
    expect(items[0].confidence).toBe("reported");
  });

  it("extracts headline and description into rawData", async () => {
    const items = await adapter.fetch();
    expect(items[0].rawData.headline).toBe(
      "Chiefs trade WR to Packers in blockbuster deal"
    );
    expect(items[0].rawData.description).toContain("Kansas City traded");
    expect(items[0].sourceUrl).toBe("https://espn.com/nfl/story/12345");
  });

  it("returns empty array on fetch error", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Server Error"),
    } as unknown as Response);

    const items = await adapter.fetch();
    expect(items).toEqual([]);
  });

  it("returns empty array on network error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const items = await adapter.fetch();
    expect(items).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest src/scraper/__tests__/adapters/espn-rss.test.ts --no-cache 2>&1 | tail -10
```

Expected: FAIL — cannot find module `../../adapters/espn-rss`

- [ ] **Step 3: Implement ESPN RSS adapter**

Create `src/scraper/adapters/espn-rss.ts`:

```typescript
import { XMLParser } from "fast-xml-parser";
import { ScrapedItem, SourceAdapter } from "../types";

const ESPN_NFL_RSS_URL = "https://www.espn.com/espn/rss/nfl/news";

interface RssItem {
  title?: string;
  description?: string;
  link?: string;
  pubDate?: string;
}

export class EspnRssAdapter implements SourceAdapter {
  name = "espn-rss";

  async fetch(): Promise<ScrapedItem[]> {
    try {
      const response = await fetch(ESPN_NFL_RSS_URL, {
        signal: AbortSignal.timeout(30_000),
      });

      if (!response.ok) {
        console.error(`ESPN RSS returned ${response.status}`);
        return [];
      }

      const xml = await response.text();
      const parser = new XMLParser();
      const parsed = parser.parse(xml);

      const items: RssItem[] = parsed?.rss?.channel?.item || [];
      const itemArray = Array.isArray(items) ? items : [items];

      const now = new Date().toISOString();

      return itemArray
        .filter((item) => item.title)
        .map((item) => ({
          type: "news" as const,
          sourceAdapter: this.name,
          source: "ESPN",
          sourceUrl: item.link || "",
          confidence: "reported" as const,
          fetchedAt: now,
          rawData: {
            headline: item.title || "",
            description: item.description || "",
            timestamp: item.pubDate
              ? new Date(item.pubDate).toISOString()
              : now,
            // These will be enriched by the normalizer or left empty
            playerId: "",
            playerName: "",
            team: "",
            position: "",
            category: "INJURY",
          },
        }));
    } catch (error) {
      console.error("ESPN RSS fetch failed:", error);
      return [];
    }
  }
}
```

- [ ] **Step 4: Run ESPN RSS test to verify it passes**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest src/scraper/__tests__/adapters/espn-rss.test.ts --no-cache 2>&1 | tail -10
```

Expected: PASS — 5 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/scraper/adapters/espn-rss.ts src/scraper/__tests__/adapters/espn-rss.test.ts
git commit -m "feat: add ESPN RSS feed adapter"
```

---

### Task 8: NFL Transactions RSS Adapter

**Files:**
- Create: `src/scraper/adapters/nfl-transactions.ts`
- Create: `src/scraper/__tests__/adapters/nfl-transactions.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/scraper/__tests__/adapters/nfl-transactions.test.ts`:

```typescript
import { NflTransactionsAdapter } from "../../adapters/nfl-transactions";

const SAMPLE_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>NFL.com Transactions</title>
    <item>
      <title>Bills signed LB Ray to the practice squad</title>
      <description>Buffalo Bills signed LB Ray to the practice squad.</description>
      <link>https://nfl.com/transactions/12345</link>
      <pubDate>Sun, 13 Apr 2026 14:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Dolphins placed CB on injured reserve</title>
      <description>Miami Dolphins placed CB on injured reserve with a knee injury.</description>
      <link>https://nfl.com/transactions/12346</link>
      <pubDate>Sun, 13 Apr 2026 13:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

describe("NflTransactionsAdapter", () => {
  let adapter: NflTransactionsAdapter;
  let mockFetch: jest.SpyInstance;

  beforeEach(() => {
    adapter = new NflTransactionsAdapter();
    mockFetch = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(SAMPLE_RSS),
    } as Response);
  });

  afterEach(() => {
    mockFetch.mockRestore();
  });

  it("has the correct name", () => {
    expect(adapter.name).toBe("nfl-transactions");
  });

  it("fetches and parses RSS items with official confidence", async () => {
    const items = await adapter.fetch();
    expect(items.length).toBe(2);
    expect(items[0].source).toBe("NFL.com");
    expect(items[0].confidence).toBe("official");
  });

  it("extracts headline and description into rawData", async () => {
    const items = await adapter.fetch();
    expect(items[0].rawData.headline).toBe(
      "Bills signed LB Ray to the practice squad"
    );
  });

  it("returns empty array on fetch error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));
    const items = await adapter.fetch();
    expect(items).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest src/scraper/__tests__/adapters/nfl-transactions.test.ts --no-cache 2>&1 | tail -10
```

Expected: FAIL — cannot find module

- [ ] **Step 3: Implement NFL Transactions adapter**

Create `src/scraper/adapters/nfl-transactions.ts`:

```typescript
import { XMLParser } from "fast-xml-parser";
import { ScrapedItem, SourceAdapter } from "../types";

const NFL_TRANSACTIONS_RSS_URL =
  "https://www.nfl.com/rss/rsslanding?searchString=transactions";

interface RssItem {
  title?: string;
  description?: string;
  link?: string;
  pubDate?: string;
}

export class NflTransactionsAdapter implements SourceAdapter {
  name = "nfl-transactions";

  async fetch(): Promise<ScrapedItem[]> {
    try {
      const response = await fetch(NFL_TRANSACTIONS_RSS_URL, {
        signal: AbortSignal.timeout(30_000),
      });

      if (!response.ok) {
        console.error(`NFL Transactions RSS returned ${response.status}`);
        return [];
      }

      const xml = await response.text();
      const parser = new XMLParser();
      const parsed = parser.parse(xml);

      const items: RssItem[] = parsed?.rss?.channel?.item || [];
      const itemArray = Array.isArray(items) ? items : [items];

      const now = new Date().toISOString();

      return itemArray
        .filter((item) => item.title)
        .map((item) => ({
          type: "news" as const,
          sourceAdapter: this.name,
          source: "NFL.com",
          sourceUrl: item.link || "",
          confidence: "official" as const,
          fetchedAt: now,
          rawData: {
            headline: item.title || "",
            description: item.description || "",
            timestamp: item.pubDate
              ? new Date(item.pubDate).toISOString()
              : now,
            playerId: "",
            playerName: "",
            team: "",
            position: "",
            category: "SIGNING",
          },
        }));
    } catch (error) {
      console.error("NFL Transactions RSS fetch failed:", error);
      return [];
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest src/scraper/__tests__/adapters/nfl-transactions.test.ts --no-cache 2>&1 | tail -10
```

Expected: PASS — 4 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/scraper/adapters/nfl-transactions.ts src/scraper/__tests__/adapters/nfl-transactions.test.ts
git commit -m "feat: add NFL.com transactions RSS adapter"
```

---

### Task 9: ESPN Roster API Adapter

**Files:**
- Create: `src/scraper/adapters/espn-roster.ts`
- Create: `src/scraper/__tests__/adapters/espn-roster.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/scraper/__tests__/adapters/espn-roster.test.ts`:

```typescript
import { EspnRosterAdapter } from "../../adapters/espn-roster";

// Simplified ESPN API response structure
const SAMPLE_RESPONSE = {
  team: { abbreviation: "KC" },
  athletes: [
    {
      position: "offense",
      items: [
        {
          id: "4241457",
          fullName: "Patrick Mahomes",
          jersey: "15",
          position: { abbreviation: "QB" },
          age: 30,
          weight: 225,
          height: "6' 2\"",
          experience: { years: 8 },
          college: { name: "Texas Tech" },
          injuries: [],
        },
      ],
    },
  ],
};

describe("EspnRosterAdapter", () => {
  let adapter: EspnRosterAdapter;
  let mockFetch: jest.SpyInstance;

  beforeEach(() => {
    adapter = new EspnRosterAdapter(["KC"]);
    mockFetch = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(SAMPLE_RESPONSE),
    } as unknown as Response);
  });

  afterEach(() => {
    mockFetch.mockRestore();
  });

  it("has the correct name", () => {
    expect(adapter.name).toBe("espn-roster");
  });

  it("fetches roster data for specified teams", async () => {
    const items = await adapter.fetch();
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].type).toBe("player");
    expect(items[0].source).toBe("ESPN");
    expect(items[0].confidence).toBe("official");
  });

  it("extracts player data into rawData", async () => {
    const items = await adapter.fetch();
    expect(items[0].rawData.name).toBe("Patrick Mahomes");
    expect(items[0].rawData.team).toBe("KC");
    expect(items[0].rawData.jerseyNumber).toBe(15);
  });

  it("returns empty array on fetch error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));
    const items = await adapter.fetch();
    expect(items).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest src/scraper/__tests__/adapters/espn-roster.test.ts --no-cache 2>&1 | tail -10
```

Expected: FAIL — cannot find module

- [ ] **Step 3: Implement ESPN Roster adapter**

Create `src/scraper/adapters/espn-roster.ts`:

```typescript
import { ScrapedItem, SourceAdapter } from "../types";

// ESPN team ID mapping (ESPN uses numeric IDs, not abbreviations)
const ESPN_TEAM_IDS: Record<string, string> = {
  ARI: "22", ATL: "1", BAL: "33", BUF: "2",
  CAR: "29", CHI: "3", CIN: "4", CLE: "5",
  DAL: "6", DEN: "7", DET: "8", GB: "9",
  HOU: "34", IND: "11", JAX: "30", KC: "12",
  LV: "13", LAC: "24", LAR: "14", MIA: "15",
  MIN: "16", NE: "17", NO: "18", NYG: "19",
  NYJ: "20", PHI: "21", PIT: "23", SF: "25",
  SEA: "26", TB: "27", TEN: "10", WAS: "28",
};

const ESPN_ROSTER_URL = (teamId: string) =>
  `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${teamId}/roster`;

interface EspnAthlete {
  id?: string;
  fullName?: string;
  jersey?: string;
  position?: { abbreviation?: string };
  age?: number;
  weight?: number;
  height?: string;
  experience?: { years?: number };
  college?: { name?: string };
  injuries?: Array<{ status?: string; details?: { detail?: string } }>;
}

interface EspnRosterGroup {
  position?: string;
  items?: EspnAthlete[];
}

export class EspnRosterAdapter implements SourceAdapter {
  name = "espn-roster";
  private teamIds: string[];

  constructor(teamIds?: string[]) {
    this.teamIds = teamIds || Object.keys(ESPN_TEAM_IDS);
  }

  async fetch(): Promise<ScrapedItem[]> {
    const allItems: ScrapedItem[] = [];

    for (const teamAbbrev of this.teamIds) {
      const espnId = ESPN_TEAM_IDS[teamAbbrev];
      if (!espnId) continue;

      try {
        const response = await fetch(ESPN_ROSTER_URL(espnId), {
          signal: AbortSignal.timeout(30_000),
        });

        if (!response.ok) {
          console.error(
            `ESPN roster for ${teamAbbrev} returned ${response.status}`
          );
          continue;
        }

        const data = await response.json();
        const groups: EspnRosterGroup[] = data?.athletes || [];
        const now = new Date().toISOString();

        for (const group of groups) {
          const athletes: EspnAthlete[] = group.items || [];
          for (const athlete of athletes) {
            if (!athlete.fullName) continue;

            const injury = athlete.injuries?.[0];
            const injuryStatus = injury?.status || "Active";

            allItems.push({
              type: "player",
              sourceAdapter: this.name,
              source: "ESPN",
              sourceUrl: `https://www.espn.com/nfl/team/roster/_/name/${teamAbbrev.toLowerCase()}`,
              confidence: "official",
              fetchedAt: now,
              rawData: {
                id: `${teamAbbrev}-${athlete.position?.abbreviation || "UNK"}-0`,
                name: athlete.fullName,
                team: teamAbbrev,
                position: athlete.position?.abbreviation || "UNK",
                positionGroup: group.position || "offense",
                depthOrder: 0,
                jerseyNumber: parseInt(athlete.jersey || "0", 10),
                height: athlete.height || "",
                weight: String(athlete.weight || 0),
                age: athlete.age || 0,
                college: athlete.college?.name || "",
                experience: athlete.experience?.years || 0,
                injuryStatus,
                injuryDetail: injury?.details?.detail,
              },
            });
          }
        }
      } catch (error) {
        console.error(`ESPN roster fetch failed for ${teamAbbrev}:`, error);
      }
    }

    return allItems;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest src/scraper/__tests__/adapters/espn-roster.test.ts --no-cache 2>&1 | tail -10
```

Expected: PASS — 4 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/scraper/adapters/espn-roster.ts src/scraper/__tests__/adapters/espn-roster.test.ts
git commit -m "feat: add ESPN public API roster adapter"
```

---

### Task 10: Rotoworld RSS Adapter

**Files:**
- Create: `src/scraper/adapters/rotoworld-rss.ts`
- Create: `src/scraper/__tests__/adapters/rotoworld-rss.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/scraper/__tests__/adapters/rotoworld-rss.test.ts`:

```typescript
import { RotoworldRssAdapter } from "../../adapters/rotoworld-rss";

const SAMPLE_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Rotoworld NFL Player News</title>
    <item>
      <title>Davante Adams (hamstring) limited in practice</title>
      <description>Raiders WR Davante Adams was limited in Wednesday practice with a hamstring issue.</description>
      <link>https://www.nbcsports.com/nfl/news/123</link>
      <pubDate>Sun, 13 Apr 2026 15:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

describe("RotoworldRssAdapter", () => {
  let adapter: RotoworldRssAdapter;
  let mockFetch: jest.SpyInstance;

  beforeEach(() => {
    adapter = new RotoworldRssAdapter();
    mockFetch = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(SAMPLE_RSS),
    } as Response);
  });

  afterEach(() => {
    mockFetch.mockRestore();
  });

  it("has the correct name", () => {
    expect(adapter.name).toBe("rotoworld-rss");
  });

  it("fetches and parses RSS items", async () => {
    const items = await adapter.fetch();
    expect(items.length).toBe(1);
    expect(items[0].source).toBe("Rotoworld");
    expect(items[0].confidence).toBe("reported");
  });

  it("extracts data into rawData", async () => {
    const items = await adapter.fetch();
    expect(items[0].rawData.headline).toBe(
      "Davante Adams (hamstring) limited in practice"
    );
  });

  it("returns empty array on fetch error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));
    const items = await adapter.fetch();
    expect(items).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest src/scraper/__tests__/adapters/rotoworld-rss.test.ts --no-cache 2>&1 | tail -10
```

Expected: FAIL — cannot find module

- [ ] **Step 3: Implement Rotoworld adapter**

Create `src/scraper/adapters/rotoworld-rss.ts`:

```typescript
import { XMLParser } from "fast-xml-parser";
import { ScrapedItem, SourceAdapter } from "../types";

const ROTOWORLD_RSS_URL =
  "https://www.nbcsports.com/nfl/rss/player-news";

interface RssItem {
  title?: string;
  description?: string;
  link?: string;
  pubDate?: string;
}

export class RotoworldRssAdapter implements SourceAdapter {
  name = "rotoworld-rss";

  async fetch(): Promise<ScrapedItem[]> {
    try {
      const response = await fetch(ROTOWORLD_RSS_URL, {
        signal: AbortSignal.timeout(30_000),
      });

      if (!response.ok) {
        console.error(`Rotoworld RSS returned ${response.status}`);
        return [];
      }

      const xml = await response.text();
      const parser = new XMLParser();
      const parsed = parser.parse(xml);

      const items: RssItem[] = parsed?.rss?.channel?.item || [];
      const itemArray = Array.isArray(items) ? items : [items];

      const now = new Date().toISOString();

      return itemArray
        .filter((item) => item.title)
        .map((item) => ({
          type: "news" as const,
          sourceAdapter: this.name,
          source: "Rotoworld",
          sourceUrl: item.link || "",
          confidence: "reported" as const,
          fetchedAt: now,
          rawData: {
            headline: item.title || "",
            description: item.description || "",
            timestamp: item.pubDate
              ? new Date(item.pubDate).toISOString()
              : now,
            playerId: "",
            playerName: "",
            team: "",
            position: "",
            category: "INJURY",
          },
        }));
    } catch (error) {
      console.error("Rotoworld RSS fetch failed:", error);
      return [];
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest src/scraper/__tests__/adapters/rotoworld-rss.test.ts --no-cache 2>&1 | tail -10
```

Expected: PASS — 4 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/scraper/adapters/rotoworld-rss.ts src/scraper/__tests__/adapters/rotoworld-rss.test.ts
git commit -m "feat: add Rotoworld RSS adapter"
```

---

### Task 11: Scrape Orchestrator

**Files:**
- Create: `src/scraper/orchestrator.ts`
- Create: `src/scraper/__tests__/orchestrator.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/scraper/__tests__/orchestrator.test.ts`:

```typescript
import Database from "better-sqlite3";
import { createTables } from "../../db/schema";
import { runScrape, ScrapeResult } from "../orchestrator";
import { SourceAdapter, ScrapedItem } from "../types";

class MockAdapter implements SourceAdapter {
  name = "mock-adapter";
  private items: ScrapedItem[];

  constructor(items: ScrapedItem[]) {
    this.items = items;
  }

  async fetch(): Promise<ScrapedItem[]> {
    return this.items;
  }
}

class FailingAdapter implements SourceAdapter {
  name = "failing-adapter";

  async fetch(): Promise<ScrapedItem[]> {
    throw new Error("Simulated failure");
  }
}

function makeNewsItem(headline: string, source: string): ScrapedItem {
  return {
    type: "news",
    sourceAdapter: "mock-adapter",
    source,
    sourceUrl: "https://example.com",
    confidence: "reported",
    fetchedAt: new Date().toISOString(),
    rawData: {
      playerId: "KC-QB-1",
      playerName: "Patrick Mahomes",
      team: "KC",
      position: "QB",
      category: "INJURY",
      headline,
      description: "Test description",
      timestamp: new Date().toISOString(),
    },
  };
}

describe("orchestrator", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(":memory:");
    createTables(db);
  });

  afterEach(() => {
    db.close();
  });

  it("runs adapters and stores news items in DB", async () => {
    const adapter = new MockAdapter([
      makeNewsItem("Mahomes injured", "ESPN"),
    ]);

    const result = await runScrape(db, [adapter]);

    expect(result.totalItems).toBe(1);
    expect(result.adapterResults).toHaveLength(1);
    expect(result.adapterResults[0].status).toBe("success");

    const rows = db.prepare("SELECT * FROM news").all();
    expect(rows).toHaveLength(1);
  });

  it("handles adapter failures gracefully", async () => {
    const goodAdapter = new MockAdapter([
      makeNewsItem("Trade news", "ESPN"),
    ]);
    const badAdapter = new FailingAdapter();

    const result = await runScrape(db, [goodAdapter, badAdapter]);

    expect(result.adapterResults).toHaveLength(2);
    expect(result.adapterResults[0].status).toBe("success");
    expect(result.adapterResults[1].status).toBe("error");
    expect(result.adapterResults[1].errorMessage).toBe("Simulated failure");

    const rows = db.prepare("SELECT * FROM news").all();
    expect(rows).toHaveLength(1);
  });

  it("deduplicates news items with same headline and source", async () => {
    const adapter1 = new MockAdapter([
      makeNewsItem("Same headline", "ESPN"),
    ]);

    await runScrape(db, [adapter1]);
    await runScrape(db, [adapter1]);

    const rows = db.prepare("SELECT * FROM news").all();
    expect(rows).toHaveLength(1);
  });

  it("logs scrape results to scrape_log", async () => {
    const adapter = new MockAdapter([
      makeNewsItem("News item", "ESPN"),
    ]);

    await runScrape(db, [adapter]);

    const logs = db.prepare("SELECT * FROM scrape_log").all() as Array<{
      adapter: string;
      status: string;
      itemsFound: number;
    }>;
    expect(logs).toHaveLength(1);
    expect(logs[0].adapter).toBe("mock-adapter");
    expect(logs[0].status).toBe("success");
    expect(logs[0].itemsFound).toBe(1);
  });

  it("upgrades confidence from reported to official", async () => {
    const reportedAdapter = new MockAdapter([
      makeNewsItem("Big trade", "ESPN"),
    ]);

    await runScrape(db, [reportedAdapter]);

    // Same headline from official source
    const officialItem = makeNewsItem("Big trade", "NFL.com");
    officialItem.confidence = "official";
    officialItem.source = "NFL.com";
    const officialAdapter = new MockAdapter([officialItem]);

    await runScrape(db, [officialAdapter]);

    const rows = db.prepare("SELECT * FROM news WHERE headline = 'Big trade'").all() as Array<{
      confidence: string;
      source: string;
    }>;

    // Should have 2 records (different sources) but the first should be upgraded
    const espnRow = rows.find((r) => r.source === "ESPN");
    expect(espnRow?.confidence).toBe("official");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest src/scraper/__tests__/orchestrator.test.ts --no-cache 2>&1 | tail -10
```

Expected: FAIL — cannot find module `../orchestrator`

- [ ] **Step 3: Implement orchestrator**

Create `src/scraper/orchestrator.ts`:

```typescript
import Database from "better-sqlite3";
import { SourceAdapter, AdapterResult, ScrapedItem } from "./types";
import { normalizeToPlayer, normalizeToNewsItem } from "./normalize";
import { makeDedupKey, shouldUpgradeConfidence } from "./dedup";

export interface ScrapeResult {
  totalItems: number;
  adapterResults: AdapterResult[];
  startedAt: string;
  completedAt: string;
}

export async function runScrape(
  db: Database.Database,
  adapters: SourceAdapter[]
): Promise<ScrapeResult> {
  const startedAt = new Date().toISOString();
  const adapterResults: AdapterResult[] = [];
  let totalItems = 0;

  // Run all adapters in parallel
  const results = await Promise.allSettled(
    adapters.map(async (adapter) => {
      const adapterStart = new Date().toISOString();
      try {
        const items = await adapter.fetch();
        return {
          adapter: adapter.name,
          status: "success" as const,
          items,
          itemsFound: items.length,
          startedAt: adapterStart,
          completedAt: new Date().toISOString(),
        };
      } catch (error) {
        return {
          adapter: adapter.name,
          status: "error" as const,
          items: [],
          itemsFound: 0,
          errorMessage:
            error instanceof Error ? error.message : String(error),
          startedAt: adapterStart,
          completedAt: new Date().toISOString(),
        };
      }
    })
  );

  // Collect results
  for (const result of results) {
    if (result.status === "fulfilled") {
      adapterResults.push(result.value);
    }
  }

  // Get existing dedup keys
  const existingKeys = new Set(
    (
      db.prepare("SELECT dedupKey FROM news").all() as Array<{
        dedupKey: string;
      }>
    ).map((r) => r.dedupKey)
  );

  // Process all items
  const insertNews = db.prepare(`
    INSERT OR IGNORE INTO news
    (id, dedupKey, playerId, playerName, team, position, category,
     headline, description, source, sourceUrl, confidence, timestamp, fetchedAt)
    VALUES
    (@id, @dedupKey, @playerId, @playerName, @team, @position, @category,
     @headline, @description, @source, @sourceUrl, @confidence, @timestamp, @fetchedAt)
  `);

  const insertPlayer = db.prepare(`
    INSERT OR REPLACE INTO players
    (id, name, team, position, positionGroup, depthOrder, jerseyNumber,
     height, weight, age, college, experience, injuryStatus, injuryDetail,
     stats, source, sourceUrl, updatedAt)
    VALUES
    (@id, @name, @team, @position, @positionGroup, @depthOrder, @jerseyNumber,
     @height, @weight, @age, @college, @experience, @injuryStatus, @injuryDetail,
     @stats, @source, @sourceUrl, @updatedAt)
  `);

  const upgradeConfidence = db.prepare(`
    UPDATE news SET confidence = 'official'
    WHERE dedupKey = @dedupKey AND confidence = 'reported'
  `);

  const insertLog = db.prepare(`
    INSERT INTO scrape_log
    (adapter, status, itemsFound, itemsNew, itemsUpdated, errorMessage, startedAt, completedAt)
    VALUES
    (@adapter, @status, @itemsFound, @itemsNew, @itemsUpdated, @errorMessage, @startedAt, @completedAt)
  `);

  const processAll = db.transaction(() => {
    for (const adapterResult of adapterResults) {
      let itemsNew = 0;
      let itemsUpdated = 0;

      for (const item of adapterResult.items) {
        totalItems++;

        if (item.type === "player") {
          const player = normalizeToPlayer(item);
          insertPlayer.run({
            id: player.id,
            name: player.name,
            team: player.team,
            position: player.position,
            positionGroup: player.positionGroup,
            depthOrder: player.depthOrder,
            jerseyNumber: player.jerseyNumber,
            height: player.height,
            weight: player.weight,
            age: player.age,
            college: player.college,
            experience: player.experience,
            injuryStatus: player.injuryStatus,
            injuryDetail: player.injuryDetail || null,
            stats: JSON.stringify(player.stats),
            source: item.source,
            sourceUrl: item.sourceUrl,
            updatedAt: item.fetchedAt,
          });
          itemsNew++;
        } else if (item.type === "news") {
          const news = normalizeToNewsItem(item);
          const dedupKey = makeDedupKey(item.source, news.headline);

          if (existingKeys.has(dedupKey)) {
            // Check for confidence upgrade
            if (item.confidence === "official") {
              const changes = upgradeConfidence.run({ dedupKey });
              if (changes.changes > 0) itemsUpdated++;
            }
          } else {
            insertNews.run({
              id: news.id,
              dedupKey,
              playerId: news.playerId,
              playerName: news.playerName,
              team: news.team,
              position: news.position,
              category: news.category,
              headline: news.headline,
              description: news.description,
              source: news.source,
              sourceUrl: news.sourceUrl,
              confidence: news.confidence,
              timestamp: news.timestamp,
              fetchedAt: item.fetchedAt,
            });
            existingKeys.add(dedupKey);
            itemsNew++;
          }
        }
      }

      insertLog.run({
        adapter: adapterResult.adapter,
        status: adapterResult.status,
        itemsFound: adapterResult.itemsFound,
        itemsNew,
        itemsUpdated,
        errorMessage: adapterResult.errorMessage || null,
        startedAt: adapterResult.startedAt,
        completedAt: adapterResult.completedAt,
      });
    }
  });

  processAll();

  return {
    totalItems,
    adapterResults,
    startedAt,
    completedAt: new Date().toISOString(),
  };
}
```

- [ ] **Step 4: Run orchestrator test to verify it passes**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest src/scraper/__tests__/orchestrator.test.ts --no-cache 2>&1 | tail -10
```

Expected: PASS — 5 tests passing

- [ ] **Step 5: Run all tests**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest --no-cache 2>&1 | tail -15
```

Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add src/scraper/orchestrator.ts src/scraper/__tests__/orchestrator.test.ts
git commit -m "feat: add scrape orchestrator with parallel adapters and dedup"
```

---

### Task 12: CLI Entry Point

**Files:**
- Create: `src/scraper/cli.ts`

- [ ] **Step 1: Create CLI entry point**

Create `src/scraper/cli.ts`:

```typescript
import { getDb, closeDb } from "../db/client";
import { seedFromMock } from "../db/seed";
import { runScrape } from "./orchestrator";
import { EspnRssAdapter } from "./adapters/espn-rss";
import { NflTransactionsAdapter } from "./adapters/nfl-transactions";
import { EspnRosterAdapter } from "./adapters/espn-roster";
import { RotoworldRssAdapter } from "./adapters/rotoworld-rss";

async function main() {
  console.log("RosterPulse Scraper — starting...\n");

  const db = getDb();

  // Seed with mock data if DB is empty
  const playerCount = (
    db.prepare("SELECT COUNT(*) as count FROM players").get() as {
      count: number;
    }
  ).count;

  if (playerCount === 0) {
    console.log("Empty database — seeding from mock data...");
    const seedResult = seedFromMock(db);
    console.log(
      `  Seeded ${seedResult.playersSeeded} players, ${seedResult.newsSeeded} news items\n`
    );
  }

  // Run scrape
  const adapters = [
    new EspnRssAdapter(),
    new NflTransactionsAdapter(),
    new EspnRosterAdapter(),
    new RotoworldRssAdapter(),
  ];

  console.log(`Running ${adapters.length} adapters...\n`);

  const result = await runScrape(db, adapters);

  // Print summary
  console.log("=== Scrape Summary ===");
  console.log(`Total items processed: ${result.totalItems}`);
  console.log(`Duration: ${result.startedAt} → ${result.completedAt}\n`);

  for (const ar of result.adapterResults) {
    const icon = ar.status === "success" ? "✓" : "✗";
    console.log(`  ${icon} ${ar.adapter}: ${ar.itemsFound} items found`);
    if (ar.errorMessage) {
      console.log(`    Error: ${ar.errorMessage}`);
    }
  }

  console.log("");

  closeDb();

  const hasFailure = result.adapterResults.every(
    (r) => r.status === "error"
  );
  process.exit(hasFailure ? 1 : 0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  closeDb();
  process.exit(1);
});
```

- [ ] **Step 2: Verify the CLI script compiles**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx tsx --eval "import './src/scraper/cli'" 2>&1 | head -5
```

Note: This will actually try to run the scraper — that's OK. It should start up without import errors. If it tries to fetch and fails, that's expected (network calls may not succeed in all environments). The key is no module resolution errors.

- [ ] **Step 3: Commit**

```bash
git add src/scraper/cli.ts
git commit -m "feat: add scraper CLI entry point (npm run scrape)"
```

---

### Task 13: Live Roster Service

**Files:**
- Create: `src/services/liveRosterService.ts`
- Create: `src/services/__tests__/liveRosterService.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/services/__tests__/liveRosterService.test.ts`:

```typescript
import Database from "better-sqlite3";
import { createTables } from "../../db/schema";
import { seedFromMock } from "../../db/seed";
import { createLiveRosterService } from "../liveRosterService";
import { RosterService } from "@/types";

describe("LiveRosterService", () => {
  let db: Database.Database;
  let service: RosterService;

  beforeAll(() => {
    db = new Database(":memory:");
    createTables(db);
    seedFromMock(db);
    service = createLiveRosterService(db);
  });

  afterAll(() => {
    db.close();
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
    });

    it("returns undefined for invalid team ID", () => {
      expect(service.getTeam("INVALID")).toBeUndefined();
    });
  });

  describe("getTeamRoster", () => {
    it("returns a roster with depth chart entries", () => {
      const roster = service.getTeamRoster("KC");
      expect(roster).toBeDefined();
      expect(roster?.team.id).toBe("KC");
      expect(roster?.depthChart.length).toBeGreaterThan(0);
    });

    it("returns undefined for invalid team ID", () => {
      expect(service.getTeamRoster("INVALID")).toBeUndefined();
    });
  });

  describe("getPlayer", () => {
    it("returns a player by ID", () => {
      const player = service.getPlayer("KC-QB-1");
      expect(player).toBeDefined();
      expect(player?.name).toBe("Patrick Mahomes");
    });

    it("returns undefined for invalid player ID", () => {
      expect(service.getPlayer("INVALID-ID")).toBeUndefined();
    });
  });

  describe("getAllNews", () => {
    it("returns news items sorted by timestamp descending", () => {
      const news = service.getAllNews();
      expect(news.length).toBeGreaterThan(0);
      for (let i = 1; i < news.length; i++) {
        expect(
          new Date(news[i - 1].timestamp).getTime()
        ).toBeGreaterThanOrEqual(new Date(news[i].timestamp).getTime());
      }
    });

    it("filters by category", () => {
      const news = service.getAllNews({ category: "INJURY" });
      news.forEach((item) => {
        expect(item.category).toBe("INJURY");
      });
    });

    it("limits results", () => {
      const news = service.getAllNews({ limit: 5 });
      expect(news).toHaveLength(5);
    });
  });

  describe("searchPlayers", () => {
    it("finds players by name (case-insensitive)", () => {
      const results = service.searchPlayers("mahomes");
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].name).toBe("Patrick Mahomes");
    });

    it("returns empty array for no matches", () => {
      expect(service.searchPlayers("zzzzzzzzz")).toEqual([]);
    });
  });

  describe("searchTeams", () => {
    it("finds teams by name", () => {
      const results = service.searchTeams("chiefs");
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].id).toBe("KC");
    });
  });

  describe("getLastVerified", () => {
    it("returns an ISO timestamp string", () => {
      const timestamp = service.getLastVerified();
      expect(timestamp).toBeDefined();
      expect(() => new Date(timestamp)).not.toThrow();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest src/services/__tests__/liveRosterService.test.ts --no-cache 2>&1 | tail -10
```

Expected: FAIL — cannot find module `../liveRosterService`

- [ ] **Step 3: Implement live roster service**

Create `src/services/liveRosterService.ts`:

```typescript
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

// Position ordering for depth chart display (same as mock service)
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
  stats: string;
}

interface NewsRow {
  id: string;
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
}

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
    injuryDetail: row.injuryDetail || undefined,
    stats: JSON.parse(row.stats || "{}"),
  };
}

function rowToNewsItem(row: NewsRow): NewsItem {
  return {
    id: row.id,
    playerId: row.playerId || "",
    playerName: row.playerName,
    team: row.team,
    position: row.position,
    category: row.category as NewsCategory,
    headline: row.headline,
    description: row.description,
    source: row.source || undefined,
    sourceUrl: row.sourceUrl || undefined,
    confidence: (row.confidence as "reported" | "official") || undefined,
    timestamp: row.timestamp,
  };
}

function buildDepthChart(playerRows: PlayerRow[]): DepthChartEntry[] {
  const positionMap = new Map<string, Player[]>();

  for (const row of playerRows) {
    const player = rowToPlayer(row);
    const existing = positionMap.get(player.position) || [];
    existing.push(player);
    positionMap.set(player.position, existing);
  }

  const entries: DepthChartEntry[] = [];

  for (const [position, players] of positionMap.entries()) {
    const sorted = [...players].sort((a, b) => a.depthOrder - b.depthOrder);
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

      return {
        team,
        depthChart,
        news: newsRows.map(rowToNewsItem),
      };
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

    getAllNews(options?: {
      category?: NewsCategory;
      limit?: number;
    }): NewsItem[] {
      let sql = "SELECT * FROM news";
      const params: unknown[] = [];

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

      return row?.completedAt || new Date().toISOString();
    },
  };
}
```

- [ ] **Step 4: Run live roster service test to verify it passes**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest src/services/__tests__/liveRosterService.test.ts --no-cache 2>&1 | tail -15
```

Expected: PASS — all tests passing

- [ ] **Step 5: Run all tests**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest --no-cache 2>&1 | tail -15
```

Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add src/services/liveRosterService.ts src/services/__tests__/liveRosterService.test.ts
git commit -m "feat: add live roster service reading from SQLite"
```

---

### Task 14: Service Factory (createRosterService)

**Files:**
- Create: `src/services/createRosterService.ts`
- Create: `src/services/__tests__/createRosterService.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/services/__tests__/createRosterService.test.ts`:

```typescript
import Database from "better-sqlite3";
import { createTables } from "../../db/schema";
import { seedFromMock } from "../../db/seed";
import { createRosterService } from "../createRosterService";
import fs from "fs";
import path from "path";

describe("createRosterService", () => {
  const testDbPath = path.join(__dirname, "test-factory.db");

  afterEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  it("returns mock service when DATA_SOURCE=mock", () => {
    const originalEnv = process.env.DATA_SOURCE;
    process.env.DATA_SOURCE = "mock";

    const service = createRosterService();
    const teams = service.getAllTeams();
    expect(teams).toHaveLength(32);

    process.env.DATA_SOURCE = originalEnv;
  });

  it("returns mock service when DB does not exist", () => {
    const originalEnv = process.env.DATA_SOURCE;
    delete process.env.DATA_SOURCE;

    const service = createRosterService("/nonexistent/path.db");
    const teams = service.getAllTeams();
    expect(teams).toHaveLength(32);

    process.env.DATA_SOURCE = originalEnv;
  });

  it("returns live service when DB exists with fresh data", () => {
    // Create and seed a test DB
    const db = new Database(testDbPath);
    createTables(db);
    seedFromMock(db);

    // Add a recent scrape_log entry
    db.prepare(
      "INSERT INTO scrape_log (adapter, status, itemsFound, itemsNew, itemsUpdated, startedAt, completedAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run("test", "success", 1, 1, 0, new Date().toISOString(), new Date().toISOString());
    db.close();

    const originalEnv = process.env.DATA_SOURCE;
    delete process.env.DATA_SOURCE;

    const service = createRosterService(testDbPath);
    const teams = service.getAllTeams();
    expect(teams).toHaveLength(32);

    // Verify it's using the live service by checking a player exists
    const player = service.getPlayer("KC-QB-1");
    expect(player).toBeDefined();

    process.env.DATA_SOURCE = originalEnv;
  });

  it("returns mock service when DB exists but data is stale (>4 hours)", () => {
    const db = new Database(testDbPath);
    createTables(db);
    seedFromMock(db);

    // Add a stale scrape_log entry (5 hours ago)
    const staleTime = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();
    db.prepare(
      "INSERT INTO scrape_log (adapter, status, itemsFound, itemsNew, itemsUpdated, startedAt, completedAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run("test", "success", 1, 1, 0, staleTime, staleTime);
    db.close();

    const originalEnv = process.env.DATA_SOURCE;
    delete process.env.DATA_SOURCE;

    const service = createRosterService(testDbPath);
    // Service should still work (falls back to mock)
    const teams = service.getAllTeams();
    expect(teams).toHaveLength(32);

    process.env.DATA_SOURCE = originalEnv;
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest src/services/__tests__/createRosterService.test.ts --no-cache 2>&1 | tail -10
```

Expected: FAIL — cannot find module `../createRosterService`

- [ ] **Step 3: Implement service factory**

Create `src/services/createRosterService.ts`:

```typescript
import fs from "fs";
import Database from "better-sqlite3";
import { RosterService } from "@/types";
import { createMockRosterService } from "./rosterService";
import { createLiveRosterService } from "./liveRosterService";
import { DB_PATH } from "@/db/client";

const STALE_THRESHOLD_MS = 4 * 60 * 60 * 1000; // 4 hours

function isDbFresh(db: Database.Database): boolean {
  try {
    const row = db
      .prepare(
        "SELECT completedAt FROM scrape_log WHERE status = 'success' ORDER BY completedAt DESC LIMIT 1"
      )
      .get() as { completedAt: string } | undefined;

    if (!row) return false;

    const lastScrape = new Date(row.completedAt).getTime();
    return Date.now() - lastScrape < STALE_THRESHOLD_MS;
  } catch {
    return false;
  }
}

export function createRosterService(
  dbPath: string = DB_PATH
): RosterService {
  // Force mock if env says so
  if (process.env.DATA_SOURCE === "mock") {
    return createMockRosterService();
  }

  // Check if DB file exists
  if (!fs.existsSync(dbPath)) {
    return createMockRosterService();
  }

  try {
    const db = new Database(dbPath, { readonly: true });

    if (!isDbFresh(db)) {
      db.close();
      return createMockRosterService();
    }

    return createLiveRosterService(db);
  } catch {
    return createMockRosterService();
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest src/services/__tests__/createRosterService.test.ts --no-cache 2>&1 | tail -10
```

Expected: PASS — 4 tests passing

- [ ] **Step 5: Run all tests**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest --no-cache 2>&1 | tail -15
```

Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add src/services/createRosterService.ts src/services/__tests__/createRosterService.test.ts
git commit -m "feat: add service factory with live/mock switching"
```

---

### Task 15: Update Pages to Use New Service Factory

**Files:**
- Modify: `src/app/page.tsx:1`
- Modify: `src/app/team/[teamId]/page.tsx:2`
- Modify: `src/app/player/[playerId]/page.tsx:3`
- Modify: `src/app/search/page.tsx:5`

- [ ] **Step 1: Update home page**

In `src/app/page.tsx`, change line 1:

```typescript
// OLD:
import { createMockRosterService } from "@/services/rosterService";
// NEW:
import { createRosterService } from "@/services/createRosterService";
```

And change line 10:

```typescript
// OLD:
const service = createMockRosterService();
// NEW:
const service = createRosterService();
```

- [ ] **Step 2: Update team page**

In `src/app/team/[teamId]/page.tsx`, change line 2:

```typescript
// OLD:
import { createMockRosterService } from "@/services/rosterService";
// NEW:
import { createRosterService } from "@/services/createRosterService";
```

And change line 22:

```typescript
// OLD:
const service = createMockRosterService();
// NEW:
const service = createRosterService();
```

- [ ] **Step 3: Update player page**

In `src/app/player/[playerId]/page.tsx`, change line 3:

```typescript
// OLD:
import { createMockRosterService } from "@/services/rosterService";
// NEW:
import { createRosterService } from "@/services/createRosterService";
```

And change line 15:

```typescript
// OLD:
const service = createMockRosterService();
// NEW:
const service = createRosterService();
```

- [ ] **Step 4: Update search page**

In `src/app/search/page.tsx`, change line 5:

```typescript
// OLD:
import { createMockRosterService } from "@/services/rosterService";
// NEW:
import { createRosterService } from "@/services/createRosterService";
```

And change line 16:

```typescript
// OLD:
const service = createMockRosterService();
// NEW:
const service = createRosterService();
```

- [ ] **Step 5: Run all tests to verify no regressions**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest --no-cache 2>&1 | tail -15
```

Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx src/app/team/*/page.tsx src/app/player/*/page.tsx src/app/search/page.tsx
git commit -m "feat: switch pages from mock to live/mock service factory"
```

---

### Task 16: Update NewsCard for Source Attribution

**Files:**
- Modify: `src/components/NewsCard.tsx`

- [ ] **Step 1: Update NewsCard to show confidence and source attribution**

In `src/components/NewsCard.tsx`, update the component to display the confidence badge. Replace the existing source display block (the `{item.source && ...}` section near the bottom) with an enhanced version.

Replace the block at lines 90-95:

```typescript
// OLD:
      {item.source && (
        <p className="mt-1 font-mono text-[10px] text-text-muted">
          {item.source}
        </p>
      )}

// NEW:
      {item.source && (
        <p className="mt-1 flex items-center gap-1.5 font-mono text-[10px] text-text-muted">
          {item.confidence === "official" ? (
            <span className="rounded bg-status-green-bg px-1 py-0.5 text-status-green">
              Official
            </span>
          ) : item.confidence === "reported" ? (
            <span className="rounded bg-status-amber-bg px-1 py-0.5 text-status-amber">
              Reported
            </span>
          ) : null}
          <span>via {item.source}</span>
        </p>
      )}
```

- [ ] **Step 2: Verify the site renders correctly**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx next build 2>&1 | tail -20
```

Expected: Build succeeds (or only unrelated warnings)

- [ ] **Step 3: Run all tests**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest --no-cache 2>&1 | tail -15
```

Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/components/NewsCard.tsx
git commit -m "feat: add source attribution and confidence badges to NewsCard"
```

---

### Task 17: API Route for Production Cron

**Files:**
- Create: `src/app/api/scrape/route.ts`

- [ ] **Step 1: Create the API route**

Create `src/app/api/scrape/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getDb, closeDb } from "@/db/client";
import { seedFromMock } from "@/db/seed";
import { runScrape } from "@/scraper/orchestrator";
import { EspnRssAdapter } from "@/scraper/adapters/espn-rss";
import { NflTransactionsAdapter } from "@/scraper/adapters/nfl-transactions";
import { EspnRosterAdapter } from "@/scraper/adapters/espn-roster";
import { RotoworldRssAdapter } from "@/scraper/adapters/rotoworld-rss";

export async function POST(request: Request) {
  // Verify secret
  const authHeader = request.headers.get("authorization");
  const secret = process.env.SCRAPE_SECRET;

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();

    // Seed if empty
    const playerCount = (
      db.prepare("SELECT COUNT(*) as count FROM players").get() as {
        count: number;
      }
    ).count;

    if (playerCount === 0) {
      seedFromMock(db);
    }

    const adapters = [
      new EspnRssAdapter(),
      new NflTransactionsAdapter(),
      new EspnRosterAdapter(),
      new RotoworldRssAdapter(),
    ];

    const result = await runScrape(db, adapters);

    return NextResponse.json({
      success: true,
      summary: {
        totalItems: result.totalItems,
        adapters: result.adapterResults.map((r) => ({
          name: r.adapter,
          status: r.status,
          itemsFound: r.itemsFound,
          error: r.errorMessage,
        })),
        startedAt: result.startedAt,
        completedAt: result.completedAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Create vercel.json for cron scheduling**

Create `vercel.json` in the project root:

```json
{
  "crons": [
    {
      "path": "/api/scrape",
      "schedule": "0 */2 * * *"
    }
  ]
}
```

- [ ] **Step 3: Run all tests**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest --no-cache 2>&1 | tail -15
```

Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/app/api/scrape/route.ts vercel.json
git commit -m "feat: add API route for production cron scrape trigger"
```

---

### Task 18: End-to-End Verification

**Files:**
- No new files

- [ ] **Step 1: Run all tests**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx jest --no-cache 2>&1 | tail -20
```

Expected: All tests pass

- [ ] **Step 2: Test the scraper CLI locally**

```bash
cd /Users/davidhamamura/Documents/claude/med
npm run scrape 2>&1 | head -30
```

Expected: Scraper runs, seeds mock data if needed, attempts to fetch from all 4 sources (some may fail due to network/RSS availability — that's OK), and prints a summary.

- [ ] **Step 3: Verify DB was created**

```bash
ls -la /Users/davidhamamura/Documents/claude/med/data/rosterpulse.db
```

Expected: File exists

- [ ] **Step 4: Verify the site still works with live data**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx next build 2>&1 | tail -20
```

Expected: Build succeeds

- [ ] **Step 5: Start dev server and verify in browser**

```bash
cd /Users/davidhamamura/Documents/claude/med
npx next dev --port 5173
```

Visit `http://localhost:5173` — site should display teams and news as before. News items should now show "via [source]" attribution if data came from the pipeline.

- [ ] **Step 6: Final commit if any fixes were needed**

```bash
git add -A
git status
# Only commit if there are changes
git commit -m "fix: end-to-end verification fixes" || echo "Nothing to commit"
```
