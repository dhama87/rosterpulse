# RosterPulse Data Pipeline Design

## Goal

Replace static mock data with a real-time data pipeline that scrapes free RSS feeds and public APIs every 2 hours, stores results in SQLite, and serves them through the existing `RosterService` interface — with mock data as an automatic fallback.

## Constraints

- **Budget:** Free sources only (RSS feeds, ESPN public API). Architecture must support swapping in premium APIs (SportsDataIO Pro, SportRadar) later by adding a single adapter file.
- **Frequency:** Every 2 hours in production. On-demand locally via `npm run scrape`.
- **Accuracy vs. speed:** Hybrid — show news immediately with source attribution ("via ESPN"), auto-upgrade confidence when an official source confirms.
- **Reliability:** Mock data as fallback. If the pipeline hasn't run or data is stale (>4 hours), the site falls back to existing mock data and shows a "Using cached data" indicator.

## Architecture Overview

```
Cron (every 2h) or CLI (npm run scrape)
  └─ Orchestrator
     ├─ espn-rss adapter
     ├─ nfl-transactions adapter
     ├─ espn-roster adapter
     └─ rotoworld-rss adapter
     │
     ├─ Normalize → ScrapedItem → Player/NewsItem
     ├─ Deduplicate against existing DB records
     ├─ Upsert into SQLite
     └─ Log to scrape_log

Next.js Pages
  └─ createRosterService()
     ├─ SQLite has fresh data? → liveRosterService (reads DB)
     └─ No? → mockRosterService (existing fallback)
```

## Source Adapters

Each data source gets its own adapter module implementing a common interface:

```typescript
interface SourceAdapter {
  name: string;
  fetch(): Promise<ScrapedItem[]>;
}
```

| Adapter | Source | Data Provided | Format |
|---------|--------|--------------|--------|
| `espn-rss` | ESPN NFL RSS feeds | Breaking news, transactions | RSS/XML |
| `nfl-transactions` | NFL.com transaction wire RSS | Official signings, releases, IR moves | RSS/XML |
| `espn-roster` | ESPN public API (`site.api.espn.com`) | Roster data, depth charts, injury reports | JSON |
| `rotoworld-rss` | Rotoworld/NBC Sports RSS | Injury updates, depth chart changes | RSS/XML |

### ScrapedItem (Intermediate Type)

```typescript
interface ScrapedItem {
  type: "player" | "news";
  sourceAdapter: string;       // which adapter produced this
  source: string;              // display name: "ESPN", "NFL.com", etc.
  sourceUrl: string;           // link to original article/page
  confidence: "reported" | "official";
  rawData: Record<string, unknown>;  // adapter-specific parsed data
  fetchedAt: string;           // ISO timestamp
}
```

Each adapter parses its source format and emits `ScrapedItem[]`. The normalizer then converts these into `Player` or `NewsItem` types for storage.

### Adding Premium APIs Later

Write one new file in `src/scraper/adapters/` (e.g., `sportsdataio.ts`), implement `SourceAdapter`, register it in the orchestrator. No other code changes needed.

## Data Storage

### SQLite via better-sqlite3

Single file at `data/rosterpulse.db` (gitignored). Synchronous reads work well with Next.js server components.

### Tables

**players**
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | Format: `{teamId}-{position}-{depth}` |
| name | TEXT | |
| team | TEXT | Team ID |
| position | TEXT | e.g., QB, WR1, LB2 |
| positionGroup | TEXT | offense, defense, specialTeams |
| depthOrder | INTEGER | 1, 2, or 3 |
| jerseyNumber | INTEGER | |
| height | TEXT | |
| weight | INTEGER | |
| age | INTEGER | |
| college | TEXT | |
| experience | TEXT | |
| injuryStatus | TEXT | Active, Questionable, etc. |
| injuryDetail | TEXT | nullable |
| stats | TEXT | JSON blob |
| source | TEXT | Which adapter last updated this |
| sourceUrl | TEXT | |
| updatedAt | TEXT | ISO timestamp |

**news**
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| dedupKey | TEXT UNIQUE | Hash of source + headline for dedup |
| playerId | TEXT | nullable |
| playerName | TEXT | |
| team | TEXT | |
| position | TEXT | |
| category | TEXT | INJURY, TRADE, SIGNING, IR, DEPTH_CHART, SUSPENSION, RETURN |
| headline | TEXT | |
| description | TEXT | |
| source | TEXT | "ESPN", "NFL.com", etc. |
| sourceUrl | TEXT | Link to original |
| confidence | TEXT | "reported" or "official" |
| timestamp | TEXT | When the event occurred |
| fetchedAt | TEXT | When we scraped it |

**scrape_log**
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto-increment |
| adapter | TEXT | Adapter name |
| status | TEXT | "success" or "error" |
| itemsFound | INTEGER | |
| itemsNew | INTEGER | New items inserted |
| itemsUpdated | INTEGER | Existing items updated |
| errorMessage | TEXT | nullable |
| startedAt | TEXT | ISO timestamp |
| completedAt | TEXT | ISO timestamp |

### Deduplication

