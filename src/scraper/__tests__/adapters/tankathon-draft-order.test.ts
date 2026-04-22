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
