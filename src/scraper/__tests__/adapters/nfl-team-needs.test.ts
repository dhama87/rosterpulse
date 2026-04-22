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
  return { ok: true, text: () => Promise.resolve(body) } as unknown as Response;
}

function makeErrorResponse(): Response {
  return { ok: false, text: () => Promise.reject(new Error("Not found")) } as unknown as Response;
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
    const htmlWithDupe = `
<html><body>
<script>self.__next_f.push([1,"{\\"cardDescription\\":\\"NEEDS: EDGE, OL, CB\\",\\"cardTitle\\":\\"GIANTS\\",\\"teamLogo\\":\\"https://static.www.nfl.com/{formatInstructions}/league/api/clubs/logos/NYG\\",\\"pickNumber\\":5,\\"type\\":5}"])</script>
<script>self.__next_f.push([1,"{\\"cardDescription\\":\\"NEEDS: EDGE, OL, CB\\",\\"cardTitle\\":\\"GIANTS\\",\\"teamLogo\\":\\"https://static.www.nfl.com/{formatInstructions}/league/api/clubs/logos/NYG\\",\\"pickNumber\\":10,\\"type\\":5}"])</script>
</body></html>
`;
    fetchSpy.mockResolvedValueOnce(makeOkResponse(htmlWithDupe));
    const items = await adapter.fetch();
    const needs = items[0].rawData.needs as Array<Record<string, unknown>>;
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
