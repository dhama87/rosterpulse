import { EspnDraftAdapter } from "../../adapters/espn-draft";

const SAMPLE_DRAFT_RESPONSE = {
  rounds: [
    {
      number: 1,
      picks: [
        {
          overall: 1,
          round: { number: 1 },
          team: { id: "3", abbreviation: "CHI" },
          athlete: {
            displayName: "Cam Ward",
            position: { abbreviation: "QB" },
            college: { name: "Miami" },
          },
          tradedFrom: null,
          tradeNote: null,
        },
        {
          overall: 2,
          round: { number: 1 },
          team: { id: "30", abbreviation: "JAX" },
          athlete: {
            displayName: "Travis Hunter",
            position: { abbreviation: "CB" },
            college: { name: "Colorado" },
          },
          tradedFrom: null,
          tradeNote: null,
        },
      ],
    },
  ],
};

function makeOkResponse(body: object): Response {
  return {
    ok: true,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

function makeNotFoundResponse(): Response {
  return {
    ok: false,
    json: () => Promise.reject(new Error("Not found")),
  } as unknown as Response;
}

describe("EspnDraftAdapter", () => {
  let adapter: EspnDraftAdapter;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    adapter = new EspnDraftAdapter(2026);
    fetchSpy = jest.spyOn(global, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("has correct name", () => {
    expect(adapter.name).toBe("espn-draft");
  });

  it("parses draft picks from ESPN response", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse(SAMPLE_DRAFT_RESPONSE));

    const items = await adapter.fetch();

    expect(items).toHaveLength(2);
    expect(items[0].type).toBe("player");
    expect(items[0].rawData._draftData).toBe(true);
    expect(items[0].rawData.playerName).toBe("Cam Ward");
    expect(items[0].rawData.position).toBe("QB");
    expect(items[0].rawData.college).toBe("Miami");
    expect(items[0].rawData.teamId).toBe("CHI");
    expect(items[0].rawData.round).toBe(1);
    expect(items[0].rawData.pickNumber).toBe(1);
  });

  it("generates correct pick IDs", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse(SAMPLE_DRAFT_RESPONSE));

    const items = await adapter.fetch();

    expect(items[0].rawData.id).toBe("2026-R1-P1");
    expect(items[1].rawData.id).toBe("2026-R1-P2");
  });

  it("returns empty array on API failure", async () => {
    fetchSpy.mockResolvedValueOnce(makeNotFoundResponse());

    const items = await adapter.fetch();

    expect(items).toHaveLength(0);
  });

  it("sets confidence to official", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse(SAMPLE_DRAFT_RESPONSE));

    const items = await adapter.fetch();

    expect(items[0].confidence).toBe("official");
  });
});
