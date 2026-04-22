# Auto-Updating Draft Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace static draft data with three scraper adapters (Tankathon draft order, Tankathon prospects, NFL.com team needs) that auto-populate daily via the existing cron.

**Architecture:** Three new `SourceAdapter` classes scrape HTML pages and output `ScrapedItem[]` with discriminator flags (`_draftOrderData`, `_prospectData`, `_teamNeedsData`). The orchestrator routes items to draft tables. A `getDraftYear()` utility auto-detects the year. The existing `EspnDraftAdapter` for actual draft-night picks is unchanged.

**Tech Stack:** TypeScript, SourceAdapter interface, regex HTML parsing (no new dependencies), Turso/libsql, Jest.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/scraper/utils/draft-year.ts` | `getDraftYear()` utility |
| `src/scraper/adapters/tankathon-draft-order.ts` | Scrapes Tankathon draft order page |
| `src/scraper/adapters/tankathon-prospects.ts` | Scrapes Tankathon big board page |
| `src/scraper/adapters/nfl-team-needs.ts` | Scrapes NFL.com draft page for team needs |
| `src/scraper/__tests__/utils/draft-year.test.ts` | Tests for draft year utility |
| `src/scraper/__tests__/adapters/tankathon-draft-order.test.ts` | Tests for draft order adapter |
| `src/scraper/__tests__/adapters/tankathon-prospects.test.ts` | Tests for prospects adapter |
| `src/scraper/__tests__/adapters/nfl-team-needs.test.ts` | Tests for team needs adapter |
| `src/scraper/orchestrator.ts` | Add three new item processing code paths |
| `src/db/schema.ts` | Add `source` column to `draft_prospects` and `draft_team_needs` |
| `src/scraper/cli.ts` | Register three new adapters |
| `src/app/api/scrape/route.ts` | Register three new adapters |
| `src/scraper/adapters/espn-draft.ts` | Use `getDraftYear()` instead of hardcoded 2026 |
| `src/components/draft/PreDraftHub.tsx` | Add attribution text for prospects and team needs |
| `src/app/draft/page.tsx` | Pass `draftMeta` to PreDraftHub for attribution sources |

---

### Task 1: getDraftYear Utility

**Files:**
- Create: `src/scraper/utils/draft-year.ts`
- Create: `src/scraper/__tests__/utils/draft-year.test.ts`

- [ ] **Step 1: Write the test**

```typescript
// src/scraper/__tests__/utils/draft-year.test.ts
import { getDraftYear } from "../../utils/draft-year";

