# NFL Draft Tracker Design Spec

## Goal

Add a `/draft` page to RosterPulse that evolves through the draft lifecycle: pre-draft hub (now), live pick tracker (draft nights), and post-draft results (after). One URL, always relevant.

## Context

The 2026 NFL Draft is April 23-25. RosterPulse already has team data, schedule, and roster infrastructure. This feature extends the site with draft coverage that ties into existing team pages.

## Architecture

### One Page, Three Modes

The `/draft` page auto-selects its display mode server-side based on the current date:

| Mode | When | Content |
|------|------|---------|
| **Pre-Draft** | Before draft day 1 (< Apr 23) | Draft order, team needs, prospect rankings, countdown |
| **Live** | Draft nights (Apr 23-25 evenings) | Real-time pick feed, "on the clock" banner, trade alerts |
| **Results** | After draft concludes (> Apr 25) | Team draft class cards with grades, pick breakdowns |

Mode determination logic:
```typescript
function getDraftMode(now: Date): "pre" | "live" | "results" {
  const draftStart = new Date("2026-04-23T20:00:00-04:00"); // 8pm ET Thu
  const draftEnd = new Date("2026-04-25T23:59:00-04:00");   // End of Sat
  
  if (now < draftStart) return "pre";
  if (now <= draftEnd) return "live";
  return "results";
}
```

During "live" mode, if no picks have been made yet for the current round/day, show pre-draft content with a "Draft starts at 8pm ET" banner.

### Data Model

**`draft_picks` table:**
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | `{year}-R{round}-P{pick}` e.g. `2026-R1-P1` |
| year | INTEGER | Draft year (2026) |
| round | INTEGER | 1-7 |
| pickNumber | INTEGER | Overall pick number (1-257) |
| teamId | TEXT | Team that made the pick (FK to teams) |
| playerName | TEXT | Player selected |
| position | TEXT | Position (QB, WR, CB, etc.) |
| college | TEXT | College/university |
| isTradeUp | INTEGER | 1 if team traded up for this pick, 0 otherwise |
| tradeNote | TEXT | Trade details if applicable, null otherwise |
| timestamp | TEXT | ISO timestamp when pick was announced (null for future picks) |

**`draft_prospects` table:**
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | Slugified name e.g. `cam-ward` |
| name | TEXT | Full name |
| position | TEXT | Position |
| college | TEXT | College |
| rank | INTEGER | Consensus big board ranking |
| projectedRound | INTEGER | Expected draft round |
| projectedPick | INTEGER | Expected overall pick (top prospects only) |

**`draft_team_needs` table:**
| Column | Type | Description |
|--------|------|-------------|
| teamId | TEXT | Team ID |
| position | TEXT | Position of need |
| priority | INTEGER | 1 = critical, 2 = moderate, 3 = depth |

**`draft_meta` table:**
| Column | Type | Description |
|--------|------|-------------|
| key | TEXT PK | Config key |
| value | TEXT | Config value (JSON) |

Keys: `draftYear`, `draftDates` (JSON array of start times per day), `currentPick`, `lastUpdated`.

### Live Updates: Aggressive Polling

During live mode, the client polls for new picks with the most aggressive approach possible on Vercel:

**Polling strategy:**
- **5-second interval** during active drafting (picks are happening)
- Polls `/api/draft/live?since={lastTimestamp}` — returns only new picks since last check
- Response includes: new picks array, current pick number, on-the-clock team, time remaining
- Empty response (no new picks) is tiny (~50 bytes), keeping bandwidth minimal

**API endpoint:** `GET /api/draft/live`
```typescript
// Response shape
{
  currentPick: number;
  onTheClock: { teamId: string; timeRemaining: number } | null;
  picks: DraftPick[];       // new picks since `since` param
  lastUpdated: string;      // ISO timestamp
  isActive: boolean;        // false between rounds/days
}
```

**Scraper-side ingestion:**
- ESPN draft API polled every **30 seconds** during draft nights via a background process (local cron or manual trigger, not Vercel function due to 60s timeout)
- Writes new picks to `draft_picks` with timestamp
- Updates `draft_meta.currentPick` atomically
- The `/api/draft/live` endpoint reads from Turso DB — fast, no computation

**Client UX for new picks:**
- New pick slides in from top with a "JUST IN" pulse animation
- Pick card shows for 3 seconds with highlight before settling into the feed
- Sound notification option (opt-in, muted by default)
- "On the Clock" banner updates instantly with new team logo and countdown