News items are deduplicated by a composite key: hash of `source + normalized headline`. If the same story appears from multiple sources, both records are kept (different `source` values) but linked by a shared `dedupKey`. When an official source confirms a previously reported item, the confidence auto-upgrades to `"official"`.

### Staleness

The service checks the most recent successful entry in `scrape_log`. If it's older than 4 hours, the site falls back to mock data and shows a "Using cached data" indicator.

## Scrape Orchestrator

Central module at `src/scraper/orchestrator.ts`.

### Behavior

1. Run all adapters in parallel (`Promise.allSettled`)
2. Each adapter runs independently — if one fails, others still complete
3. Normalize all `ScrapedItem[]` into `Player[]` and `NewsItem[]`
4. Deduplicate against existing DB records
5. Upsert into SQLite (insert new, update changed)
6. Auto-upgrade confidence where applicable
7. Log results per adapter to `scrape_log`

### Error Handling

- Each adapter catches its own errors and returns an `AdapterResult` with status + error message
- Network timeouts: 30 second limit per adapter
- Parse failures: log and skip malformed items, continue with valid ones
- No single adapter failure stops the cycle

### CLI Entry Point

`src/scraper/cli.ts` — called by `npm run scrape`:
- Runs the orchestrator once
- Prints a summary to stdout (items fetched, new, updated, errors)
- Exits with code 0 (success) or 1 (all adapters failed)

## Service Layer Integration

### New Files

**`src/services/liveRosterService.ts`**
- Implements `RosterService` interface
- Reads from SQLite via `better-sqlite3`
- All the same methods: `getAllTeams()`, `getTeamRoster()`, `getPlayer()`, etc.
- Adds `confidence` field to `NewsItem` results

**`src/services/createRosterService.ts`**
- New factory that replaces `createMockRosterService()` calls in pages
- Logic:
  1. If `DATA_SOURCE=mock` env var → always return mock service
  2. If `data/rosterpulse.db` exists and has data < 4 hours old → return live service
  3. Otherwise → return mock service (fallback)

### Changes to Existing Code

- **Pages** (`page.tsx`, `team/[teamId]/page.tsx`, `player/[playerId]/page.tsx`, `search/page.tsx`): Change import from `createMockRosterService` to `createRosterService`. One line per file.
- **`NewsItem` type**: Add optional `confidence?: "reported" | "official"` field.
- **Everything else**: Unchanged. Components, layouts, styling, mock data files all stay as-is.

## Production Scheduling

| Environment | Trigger | Method |
|-------------|---------|--------|
| Local dev | `npm run scrape` | Manual CLI command, runs once and exits |
| Vercel | Vercel Cron | `vercel.json` config hits `/api/scrape` every 2 hours |
| Self-hosted | System cron | `crontab` runs `npm run scrape` every 2 hours |

### API Route

`/api/scrape` — a Next.js API route for production cron triggers:
- Requires `Authorization: Bearer <SCRAPE_SECRET>` header
- Calls the orchestrator
- Returns JSON: `{ success: boolean, summary: { ... } }`
- `SCRAPE_SECRET` stored as environment variable

### Vercel Cron Config

```json
{
  "crons": [{ "path": "/api/scrape", "schedule": "0 */2 * * *" }]
}
```

## File Structure

```
src/
  scraper/
    cli.ts                  — npm run scrape entry point
    orchestrator.ts         — runs all adapters, writes to DB
    normalize.ts            — ScrapedItem → Player/NewsItem conversion
    dedup.ts                — duplicate detection via headline hashing
    types.ts                — ScrapedItem, AdapterResult interfaces
    adapters/
      espn-rss.ts           — ESPN NFL RSS feed adapter
      nfl-transactions.ts   — NFL.com transaction wire RSS adapter
      espn-roster.ts        — ESPN public API roster adapter
      rotoworld-rss.ts      — Rotoworld/NBC RSS feed adapter
  db/
    schema.ts               — SQLite table creation statements
    client.ts               — better-sqlite3 connection + query helpers
    seed.ts                 — populate DB with existing mock data as baseline
  services/
    rosterService.ts        — existing mock service (unchanged)
    liveRosterService.ts    — new: reads from SQLite
    createRosterService.ts  — new: factory picks live vs mock
data/
  rosterpulse.db            — SQLite database file (gitignored)
```

### New Dependencies

- `better-sqlite3` — synchronous SQLite driver for Node.js
- `@types/better-sqlite3` — TypeScript types
- `fast-xml-parser` — RSS/XML parsing (lightweight, no dependencies)

## UI Changes (Minimal)

Two small additions to surface pipeline status:

1. **Source attribution on news items** — small "via ESPN" or "Official" text on each `NewsCard`, using the `source` and `confidence` fields.
2. **Last verified timestamp** — the existing "Updated" text in the team header reads from `scrape_log` instead of `new Date()`.

No layout, styling, or component structure changes.

## Testing Strategy

- **Adapter tests**: Mock HTTP responses, verify correct parsing and normalization for each source format.
- **Dedup tests**: Verify duplicate detection, confidence upgrade logic.
- **Service tests**: Verify `createRosterService` correctly picks live vs mock based on DB state.
- **Integration test**: Full orchestrator cycle with mocked HTTP → verify DB state.
- **Existing tests**: Must continue passing unchanged (mock service behavior preserved).
