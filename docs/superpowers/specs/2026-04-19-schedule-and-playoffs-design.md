# Schedule Page & Playoff Implications — Design Spec

## Goal

Add a weekly schedule page with bracket-style matchups, playoff implication scenarios, and a rule changes drawer. This is the first "completeness" wave — making RosterPulse a one-stop shop so users don't bounce to ESPN for schedule info.

## Architecture

New `/schedule` page with bracket-style game pairings grouped by time slot. Playoff implications engine computes specific scenarios from standings and remaining schedules. Rule changes are a static data file surfaced via a footer-triggered modal.

**Data flow:**
```
ESPN Schedule API → Scraper Adapter → Turso (games table)
                                           ↓
                              Schedule Page (brackets)
                                           ↓
                         Playoff Engine (scenarios from standings + remaining games)
```

## Tech Stack

- Next.js 16 App Router (server components)
- Turso/libsql (existing)
- ESPN scoreboard/schedule API
- Tailwind CSS 4 (existing theme)

---

## Feature 1: Schedule Page (`/schedule`)

### Layout

- Two-column layout matching existing pages: brackets on left, news feed on right (desktop)
- Mobile: brackets full-width, news in collapsible toggle (existing `MobileNewsToggle` pattern)
- "Schedule" link added to TopBar navigation

### Week Navigator

- Left/right arrows to cycle through weeks 1–18 (regular season) + playoff weeks
- Current week auto-selected based on today's date
- Week label: "WEEK 1" with date range below (e.g., "Sep 10 – Sep 14, 2026")
- URL reflects week: `/schedule?week=3`

### Bracket Matchups

- Games grouped by time slot with section headers:
  - **Thursday Night Football**
  - **Sunday Early · 1:00 PM**
  - **Sunday Late · 4:25 PM**
  - **Sunday Night Football** (blue glow border)
  - **Monday Night Football** (amber glow border)
- Each bracket shows:
  - Away team (top) and home team (bottom)
  - Team logo (ESPN logo URL from `team.logo`), name, and record
  - Game time in ET
  - Injury summary badge below bracket: "2 Questionable", "1 Out", etc. (starters only)
  - Favorite teams get a subtle highlight (use existing `useFavoriteTeams` hook — bracket needs a client component wrapper)
- Clicking a team name navigates to `/team/[teamId]`

### Bye Week

- Footer section at bottom of brackets: "Bye Week: Steelers · Jaguars · Titans · Cardinals"
- Muted text, separated from game brackets

### Primetime Styling

- SNF bracket: `border-color: rgba(59,130,246,0.2)` with subtle blue box-shadow
- MNF bracket: `border-color: rgba(245,158,11,0.2)` with subtle amber box-shadow
- TNF: standard styling (no special treatment beyond the section header)

---

## Feature 2: Playoff Implications

### Bracket Tags (inline)

Shown on individual matchup brackets from Week 12 onward:

| Tag | Condition | Style |
|-----|-----------|-------|
| `Elimination game` | Loser is mathematically eliminated | Red text below bracket |
| `Win & in` | Winner clinches a playoff spot | Green text below bracket |
| `Clinched` | Team has secured a playoff spot | Green badge next to team name |
| `Eliminated` | Team is mathematically out | Team name dimmed (opacity 0.4), strikethrough |
| `Controls destiny` | Team makes playoffs if they win out | Blue text below bracket |

### Playoff Picture Panel

Collapsible section at the top of the schedule page (below week navigator, above brackets). Hidden before Week 12. Collapsed by default, expands on click.

**Content when expanded:**

Two columns: AFC (left) and NFC (right).

Each conference shows:
- **Seeds 1–7** with team name, record, and seed number
- **In the Hunt** section: teams not yet eliminated but not currently in a playoff spot
- **Eliminated** section: teams mathematically out (greyed out)

### Scenario Engine

The scenario engine computes specific playoff scenarios for each team. This is the core differentiator — not just "in/out" but specific conditions.

**Scenario types (in priority order):**

1. **Clinched division** — "Clinched NFC North"
2. **Clinched playoff** — "Clinched wild card"
3. **Clinch scenarios** — "Clinch with a win OR a Cowboys loss"
4. **Controls own destiny** — "Win out to clinch a playoff spot"
5. **Needs help** — "Must win + need 1 of: DAL loss, SEA loss, MIN loss"
6. **Long shot** — "Must win out + need Cowboys to lose 2 of remaining 3"
7. **Eliminated** — "Eliminated from playoff contention"

**Implementation approach:**

- **Inputs:** Current standings (wins/losses), remaining schedule for all teams, division/conference membership, head-to-head records
- **Algorithm:** For each team, simulate remaining games to determine:
  - Can this team finish with enough wins to potentially claim a seed? (max possible wins)
  - What's the minimum wins needed given other teams' max possible wins?
  - Which specific games involving other teams matter?