**Fallback:** Page always shows the latest DB state on load. If polling fails, manual refresh works. Stale indicator shows if last successful poll > 30s ago.

## Components

### Page Component
- **`src/app/draft/page.tsx`** — Server component. Determines mode, fetches initial data, renders appropriate sub-component.

### Pre-Draft Mode
- **`PreDraftHub`** — Main container with tabs: Draft Order | Team Needs | Top Prospects
- **`DraftCountdown`** — Countdown timer to draft day 1 (client component for ticking)
- **`DraftOrderList`** — Numbered list of picks with team logos and need badges
- **`TeamNeedsCard`** — Team name + colored priority badges (critical/moderate/depth)
- **`ProspectCard`** — Prospect name, position, college, projected range

### Live Mode
- **`LiveDraftTracker`** — Client component. Manages polling, state, animations.
- **`OnTheClockBanner`** — Team logo, name, countdown timer, pick number. Prominent, animated.
- **`LivePickFeed`** — Scrolling feed of completed picks, newest first
- **`DraftPickCard`** — Individual pick: number, team logo, player, position, college, trade badge
- **`TradeAlert`** — Slide-in notification for trades (detected via `isTradeUp` flag)
- **`RoundProgress`** — Visual progress bar showing picks made in current round

### Results Mode
- **`DraftResults`** — Container with view toggles: By Team | By Round | By Position
- **`TeamDraftClass`** — Team card showing all picks, draft grade, needs addressed
- **`DraftGradeBadge`** — Letter grade with color (A = green, B = blue, C = amber, D+ = red)
- **`RoundBreakdown`** — All picks in a round, grouped view

### Shared
- **`DraftPickCard`** — Used in both live feed and results. Shows pick #, team, player, position, college.
- **`DraftNav`** — Added to TopBar: "Draft" link next to "Schedule"

## Data Sources

### Pre-Draft Data
- **Draft order**: ESPN draft order API or manually seeded. Updates if trades occur.
- **Team needs**: Manually curated based on consensus sources. Stored in `draft_team_needs`.
- **Prospect rankings**: Top 50-100 prospects from consensus big board. Stored in `draft_prospects`.

### Live Data
- **ESPN Draft API**: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/draft` — provides pick-by-pick data during draft
- **Scraper adapter**: New `EspnDraftAdapter` class, similar pattern to `EspnScheduleAdapter`
- **Poll frequency**: Every 30s during draft nights, writing to Turso

### Post-Draft Data
- **Draft grades**: Manually assigned or scraped from ESPN team grades endpoint
- **All pick data**: Already in `draft_picks` table from live ingestion

## Data Flow

```
ESPN Draft API
    ↓ (every 30s during draft)
EspnDraftAdapter (scraper)
    ↓
Turso DB (draft_picks, draft_meta)
    ↓
/api/draft/live endpoint (reads DB)
    ↓ (every 5s polling)
LiveDraftTracker (client component)
    ↓
DraftPickCard animations + state updates
```

Pre-draft and results modes use standard server-side data fetching (no polling needed).

## Integration with Existing Site

- **TopBar**: Add "Draft" nav link
- **Team pages**: Future enhancement — link from team page to their draft picks/needs
- **Schedule page**: No changes needed

## Error Handling

- **Polling failure**: Show subtle "Connection lost" indicator, continue retrying. Don't break the page.
- **Empty draft data**: Pre-draft shows "Draft order will be updated as trades are made"
- **Stale data**: If `lastUpdated` > 60s during live mode, show "Updating..." indicator
- **ESPN API down**: Graceful degradation — show last known state with "Data may be delayed" banner

## Testing Strategy

- Unit tests for `getDraftMode()` with various dates
- Unit tests for draft data parsing (ESPN API response → DB rows)
- Component tests for mode switching logic
- Integration test for `/api/draft/live` endpoint
- Manual testing during actual draft (Apr 23-25)

## Scope Boundaries

**In scope:**
- Three-mode `/draft` page (pre, live, results)
- Draft picks database and ESPN scraper
- 5-second live polling during draft
- Pre-draft content (order, needs, prospects)
- Post-draft results with grades
- Trade detection and display

**Out of scope (future):**
- Mock draft simulator
- User predictions/brackets
- Historical draft data (prior years)
- Push notifications (requires service worker)
- Video/highlight embeds
- Social media integration
