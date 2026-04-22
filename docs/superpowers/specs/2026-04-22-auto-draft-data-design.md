# Auto-Updating Draft Data — Design Spec

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace manually-maintained static draft data with three scraper adapters that auto-populate draft order, prospect rankings, and team needs daily — zero manual intervention year to year.

**Architecture:** Three new `SourceAdapter` implementations plug into the existing scraper pipeline. They scrape Tankathon (draft order + prospects) and NFL.com (team needs), outputting `ScrapedItem[]` with discriminator flags. The orchestrator routes items to the appropriate draft tables. A `getDraftYear()` utility auto-detects the correct draft year based on the current date.

**Tech Stack:** Same as existing — TypeScript, `SourceAdapter` interface, Turso/libsql, Next.js App Router, Vercel cron.

---

## 1. Draft Year Auto-Detection

A shared utility function `getDraftYear(now?: Date): number` returns the draft year:

- The NFL Draft is always in late April
- The draft year equals the current calendar year (draft in April 2026 → year 2026, draft in April 2027 → year 2027)
- Between January and the draft date, the upcoming draft is in the current calendar year
- After the draft completes, it's still the current year until next January

This is simply `new Date().getFullYear()`. The Super Bowl timing matters for when draft *content* starts being relevant, but the year derivation is just the calendar year.

**File:** `src/scraper/utils/draft-year.ts`

## 2. Tankathon Draft Order Adapter

**File:** `src/scraper/adapters/tankathon-draft-order.ts`

- Scrapes Tankathon's draft order page for first-round pick assignments
- Captures per pick: pick number, team abbreviation, trade notes (e.g. "From CIN via trade")
- Outputs `ScrapedItem[]` with `type: "player"` and `rawData._draftOrderData: true`
- Uses `getDraftYear()` for the year — no hardcoded year
- Source attribution: `"Tankathon"`
- Confidence: `"official"` (this is derived from NFL standings/trades, not opinion)

**Data shape in `rawData`:**
```typescript
{
  _draftOrderData: true,
  picks: Array<{
    pickNumber: number;
    teamId: string;       // e.g. "LV"
    round: 1;
    tradeNote: string | null;
  }>,
  year: number,
  source: "Tankathon",
}
```

Note: The adapter outputs a single `ScrapedItem` containing all 32 picks in `rawData.picks`, rather than 32 individual items. This simplifies orchestrator processing — the orchestrator iterates the picks array within the single item.

## 3. Tankathon Prospects Adapter

**File:** `src/scraper/adapters/tankathon-prospects.ts`

- Scrapes Tankathon's consensus big board for top prospect rankings
- Captures per prospect: rank, name, position, college
- Outputs `ScrapedItem[]` with `type: "player"` and `rawData._prospectData: true`
- Uses `getDraftYear()` for the year
- Source attribution: `"Tankathon Consensus Board"`
- Confidence: `"reported"` (these are analyst opinions)

**Data shape in `rawData`:**
```typescript
{
  _prospectData: true,
  prospects: Array<{
    rank: number;
    name: string;
    position: string;
    college: string;
  }>,
  source: "Tankathon Consensus Board",
}
```

Single `ScrapedItem` containing all prospects in an array.

## 4. NFL.com Team Needs Adapter

**File:** `src/scraper/adapters/nfl-team-needs.ts`

- Scrapes NFL.com's draft needs page for positional needs per team
- Captures per team: team abbreviation, list of positional needs with priority
- Outputs `ScrapedItem[]` with `type: "player"` and `rawData._teamNeedsData: true`
- Source attribution: `"NFL.com"`
- Confidence: `"reported"` (editorial content)

**Data shape in `rawData`:**
```typescript
{
  _teamNeedsData: true,
  needs: Array<{
    teamId: string;
    position: string;
    priority: number;  // 1=critical, 2=moderate, 3=depth
  }>,
  source: "NFL.com",
}
```