- **Simplifications for v1:**
  - Focus on win/loss math, skip complex tiebreakers (head-to-head, strength of schedule, etc.)
  - Tiebreakers noted as "may depend on tiebreakers" when scenarios are close
  - Full tiebreaker logic is a future enhancement
- **Output:** Each team gets a `PlayoffScenario` object:
  ```typescript
  interface PlayoffScenario {
    teamId: string;
    status: "clinched_division" | "clinched_playoff" | "in_hunt" | "eliminated";
    seed?: number; // current projected seed
    scenarioText: string; // human-readable: "Clinch with a win OR a Cowboys loss"
    mustWin: boolean; // does this team need to win their next game
    relevantGames?: string[]; // other game results that matter: ["DAL@PHI", "SEA@DEN"]
  }
  ```

**When to compute:** Playoff scenarios are computed on-demand when rendering the schedule page (server component). The computation uses data already in the DB (standings from team records, schedule from games table). No separate scrape needed.

**Activation:** Playoff implications UI only renders when `currentWeek >= PLAYOFF_IMPLICATIONS_START_WEEK` (default: 12, configurable as a constant). Before that week, the playoff picture panel and bracket tags are not shown.

---

## Feature 3: Rule Changes (Footer Modal)

### Footer Link

- Add "2026 Rule Changes" text link to existing `Footer` component
- Positioned on the right side of the footer (after the copyright)

### Modal/Drawer

- Slide-up drawer from bottom of screen (not a full page)
- Dark themed, matching existing design system
- Dismissible: click outside, X button, or Escape key
- Max height: 70vh with scroll

### Content

- Title: "2026 NFL Rule Changes"
- List of rules, each with:
  - Rule name (bold)
  - One-line description
- Stored in `src/data/rule-changes.ts` as a simple array:
  ```typescript
  export const ruleChanges: { title: string; description: string }[] = [
    // Updated once per year
  ];
  ```
- Empty array = link hidden from footer (no empty modal)

---

## Feature 4: Data Pipeline Additions

### New Table: `games`

```sql
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,           -- "2026-W01-KC-BAL"
  week INTEGER NOT NULL,
  seasonType TEXT NOT NULL,      -- "regular" | "postseason"
  awayTeam TEXT NOT NULL,
  homeTeam TEXT NOT NULL,
  gameTime TEXT NOT NULL,        -- ISO 8601
  tvNetwork TEXT,                -- "NBC", "ESPN", "FOX", etc.
  awayScore INTEGER,            -- null if game hasn't started
  homeScore INTEGER,
  status TEXT NOT NULL DEFAULT 'scheduled', -- "scheduled" | "in_progress" | "final"
  updatedAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_games_week ON games(week);
CREATE INDEX IF NOT EXISTS idx_games_teams ON games(awayTeam, homeTeam);
```

### ESPN Schedule Adapter

New adapter: `EspnScheduleAdapter`
- Fetches from ESPN scoreboard API: `site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?week=N&seasontype=2`
- Extracts: teams, game time, TV network, scores (if game completed)
- Runs as part of the daily scrape alongside existing adapters
- For initial load, fetches all 18 weeks. Daily scrape only fetches current week + next week.

### RosterService Additions

New methods on the `RosterService` interface:
```typescript
getWeekGames(week: number): Promise<Game[]>;
getCurrentWeek(): Promise<number>;
```

`Game` type:
```typescript
interface Game {
  id: string;
  week: number;
  awayTeam: Team;
  homeTeam: Team;
  gameTime: string;
  tvNetwork?: string;
  awayScore?: number;
  homeScore?: number;
  status: "scheduled" | "in_progress" | "final";
}
```

---

## Feature 5: Navigation

- Add "Schedule" link to `TopBar` component, next to the logo/site name
- Simple text link, same style as existing nav elements
- Active state when on `/schedule` page
- Mobile: link visible in the top bar (no hamburger menu needed — it's just one link)

---

## Out of Scope

- Live game scores / real-time updates during games (future wave)
- Full NFL tiebreaker logic (strength of schedule, common games, etc.)
- User accounts or push notifications
- Historical schedule data (previous seasons)
- Betting lines or odds
- Game predictions or power rankings

---

## Page Summary

| Page | Route | Data Source |
|------|-------|-------------|
| Schedule | `/schedule?week=N` | `games` table + `teams` data + playoff engine |

## Component Summary

| Component | Type | Purpose |
|-----------|------|---------|
| `ScheduleBracket` | Server | Single game bracket (away vs home) |
| `ScheduleGrid` | Client | Week navigator + bracket grid + favorite highlights |
| `PlayoffPicture` | Server | Collapsible AFC/NFC standings + scenarios |
| `PlayoffTag` | Server | Inline bracket tag ("Win & in", "Eliminated", etc.) |
| `RuleChangesModal` | Client | Footer-triggered drawer with rule changes list |
| `EspnScheduleAdapter` | Server | Scraper adapter for ESPN schedule API |
| `PlayoffEngine` | Server | Computes playoff scenarios from standings + schedule |
