import { RotoworldRssAdapter } from "../../adapters/rotoworld-rss";

const SAMPLE_RSS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Rotoworld NFL Player News</title>
    <item>
      <title>Davante Adams (hamstring) limited in practice</title>
      <description>Raiders WR Davante Adams was limited in Wednesday practice.</description>
      <link>https://www.nbcsports.com/nfl/news/123</link>
      <pubDate>Sun, 13 Apr 2026 15:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

function makeOkResponse(body: string): Response {
  return {
    ok: true,
    text: () => Promise.resolve(body),
  } as unknown as Response;
}

describe("RotoworldRssAdapter", () => {
  let adapter: RotoworldRssAdapter;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    adapter = new RotoworldRssAdapter();
    fetchSpy = jest.spyOn(global, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("has correct name", () => {
    expect(adapter.name).toBe("rotoworld-rss");
  });

  it("fetches and parses RSS items", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse(SAMPLE_RSS_XML));

    const items = await adapter.fetch();

    expect(items).toHaveLength(1);
    expect(items[0].type).toBe("news");
    expect(items[0].source).toBe("Rotoworld");
    expect(items[0].confidence).toBe("reported");
  });

  it("extracts data into rawData", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse(SAMPLE_RSS_XML));

    const items = await adapter.fetch();

    expect(items[0].rawData.headline).toBe(
      "Davante Adams (hamstring) limited in practice"
    );
    expect(items[0].rawData.description).toBe(
      "Raiders WR Davante Adams was limited in Wednesday practice."
    );
    expect(items[0].sourceUrl).toBe("https://www.nbcsports.com/nfl/news/123");
  });

  it("returns empty array on fetch error", async () => {
    fetchSpy.mockRejectedValueOnce(new Error("Network failure"));

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const items = await adapter.fetch();
    consoleSpy.mockRestore();

    expect(items).toEqual([]);
  });
});