describe("getDraftYear", () => {
  it("returns current calendar year", () => {
    const result = getDraftYear(new Date("2026-04-22T12:00:00Z"));
    expect(result).toBe(2026);
  });

  it("returns current year in January (pre-Super Bowl)", () => {
    const result = getDraftYear(new Date("2027-01-15T12:00:00Z"));
    expect(result).toBe(2027);
  });

  it("returns current year in December", () => {
    const result = getDraftYear(new Date("2026-12-31T12:00:00Z"));
    expect(result).toBe(2026);
  });

  it("uses current date when no argument", () => {
    const result = getDraftYear();
    expect(result).toBe(new Date().getFullYear());
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/scraper/__tests__/utils/draft-year.test.ts --no-coverage`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write the implementation**

```typescript
// src/scraper/utils/draft-year.ts
export function getDraftYear(now?: Date): number {
  const date = now ?? new Date();
  return date.getFullYear();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/scraper/__tests__/utils/draft-year.test.ts --no-coverage`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/scraper/utils/draft-year.ts src/scraper/__tests__/utils/draft-year.test.ts
git commit -m "feat: add getDraftYear utility"
```

---

### Task 2: Tankathon Draft Order Adapter

**Files:**
- Create: `src/scraper/adapters/tankathon-draft-order.ts`
- Create: `src/scraper/__tests__/adapters/tankathon-draft-order.test.ts`

**Context:** Tankathon's draft order page at `https://tankathon.com/nfl` renders server-side HTML with this structure:
- Each pick is a `<tr class="pick-row">`
- Pick number: `<span class="pick-num">1</span>`
- Team logo: `<img class="logo-thumb" src="http://d2uki2uvp6v3wr.cloudfront.net/nfl/lv.svg" />` (filename is lowercase team abbreviation)
- Traded picks: `<div class="trade">` contains `<span class="desktop">NYG</span>` (acquiring team abbreviation)

- [ ] **Step 1: Write the test**

```typescript
// src/scraper/__tests__/adapters/tankathon-draft-order.test.ts
import { TankathonDraftOrderAdapter } from "../../adapters/tankathon-draft-order";

const SAMPLE_HTML = `
<html><body>
<table>
  <tr class="pick-row">
    <td class="pick"><div class="pick-container"><span class="pick-num">1</span></div></td>
    <td class="name">
      <a href="/nfl/raiders">
        <div class="team-link">
          <div class="team-link-section team-link-logo">
            <img class="logo-thumb" src="http://d2uki2uvp6v3wr.cloudfront.net/nfl/lv.svg" />
          </div>
          <div class="team-link-section">
            <div class="desktop">Las Vegas</div>
          </div>
        </div>
      </a>
    </td>
  </tr>
  <tr class="pick-row">
    <td class="pick"><div class="pick-container"><span class="pick-num">10</span></div></td>
    <td class="name">
      <a href="/nfl/bengals">
        <div class="team-link">
          <div class="team-link-section team-link-logo">
            <img class="logo-thumb" src="http://d2uki2uvp6v3wr.cloudfront.net/nfl/cin.svg" />
          </div>
          <div class="team-link-section disabled">
            <div class="desktop">Cincinnati</div>
          </div>
        </div>
        <div class="trade">
          <a href="/nfl/giants"><i class="fa fa-arrow-circle-right"></i><span class="desktop">NYG</span></a>
        </div>
      </a>
    </td>
  </tr>
</table>
</body></html>
`;

function makeOkResponse(body: string): Response {
  return {
    ok: true,
    text: () => Promise.resolve(body),
  } as unknown as Response;
}

function makeErrorResponse(): Response {
  return {
    ok: false,
    text: () => Promise.reject(new Error("Not found")),
  } as unknown as Response;
}

describe("TankathonDraftOrderAdapter", () => {
  let adapter: TankathonDraftOrderAdapter;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    adapter = new TankathonDraftOrderAdapter();
    fetchSpy = jest.spyOn(global, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("has correct name", () => {
    expect(adapter.name).toBe("tankathon-draft-order");
  });

  it("parses draft order from HTML", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse(SAMPLE_HTML));

    const items = await adapter.fetch();

    expect(items).toHaveLength(1);
    expect(items[0].rawData._draftOrderData).toBe(true);

    const picks = items[0].rawData.picks as Array<Record<string, unknown>>;
    expect(picks).toHaveLength(2);
    expect(picks[0]).toEqual(
      expect.objectContaining({ pickNumber: 1, teamId: "LV", tradeNote: null })
    );
  });

  it("detects traded picks", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse(SAMPLE_HTML));

    const items = await adapter.fetch();
    const picks = items[0].rawData.picks as Array<Record<string, unknown>>;

    expect(picks[1]).toEqual(
      expect.objectContaining({
        pickNumber: 10,
        teamId: "NYG",
        tradeNote: "From CIN via trade",
      })
    );
  });

  it("returns empty array on fetch failure", async () => {
    fetchSpy.mockResolvedValueOnce(makeErrorResponse());

    const items = await adapter.fetch();
    expect(items).toHaveLength(0);
  });

  it("sets confidence to official", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse(SAMPLE_HTML));

    const items = await adapter.fetch();
    expect(items[0].confidence).toBe("official");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/scraper/__tests__/adapters/tankathon-draft-order.test.ts --no-coverage`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write the implementation**

```typescript
// src/scraper/adapters/tankathon-draft-order.ts
import { SourceAdapter, ScrapedItem } from "../types";
import { getDraftYear } from "../utils/draft-year";

interface ParsedPick {
  pickNumber: number;
  teamId: string;
  round: number;
  tradeNote: string | null;
}

function parsePickRows(html: string): ParsedPick[] {
  const picks: ParsedPick[] = [];
  // Match each pick-row table row
  const rowRegex = /<tr class="pick-row">([\s\S]*?)<\/tr>/g;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const row = rowMatch[1];

    // Extract pick number
    const pickNumMatch = row.match(/<span class="pick-num">(\d+)<\/span>/);
    if (!pickNumMatch) continue;
    const pickNumber = parseInt(pickNumMatch[1], 10);

    // Extract team abbreviation from logo src (e.g., /nfl/lv.svg → LV)
    const logoMatch = row.match(/logo-thumb"[^>]*src="[^"]*\/nfl\/([a-z]+)\.svg"/);
    if (!logoMatch) continue;
    const originalTeamId = logoMatch[1].toUpperCase();

    // Check for trade — look for div.trade with acquiring team abbreviation
    const tradeMatch = row.match(/<div class="trade">[\s\S]*?<span class="desktop">([A-Z]+)<\/span>/);

    let teamId: string;
    let tradeNote: string | null;
    if (tradeMatch) {
      teamId = tradeMatch[1];
      tradeNote = `From ${originalTeamId} via trade`;
    } else {
      teamId = originalTeamId;
      tradeNote = null;
    }

    picks.push({ pickNumber, teamId, round: 1, tradeNote });
  }

  return picks;
}

export class TankathonDraftOrderAdapter implements SourceAdapter {
  name = "tankathon-draft-order";

  async fetch(): Promise<ScrapedItem[]> {
    const url = "https://tankathon.com/nfl";
    const now = new Date().toISOString();
    const year = getDraftYear();

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(30_000),
        headers: { "User-Agent": "RosterPulse/1.0" },
      });
      if (!response.ok) return [];

      const html = await response.text();
      const picks = parsePickRows(html);
      if (picks.length === 0) return [];

      return [
        {
          type: "player",
          sourceAdapter: this.name,
          source: "Tankathon",
          sourceUrl: url,
          confidence: "official",
          fetchedAt: now,
          rawData: {
            _draftOrderData: true,
            picks,
            year,
            source: "Tankathon",
          },
        },
      ];
    } catch {
      return [];
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/scraper/__tests__/adapters/tankathon-draft-order.test.ts --no-coverage`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/scraper/adapters/tankathon-draft-order.ts src/scraper/__tests__/adapters/tankathon-draft-order.test.ts
git commit -m "feat: add Tankathon draft order scraper adapter"
```

---

### Task 3: Tankathon Prospects Adapter

**Files:**
- Create: `src/scraper/adapters/tankathon-prospects.ts`
- Create: `src/scraper/__tests__/adapters/tankathon-prospects.test.ts`

**Context:** Tankathon's big board at `https://tankathon.com/nfl/big_board` (note underscore, NOT hyphen) renders server-side HTML:
- Each prospect: `<div class="mock-row nfl" data-pos="LB/EDGE">`
- Rank: `<div class="mock-row-pick-number">1</div>`
- Name: `<div class="mock-row-name">Arvell Reese</div>`
- School/position: `<div class="mock-row-school-position">LB/EDGE | Ohio State </div>`

- [ ] **Step 1: Write the test**

```typescript
// src/scraper/__tests__/adapters/tankathon-prospects.test.ts
import { TankathonProspectsAdapter } from "../../adapters/tankathon-prospects";

const SAMPLE_HTML = `
<html><body>
<div id="big-board">
  <div class="mock-rows">
    <div class="mock-row nfl" data-pos="LB/EDGE">
      <div class="mock-row-pick-number">1</div>
      <div class="mock-row-logo"><a href="/nfl/colleges/ohio-state"><img alt="Ohio State" /></a></div>
      <div class="mock-row-player">
        <a class="primary-hover" href="/nfl/players/arvell-reese">
          <div class="mock-row-name">Arvell Reese</div>
          <div class="mock-row-school-position">LB/EDGE | Ohio State </div>
        </a>
      </div>
    </div>
    <div class="mock-row nfl" data-pos="S">
      <div class="mock-row-pick-number">2</div>
      <div class="mock-row-logo"><a href="/nfl/colleges/ohio-state"><img alt="Ohio State" /></a></div>
      <div class="mock-row-player">
        <a class="primary-hover" href="/nfl/players/caleb-downs">
          <div class="mock-row-name">Caleb Downs</div>
          <div class="mock-row-school-position">S | Ohio State </div>
        </a>
      </div>
    </div>
    <div class="mock-row nfl" data-pos="QB">
      <div class="mock-row-pick-number">3</div>
      <div class="mock-row-logo"><a href="/nfl/colleges/indiana"><img alt="Indiana" /></a></div>
      <div class="mock-row-player">
        <a class="primary-hover" href="/nfl/players/fernando-mendoza">
          <div class="mock-row-name">Fernando Mendoza</div>
          <div class="mock-row-school-position">QB | Indiana </div>
        </a>
      </div>
    </div>
  </div>
</div>
</body></html>
`;

function makeOkResponse(body: string): Response {
  return {
    ok: true,
    text: () => Promise.resolve(body),
  } as unknown as Response;
}

function makeErrorResponse(): Response {
  return {
    ok: false,
    text: () => Promise.reject(new Error("Not found")),
  } as unknown as Response;
}

describe("TankathonProspectsAdapter", () => {
  let adapter: TankathonProspectsAdapter;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    adapter = new TankathonProspectsAdapter();
    fetchSpy = jest.spyOn(global, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("has correct name", () => {
    expect(adapter.name).toBe("tankathon-prospects");
  });

  it("parses prospects from HTML", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse(SAMPLE_HTML));

    const items = await adapter.fetch();

    expect(items).toHaveLength(1);
    expect(items[0].rawData._prospectData).toBe(true);

    const prospects = items[0].rawData.prospects as Array<Record<string, unknown>>;
    expect(prospects).toHaveLength(3);
    expect(prospects[0]).toEqual({
      rank: 1,
      name: "Arvell Reese",
      position: "LB/EDGE",
      college: "Ohio State",
    });
    expect(prospects[1]).toEqual({
      rank: 2,
      name: "Caleb Downs",
      position: "S",
      college: "Ohio State",
    });
  });

  it("extracts position from data-pos attribute", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse(SAMPLE_HTML));

    const items = await adapter.fetch();
    const prospects = items[0].rawData.prospects as Array<Record<string, unknown>>;

    expect(prospects[2]).toEqual(
      expect.objectContaining({ position: "QB", college: "Indiana" })
    );
  });

  it("returns empty array on fetch failure", async () => {
    fetchSpy.mockResolvedValueOnce(makeErrorResponse());

    const items = await adapter.fetch();
    expect(items).toHaveLength(0);
  });

  it("sets confidence to reported", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse(SAMPLE_HTML));

    const items = await adapter.fetch();
    expect(items[0].confidence).toBe("reported");
  });

  it("includes source attribution", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse(SAMPLE_HTML));

    const items = await adapter.fetch();
    expect(items[0].rawData.source).toBe("Tankathon Consensus Board");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/scraper/__tests__/adapters/tankathon-prospects.test.ts --no-coverage`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write the implementation**

```typescript
// src/scraper/adapters/tankathon-prospects.ts
import { SourceAdapter, ScrapedItem } from "../types";

interface ParsedProspect {
  rank: number;
  name: string;
  position: string;
  college: string;
}

function parseProspects(html: string): ParsedProspect[] {
  const prospects: ParsedProspect[] = [];
  // Match each mock-row div with data-pos attribute
  const rowRegex = /<div class="mock-row nfl" data-pos="([^"]+)">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const position = rowMatch[1];
    const row = rowMatch[2];

    // Extract rank
    const rankMatch = row.match(/<div class="mock-row-pick-number">(\d+)<\/div>/);
    if (!rankMatch) continue;
    const rank = parseInt(rankMatch[1], 10);

    // Extract name
    const nameMatch = row.match(/<div class="mock-row-name">([^<]+)<\/div>/);
    if (!nameMatch) continue;
    const name = nameMatch[1].trim();

    // Extract college from school-position text (format: "POS | College ")
    const schoolMatch = row.match(/<div class="mock-row-school-position">[^|]+\|\s*([^<]+)<\/div>/);
    const college = schoolMatch ? schoolMatch[1].trim() : "";

    prospects.push({ rank, name, position, college });
  }

  return prospects;
}

export class TankathonProspectsAdapter implements SourceAdapter {
  name = "tankathon-prospects";

  async fetch(): Promise<ScrapedItem[]> {
    const url = "https://tankathon.com/nfl/big_board";
    const now = new Date().toISOString();

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(30_000),
        headers: { "User-Agent": "RosterPulse/1.0" },
      });
      if (!response.ok) return [];

      const html = await response.text();
      const prospects = parseProspects(html);
      if (prospects.length === 0) return [];

      return [
        {
          type: "player",
          sourceAdapter: this.name,
          source: "Tankathon Consensus Board",
          sourceUrl: url,
          confidence: "reported",
          fetchedAt: now,
          rawData: {
            _prospectData: true,
            prospects,
            source: "Tankathon Consensus Board",
          },
        },
      ];
    } catch {
      return [];
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/scraper/__tests__/adapters/tankathon-prospects.test.ts --no-coverage`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/scraper/adapters/tankathon-prospects.ts src/scraper/__tests__/adapters/tankathon-prospects.test.ts
git commit -m "feat: add Tankathon prospects scraper adapter"
```

---

### Task 4: NFL.com Team Needs Adapter

**Files:**
- Create: `src/scraper/adapters/nfl-team-needs.ts`
- Create: `src/scraper/__tests__/adapters/nfl-team-needs.test.ts`

**Context:** NFL.com's draft page at `https://www.nfl.com/draft/` uses React Server Components. The page contains `self.__next_f.push(...)` script tags with JSON payloads. Each draft pick card has:
```json
{
  "cardDescription": "NEEDS: QB, WR, OL",
  "cardTitle": "RAIDERS",
  "teamLogo": "https://static.www.nfl.com/{formatInstructions}/league/api/clubs/logos/LV",
  "pickNumber": 1,
  "type": 5
}
```
Team abbreviation is extracted from the logo URL (`/logos/LV`). Needs are parsed from `cardDescription`. Priority is derived from order (first = 1, second = 2, third = 3).

A mapping from team full name (e.g., "RAIDERS") to abbreviation is needed as a fallback.

- [ ] **Step 1: Write the test**

```typescript
// src/scraper/__tests__/adapters/nfl-team-needs.test.ts
import { NflTeamNeedsAdapter } from "../../adapters/nfl-team-needs";

const SAMPLE_HTML = `
<html><body>
<script>self.__next_f.push([1,"some irrelevant data"])</script>
<script>self.__next_f.push([1,"[\\"$\\",\\"div\\",null,{\\"children\\":[\\"$\\",\\"$L1\\",null,{\\"cardDescription\\":\\"NEEDS: QB, WR, OL\\",\\"cardTitle\\":\\"RAIDERS\\",\\"href\\":\\"/draft/tracker/2026/teams/las-vegas-raiders\\",\\"pickNumber\\":1,\\"teamLogo\\":\\"https://static.www.nfl.com/{formatInstructions}/league/api/clubs/logos/LV\\",\\"type\\":5}]}]"])</script>
<script>self.__next_f.push([1,"[\\"$\\",\\"div\\",null,{\\"children\\":[\\"$\\",\\"$L1\\",null,{\\"cardDescription\\":\\"NEEDS: OL, EDGE, WR\\",\\"cardTitle\\":\\"JETS\\",\\"href\\":\\"/draft/tracker/2026/teams/new-york-jets\\",\\"pickNumber\\":2,\\"teamLogo\\":\\"https://static.www.nfl.com/{formatInstructions}/league/api/clubs/logos/NYJ\\",\\"type\\":5}]}]"])</script>
</body></html>
`;

function makeOkResponse(body: string): Response {
  return {
    ok: true,
    text: () => Promise.resolve(body),
  } as unknown as Response;
}

function makeErrorResponse(): Response {
  return {
    ok: false,
    text: () => Promise.reject(new Error("Not found")),
  } as unknown as Response;
}

describe("NflTeamNeedsAdapter", () => {
  let adapter: NflTeamNeedsAdapter;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    adapter = new NflTeamNeedsAdapter();
    fetchSpy = jest.spyOn(global, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("has correct name", () => {
    expect(adapter.name).toBe("nfl-team-needs");
  });

  it("parses team needs from RSC payload", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse(SAMPLE_HTML));

    const items = await adapter.fetch();

    expect(items).toHaveLength(1);
    expect(items[0].rawData._teamNeedsData).toBe(true);

    const needs = items[0].rawData.needs as Array<Record<string, unknown>>;
    // 2 teams * 3 needs each = 6 entries
    expect(needs).toHaveLength(6);
    expect(needs[0]).toEqual({ teamId: "LV", position: "QB", priority: 1 });
    expect(needs[1]).toEqual({ teamId: "LV", position: "WR", priority: 2 });
    expect(needs[2]).toEqual({ teamId: "LV", position: "OL", priority: 3 });
    expect(needs[3]).toEqual({ teamId: "NYJ", position: "OL", priority: 1 });
  });

  it("extracts team abbreviation from logo URL", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse(SAMPLE_HTML));

    const items = await adapter.fetch();
    const needs = items[0].rawData.needs as Array<Record<string, unknown>>;
    const teamIds = [...new Set(needs.map((n) => n.teamId))];

    expect(teamIds).toContain("LV");
    expect(teamIds).toContain("NYJ");
  });

  it("deduplicates teams with multiple picks", async () => {
    // Simulate NYG having picks #5 and #10
    const htmlWithDupe = `
<html><body>
<script>self.__next_f.push([1,"{\\"cardDescription\\":\\"NEEDS: EDGE, OL, CB\\",\\"cardTitle\\":\\"GIANTS\\",\\"teamLogo\\":\\"https://static.www.nfl.com/{formatInstructions}/league/api/clubs/logos/NYG\\",\\"pickNumber\\":5,\\"type\\":5}"])</script>
<script>self.__next_f.push([1,"{\\"cardDescription\\":\\"NEEDS: EDGE, OL, CB\\",\\"cardTitle\\":\\"GIANTS\\",\\"teamLogo\\":\\"https://static.www.nfl.com/{formatInstructions}/league/api/clubs/logos/NYG\\",\\"pickNumber\\":10,\\"type\\":5}"])</script>
</body></html>
`;
    fetchSpy.mockResolvedValueOnce(makeOkResponse(htmlWithDupe));

    const items = await adapter.fetch();
    const needs = items[0].rawData.needs as Array<Record<string, unknown>>;

    // Should only have 3 entries for NYG (not 6)
    expect(needs).toHaveLength(3);
  });

  it("returns empty array on fetch failure", async () => {
    fetchSpy.mockResolvedValueOnce(makeErrorResponse());

    const items = await adapter.fetch();
    expect(items).toHaveLength(0);
  });

  it("sets confidence to reported", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse(SAMPLE_HTML));

    const items = await adapter.fetch();
    expect(items[0].confidence).toBe("reported");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/scraper/__tests__/adapters/nfl-team-needs.test.ts --no-coverage`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write the implementation**

```typescript
// src/scraper/adapters/nfl-team-needs.ts
import { SourceAdapter, ScrapedItem } from "../types";

interface ParsedNeed {
  teamId: string;
  position: string;
  priority: number;
}

function parseTeamNeeds(html: string): ParsedNeed[] {
  const needs: ParsedNeed[] = [];
  const seenTeams = new Set<string>();

  // Find all cardDescription/cardTitle/teamLogo patterns in the RSC payload
  // These appear as escaped JSON within self.__next_f.push script tags
  const cardRegex = /"cardDescription"\s*:\s*"NEEDS:\s*([^"]+)"\s*,\s*"cardTitle"\s*:\s*"([^"]+)"\s*,\s*"href"\s*:\s*"[^"]*"\s*,\s*"pickNumber"\s*:\s*\d+\s*,\s*"teamLogo"\s*:\s*"[^"]*\/logos\/([A-Z]+)"/g;
  let match;

  while ((match = cardRegex.exec(html)) !== null) {
    const needsStr = match[1]; // e.g., "QB, WR, OL"
    const teamId = match[3]; // e.g., "LV"

    // Skip duplicate teams (teams with multiple picks appear multiple times)
    if (seenTeams.has(teamId)) continue;
    seenTeams.add(teamId);

    const positions = needsStr.split(",").map((s) => s.trim());
    for (let i = 0; i < positions.length; i++) {
      needs.push({
        teamId,
        position: positions[i],
        priority: i + 1,
      });
    }
  }

  return needs;
}

export class NflTeamNeedsAdapter implements SourceAdapter {
  name = "nfl-team-needs";

  async fetch(): Promise<ScrapedItem[]> {
    const url = "https://www.nfl.com/draft/";
    const now = new Date().toISOString();

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(30_000),
        headers: { "User-Agent": "RosterPulse/1.0" },
      });
      if (!response.ok) return [];

      const html = await response.text();
      const needs = parseTeamNeeds(html);
      if (needs.length === 0) return [];

      return [
        {
          type: "player",
          sourceAdapter: this.name,
          source: "NFL.com",
          sourceUrl: url,
          confidence: "reported",
          fetchedAt: now,
          rawData: {
            _teamNeedsData: true,
            needs,
            source: "NFL.com",
          },
        },
      ];
    } catch {
      return [];
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/scraper/__tests__/adapters/nfl-team-needs.test.ts --no-coverage`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/scraper/adapters/nfl-team-needs.ts src/scraper/__tests__/adapters/nfl-team-needs.test.ts
git commit -m "feat: add NFL.com team needs scraper adapter"
```

---

### Task 5: Schema Migration — Add Source Columns

**Files:**
- Modify: `src/db/schema.ts`

**Context:** The `draft_prospects` and `draft_team_needs` tables need a `source` column for attribution. Since Turso/libsql supports `ALTER TABLE ADD COLUMN`, we add the migration alongside the existing `CREATE TABLE IF NOT EXISTS` statements.

- [ ] **Step 1: Add source columns to schema**

In `src/db/schema.ts`, find the `draft_prospects` table creation and add the `source` column. Then find `draft_team_needs` and add `source` there too. Also add `ALTER TABLE` statements after the `CREATE TABLE` blocks to handle existing databases.

Add after the existing `CREATE INDEX IF NOT EXISTS idx_draft_team_needs_team` line:

```typescript
    -- Add source columns for attribution (idempotent via try/catch in code)
    ALTER TABLE draft_prospects ADD COLUMN source TEXT;
    ALTER TABLE draft_team_needs ADD COLUMN source TEXT;
```

However, `ALTER TABLE ADD COLUMN` will error if the column already exists. Since SQLite doesn't support `IF NOT EXISTS` for `ALTER TABLE ADD COLUMN`, wrap these in a separate try-catch block after the main `CREATE TABLE` batch.

Modify the `createTables` function: after the existing `await db.executeMultiple(...)` call, add:

```typescript
  // Add source columns (idempotent — ignore error if column already exists)
  for (const stmt of [
    "ALTER TABLE draft_prospects ADD COLUMN source TEXT",
    "ALTER TABLE draft_team_needs ADD COLUMN source TEXT",
  ]) {
    try {
      await db.execute(stmt);
    } catch {
      // Column already exists — ignore
    }
  }
```

- [ ] **Step 2: Verify dev server still starts**

Run: `npx next build --experimental-build-mode compile 2>&1 | tail -5` or simply restart the dev server and confirm no errors.

- [ ] **Step 3: Commit**

```bash
git add src/db/schema.ts
git commit -m "feat: add source columns to draft_prospects and draft_team_needs"
```

---

### Task 6: Orchestrator — Add Three New Code Paths

**Files:**
- Modify: `src/scraper/orchestrator.ts`

**Context:** The orchestrator's item processing loop currently handles `_gameData`, `_draftData`, player, and news items. We need to add three new branches for `_draftOrderData`, `_prospectData`, and `_teamNeedsData`. These should come BEFORE the existing `_draftData` check (at line 163) since the new flags are also on `type: "player"` items.

The key difference from existing paths: these new items contain arrays of data in a single `ScrapedItem` (not one item per row). The orchestrator iterates the array within the item.

- [ ] **Step 1: Add the three new code paths**

In `src/scraper/orchestrator.ts`, find this block (around line 147):

```typescript
        if (item.type === "player" && item.rawData._gameData) {
```

Insert the three new branches BEFORE this line:

```typescript
        if (item.type === "player" && item.rawData._draftOrderData) {
          const picks = item.rawData.picks as Array<{
            pickNumber: number;
            teamId: string;
            round: number;
            tradeNote: string | null;
          }>;
          const year = item.rawData.year as number;
          // Clear unfilled picks (preserve filled picks from ESPN draft adapter)
          await tx.execute("DELETE FROM draft_picks WHERE playerName = ''");
          for (const pick of picks) {
            await tx.execute({
              sql: `INSERT OR IGNORE INTO draft_picks
                (id, year, round, pickNumber, teamId, playerName, position, college,
                 isTradeUp, tradeNote, timestamp, updatedAt)
              VALUES (?, ?, ?, ?, ?, '', '', '', ?, ?, NULL, ?)`,
              args: [
                `${year}-R${pick.round}-P${pick.pickNumber}`,
                year, pick.round, pick.pickNumber, pick.teamId,
                pick.tradeNote ? 1 : 0, pick.tradeNote, item.fetchedAt,
              ],
            });
          }
          await tx.execute({
            sql: `INSERT OR REPLACE INTO draft_meta (key, value, updatedAt) VALUES ('draftYear', ?, ?)`,
            args: [String(year), item.fetchedAt],
          });
          await tx.execute({
            sql: `INSERT OR REPLACE INTO draft_meta (key, value, updatedAt) VALUES ('lastUpdated', ?, ?)`,
            args: [item.fetchedAt, item.fetchedAt],
          });
          itemsNew += picks.length;
        } else if (item.type === "player" && item.rawData._prospectData) {
          const prospects = item.rawData.prospects as Array<{
            rank: number;
            name: string;
            position: string;
            college: string;
          }>;
          const source = item.rawData.source as string;
          await tx.execute("DELETE FROM draft_prospects");
          for (const p of prospects) {
            const id = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            await tx.execute({
              sql: `INSERT INTO draft_prospects
                (id, name, position, college, rank, projectedRound, projectedPick, source, updatedAt)
              VALUES (?, ?, ?, ?, ?, 1, NULL, ?, ?)`,
              args: [id, p.name, p.position, p.college, p.rank, source, item.fetchedAt],
            });
          }
          await tx.execute({
            sql: `INSERT OR REPLACE INTO draft_meta (key, value, updatedAt) VALUES ('prospectsSource', ?, ?)`,
            args: [source, item.fetchedAt],
          });
          await tx.execute({
            sql: `INSERT OR REPLACE INTO draft_meta (key, value, updatedAt) VALUES ('lastUpdated', ?, ?)`,
            args: [item.fetchedAt, item.fetchedAt],
          });
          itemsNew += prospects.length;
        } else if (item.type === "player" && item.rawData._teamNeedsData) {
          const needs = item.rawData.needs as Array<{
            teamId: string;
            position: string;
            priority: number;
          }>;
          const source = item.rawData.source as string;
          await tx.execute("DELETE FROM draft_team_needs");
          for (const n of needs) {
            await tx.execute({
              sql: `INSERT INTO draft_team_needs
                (id, teamId, position, priority, source, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?)`,
              args: [`${n.teamId}-${n.position}`, n.teamId, n.position, n.priority, source, item.fetchedAt],
            });
          }
          await tx.execute({
            sql: `INSERT OR REPLACE INTO draft_meta (key, value, updatedAt) VALUES ('needsSource', ?, ?)`,
            args: [source, item.fetchedAt],
          });
          await tx.execute({
            sql: `INSERT OR REPLACE INTO draft_meta (key, value, updatedAt) VALUES ('lastUpdated', ?, ?)`,
            args: [item.fetchedAt, item.fetchedAt],
          });
          itemsNew += needs.length;
        } else if (item.type === "player" && item.rawData._gameData) {
```

Note: The last `else if` replaces the existing `if` for `_gameData` — it's now part of the chain.

- [ ] **Step 2: Run existing tests to verify nothing is broken**

Run: `npx jest src/scraper/ --no-coverage`
Expected: All existing tests pass

- [ ] **Step 3: Commit**

```bash
git add src/scraper/orchestrator.ts
git commit -m "feat: add orchestrator code paths for draft order, prospects, and team needs"
```

---

### Task 7: Register Adapters and Update EspnDraftAdapter

**Files:**
- Modify: `src/scraper/cli.ts`
- Modify: `src/app/api/scrape/route.ts`
- Modify: `src/scraper/adapters/espn-draft.ts`

- [ ] **Step 1: Update EspnDraftAdapter to use getDraftYear**

In `src/scraper/adapters/espn-draft.ts`, add the import and update the constructor:

```typescript
import { getDraftYear } from "../utils/draft-year";
```

Change the constructor default:

```typescript
  constructor(year: number = getDraftYear()) {
```

- [ ] **Step 2: Register adapters in CLI**

In `src/scraper/cli.ts`, add imports after the existing adapter imports:

```typescript
import { TankathonDraftOrderAdapter } from "./adapters/tankathon-draft-order";
import { TankathonProspectsAdapter } from "./adapters/tankathon-prospects";
import { NflTeamNeedsAdapter } from "./adapters/nfl-team-needs";
```

Add to the adapters array (after `new EspnDraftAdapter()`):

```typescript
    new TankathonDraftOrderAdapter(),
    new TankathonProspectsAdapter(),
    new NflTeamNeedsAdapter(),
```

- [ ] **Step 3: Register adapters in API route**

In `src/app/api/scrape/route.ts`, add the same imports:

```typescript
import { TankathonDraftOrderAdapter } from "@/scraper/adapters/tankathon-draft-order";
import { TankathonProspectsAdapter } from "@/scraper/adapters/tankathon-prospects";
import { NflTeamNeedsAdapter } from "@/scraper/adapters/nfl-team-needs";
```

Add to the adapters array:

```typescript
      new TankathonDraftOrderAdapter(),
      new TankathonProspectsAdapter(),
      new NflTeamNeedsAdapter(),
```

- [ ] **Step 4: Run all tests**

Run: `npx jest --no-coverage`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/scraper/cli.ts src/app/api/scrape/route.ts src/scraper/adapters/espn-draft.ts
git commit -m "feat: register new draft adapters and use getDraftYear in EspnDraftAdapter"
```

---

### Task 8: UI Attribution in PreDraftHub

**Files:**
- Modify: `src/components/draft/PreDraftHub.tsx`
- Modify: `src/app/draft/page.tsx`

**Context:** The PreDraftHub needs to show source attribution below the prospect rankings and team needs lists. The source strings come from `draft_meta` keys `prospectsSource` and `needsSource`.

- [ ] **Step 1: Update page.tsx to pass draftMeta**

In `src/app/draft/page.tsx`, the `meta` variable already exists (line 25). Pass it to PreDraftHub:

Find:
```typescript
          <PreDraftHub
            draftOrder={picks}
            prospects={prospects}
            teamNeeds={teamNeeds}
            teams={teams}
            draftStartDate={draftStartDate}
          />
```

Replace with:
```typescript
          <PreDraftHub
            draftOrder={picks}
            prospects={prospects}
            teamNeeds={teamNeeds}
            teams={teams}
            draftStartDate={draftStartDate}
            prospectsSource={meta.prospectsSource}
            needsSource={meta.needsSource}
          />
```

- [ ] **Step 2: Update PreDraftHub to accept and display attribution**

In `src/components/draft/PreDraftHub.tsx`, update the props interface:

```typescript
interface PreDraftHubProps {
  draftOrder: DraftPick[];
  prospects: DraftProspect[];
  teamNeeds: TeamNeed[];
  teams: Team[];
  draftStartDate: string;
  prospectsSource?: string;
  needsSource?: string;
}
```

Update the destructured props:

```typescript
export function PreDraftHub({
  draftOrder,
  prospects,
  teamNeeds,
  teams,
  draftStartDate,
  prospectsSource,
  needsSource,
}: PreDraftHubProps) {
```

Add attribution text at the bottom of the prospects tab content (after the closing `</div>` of `{tab === "prospects" && (...)}`), inside the conditional:

Find the end of the prospects tab block (around line 105-106):

```typescript
        </div>
      )}
```

Replace with:

```typescript
          {prospectsSource && (
            <p className="mt-3 text-xs text-text-muted text-center">
              Rankings: {prospectsSource}
            </p>
          )}
        </div>
      )}
```

Add attribution for team needs tab similarly. Find the end of the needs tab block (around line 89-90):

```typescript
        </div>
      )}
```

Replace with:

```typescript
          {needsSource && (
            <p className="mt-3 text-xs text-text-muted text-center">
              Source: {needsSource}
            </p>
          )}
        </div>
      )}
```

- [ ] **Step 3: Verify the page renders**

Start dev server and visit `http://localhost:3001/draft`. Verify:
- Prospects tab shows "Rankings: Tankathon Consensus Board" (or no attribution if scrapers haven't run yet)
- Team Needs tab shows "Source: NFL.com" (or no attribution if scrapers haven't run yet)

- [ ] **Step 4: Commit**

```bash
git add src/components/draft/PreDraftHub.tsx src/app/draft/page.tsx
git commit -m "feat: add source attribution text to PreDraftHub"
```

---

## Self-Review

**1. Spec coverage:**
- Section 1 (getDraftYear): Task 1 ✓
- Section 2 (Tankathon Draft Order): Task 2 ✓
- Section 3 (Tankathon Prospects): Task 3 ✓
- Section 4 (NFL.com Team Needs): Task 4 ✓
- Section 5 (Orchestrator Changes): Task 6 ✓
- Section 6 (Schema Changes): Task 5 ✓
- Section 7 (UI Attribution): Task 8 ✓
- Section 8 (Adapter Registration): Task 7 ✓
- Section 9 (ESPN Draft Adapter unchanged): Task 7 updates it to use getDraftYear only ✓
- Section 10 (Error Handling): Each adapter follows try/catch → empty array pattern ✓
- Section 11 (What's NOT changing): Verified ✓

**2. Placeholder scan:** No "TBD", "TODO", or vague steps found.

**3. Type consistency:**
- `ParsedPick` fields (pickNumber, teamId, round, tradeNote) match orchestrator casting ✓
- `ParsedProspect` fields (rank, name, position, college) match orchestrator casting ✓
- `ParsedNeed` fields (teamId, position, priority) match orchestrator casting ✓
- Discriminator flags (`_draftOrderData`, `_prospectData`, `_teamNeedsData`) consistent across adapters and orchestrator ✓
- `source` column referenced in both schema migration and orchestrator INSERT ✓
