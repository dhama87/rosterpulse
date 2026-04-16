# RosterPulse UI Enhancements Design

## Goal

Add five small, high-value features to existing views without cluttering the clean design: bye week tags, player trending indicators, key stat lines, game-day availability summaries, and division standings snippets.

## Features

### 1. Bye Week Tag

**Where:** `TeamCard` on the home page, next to the record.

**Display:** `BYE 10` in muted font-mono 11px, same style as the record line. No color or emphasis — purely informational.

**Data:** Add `byeWeek: number` to the `Team` interface. Populated in `src/data/teams.ts` with 2025 bye week values as placeholders until the 2026 schedule releases.

### 2. Player Trending Indicator

**Where:** `DepthChartRow` on the team page, next to the player name.

**Display:** Green `▲` for promoted, red `▼` for demoted. Only renders when the player has a `depthChange` value — most rows stay clean.

**Data:** Add `depthChange?: "up" | "down"` to the `Player` interface. For mock data, set on a handful of notable players. In production, the scraper will detect depth order changes on subsequent runs.

### 3. Key Stat Line

**Where:** `DepthChartRow` on the team page, new column on the right side of each starter row.

**Display:** Muted font-mono small text. Position-specific formatting:
- QB: `4,183 yds / 30 TD`
- RB: `1,012 yds / 7 TD`
- WR/TE: `68 rec / 858 yds`
- OL: `14 GS`
- DL: `8.5 sacks`
- LB: `95 tkl / 4.5 sacks`
- CB: `3 INT / 12 PD`
- S: `75 tkl / 2 INT`
- K: `28/32 FG`
- P: `45.2 avg`
- KR/PR: stat line omitted (less meaningful)
- LS: stat line omitted

**Implementation:** Pure function `getStatLine(player: Player): string` in `src/utils/statLine.ts`. Returns empty string for positions without meaningful stats.

### 4. Availability Summary

**Where:** Team page header, next to the record line.

**Display:** `2 Questionable · 1 Out · 1 IR` in small colored text matching existing status colors (amber for Questionable/Doubtful, red for Out/IR/Suspended). Only counts starters (depthOrder === 1). Hidden when all starters are active.

**Data:** Computed from existing depth chart data — no new data needed.

### 5. Division Standings Snippet

**Where:** Team page, below the team header.

**Display:** Compact single row showing all 4 division teams sorted by record (win %), current team bolded. Example: `BUF 10-3 · MIA 8-5 · **NYJ 7-6** · NE 3-10`

**Data:** Uses existing `getAllTeams()` filtered by conference + division. Record already exists on Team. Sorted by parsing win-loss from the record string.

## Files to Modify

- `src/types/index.ts` — add `byeWeek` to Team, `depthChange` to Player
- `src/data/teams.ts` — add bye week numbers to all 32 teams
- `src/data/players.ts` — add `depthChange` to a handful of players for demo
- `src/db/schema.ts` — add `depthChange` column to players table
- `src/db/seed.ts` — pass `depthChange` through to insert
- `src/scraper/orchestrator.ts` — pass `depthChange` through to insert
- `src/services/liveRosterService.ts` — map `depthChange` from DB row to Player
- `src/components/TeamCard.tsx` — add bye week label
- `src/components/DepthChartRow.tsx` — add trending arrow + stat line column
- `src/components/DepthChartGrid.tsx` — add stats column header
- `src/app/team/[teamId]/page.tsx` — add availability summary + division standings

## New File

- `src/utils/statLine.ts` — pure function for position-specific stat formatting

## Not Changing

- Service interface (`RosterService`) — no new methods needed
- News system — unrelated
- Scraper adapters — no new data sources
- Routing — no new pages