Single `ScrapedItem` containing all team needs.

## 5. Orchestrator Changes

**File:** `src/scraper/orchestrator.ts`

Three new code paths in the item processing loop, alongside existing `_draftData` and `_gameData`:

### `_draftOrderData` path
1. Delete existing `draft_picks` rows where `playerName = ''` (unfilled picks only — preserve filled picks from ESPN draft adapter)
2. Insert fresh pick assignments from scraped data
3. Update `draft_meta` key `draftYear` with the scraped year
4. Update `draft_meta` key `lastUpdated`

### `_prospectData` path
1. Delete all rows from `draft_prospects`
2. Insert fresh prospect rankings from scraped data
3. Update `draft_meta` key `prospectsSource` with attribution string (e.g. "Tankathon Consensus Board")
4. Update `draft_meta` key `lastUpdated`

### `_teamNeedsData` path
1. Delete all rows from `draft_team_needs`
2. Insert fresh team needs from scraped data
3. Update `draft_meta` key `needsSource` with attribution string (e.g. "NFL.com")
4. Update `draft_meta` key `lastUpdated`

### `seedDraftDataIfEmpty()` — unchanged
Remains as fallback for fresh databases where scrapers haven't run yet. Once any of the three new adapters runs successfully, their data overwrites the seed data.

## 6. Schema Changes

**`draft_prospects` table** — Add `source` column:
```sql
ALTER TABLE draft_prospects ADD COLUMN source TEXT;
```

**`draft_team_needs` table** — Add `source` column:
```sql
ALTER TABLE draft_team_needs ADD COLUMN source TEXT;
```

These columns store the attribution string per-row (e.g. "Tankathon Consensus Board", "NFL.com"). The `draft_picks` table already has a `source`-equivalent via the scrape pipeline.

## 7. UI Attribution

Small text additions to draft page components:

- **PreDraftHub** prospect rankings tab: "Rankings: Tankathon Consensus Board" in muted text below the list
- **PreDraftHub** team needs tab: "Source: NFL.com" in muted text below the list
- Data pulled from `draft_meta` keys `prospectsSource` and `needsSource`

No other UI changes. The draft page components already render whatever is in the database.

## 8. Adapter Registration

**Files:** `src/scraper/cli.ts` and `src/app/api/scrape/route.ts`

Add three new adapters to the adapter array:
```typescript
const adapters = [
  // ...existing 6 adapters...
  new TankathonDraftOrderAdapter(),
  new TankathonProspectsAdapter(),
  new NflTeamNeedsAdapter(),
];
```

No schedule changes — the daily 6 AM UTC Vercel cron already runs all registered adapters.

## 9. Existing ESPN Draft Adapter — Unchanged

The `EspnDraftAdapter` continues to handle actual draft-night picks (filled picks with player names). It uses the `_draftData` flag. No changes needed — it complements the new adapters:

- **Pre-draft:** Tankathon adapters provide order + prospects. ESPN draft adapter returns 0 items (no picks made yet).
- **During draft:** ESPN draft adapter returns filled picks. Tankathon adapters continue providing order context.
- **Post-draft:** ESPN draft adapter has all picks. Tankathon data becomes less relevant but still seeds correctly.

## 10. Error Handling

Each adapter follows the existing pattern: if the scrape fails, the adapter returns an error `AdapterResult`. The orchestrator logs the failure to `scrape_log` and continues with other adapters. The database retains the last successful scrape's data.

No special retry logic needed — the daily cron provides natural retry. If Tankathon or NFL.com is down for a day, yesterday's data persists.

## 11. What's NOT Changing

- `vercel.json` cron schedule (daily 6 AM UTC)
- `draft-prospects.ts` static data (stays as fallback)
- Existing ESPN draft adapter
- Draft page components (except attribution text)
- Live polling endpoint (`/api/draft/live`)
- Database transaction model
- `RosterService` interface
