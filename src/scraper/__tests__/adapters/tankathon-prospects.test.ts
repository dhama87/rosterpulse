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
  return { ok: true, text: () => Promise.resolve(body) } as unknown as Response;
}

function makeErrorResponse(): Response {
  return { ok: false, text: () => Promise.reject(new Error("Not found")) } as unknown as Response;
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
    expect(prospects[0]).toEqual({ rank: 1, name: "Arvell Reese", position: "LB/EDGE", college: "Ohio State" });
    expect(prospects[1]).toEqual({ rank: 2, name: "Caleb Downs", position: "S", college: "Ohio State" });
  });

  it("extracts position from data-pos attribute", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse(SAMPLE_HTML));
    const items = await adapter.fetch();
    const prospects = items[0].rawData.prospects as Array<Record<string, unknown>>;
    expect(prospects[2]).toEqual(expect.objectContaining({ position: "QB", college: "Indiana" }));
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
