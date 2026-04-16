import { EspnRosterAdapter } from "../../adapters/espn-roster";

const SAMPLE_ROSTER = {
  team: { abbreviation: "KC" },
  athletes: [
    {
      position: "offense",
      items: [
        {
          id: "3139477",
          fullName: "Patrick Mahomes",
          jersey: "15",
          position: { abbreviation: "QB" },
          age: 30,
          weight: 225,
          height: "6' 2\"",
          experience: { years: 8 },
          college: { name: "Texas Tech" },
          injuries: [],
        },
      ],
    },
  ],
};

const SAMPLE_DEPTH = {
  team: { abbreviation: "KC" },
  depthchart: [
    {
      id: "21",
      name: "3WR 1TE",
      positions: {
        qb: {
          position: { id: "1", name: "Quarterback" },
          athletes: [{ id: "3139477", displayName: "Patrick Mahomes" }],
        },
      },
    },
  ],
};

function makeOkJsonResponse(body: unknown): Response {
  return {
    ok: true,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

describe("EspnRosterAdapter", () => {
  let adapter: EspnRosterAdapter;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    adapter = new EspnRosterAdapter(["KC"]);
    fetchSpy = jest.spyOn(global, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("has correct name", () => {
    expect(adapter.name).toBe("espn-roster");
  });

  it("fetches roster and depth chart data for specified teams", async () => {
    // Adapter fetches roster and depth chart in parallel
    fetchSpy
      .mockResolvedValueOnce(makeOkJsonResponse(SAMPLE_ROSTER))
      .mockResolvedValueOnce(makeOkJsonResponse(SAMPLE_DEPTH));

    const items = await adapter.fetch();

    expect(items.length).toBeGreaterThan(0);
    expect(items[0].type).toBe("player");
    expect(items[0].source).toBe("ESPN");
    expect(items[0].confidence).toBe("official");
  });

  it("extracts player data with depth chart position", async () => {
    fetchSpy
      .mockResolvedValueOnce(makeOkJsonResponse(SAMPLE_ROSTER))
      .mockResolvedValueOnce(makeOkJsonResponse(SAMPLE_DEPTH));

    const items = await adapter.fetch();
    const mahomes = items.find((i) => i.rawData.name === "Patrick Mahomes");

    expect(mahomes).toBeDefined();
    expect(mahomes!.rawData.team).toBe("KC");
    expect(mahomes!.rawData.position).toBe("QB");
    expect(mahomes!.rawData.depthOrder).toBe(1);
    expect(mahomes!.rawData.jerseyNumber).toBe(15);
    expect(mahomes!.rawData.espnId).toBe("3139477");
  });

  it("returns empty array on fetch error", async () => {
    fetchSpy.mockRejectedValue(new Error("Network failure"));

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const items = await adapter.fetch();
    consoleSpy.mockRestore();

    expect(items).toEqual([]);
  });
});
