import { EspnRssAdapter } from "../../adapters/espn-rss";

const SAMPLE_RSS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>ESPN - NFL News</title>
    <item>
      <title>Chiefs trade WR to Packers in blockbuster deal</title>
      <description>Kansas City traded wide receiver in a surprising move.</description>
      <link>https://espn.com/nfl/story/12345</link>
      <pubDate>Sun, 13 Apr 2026 12:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Eagles QB hurts shoulder in practice</title>
      <description>Philadelphia quarterback left practice early.</description>
      <link>https://espn.com/nfl/story/12346</link>
      <pubDate>Sun, 13 Apr 2026 11:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

function makeOkResponse(body: string): Response {
  return {
    ok: true,
    text: () => Promise.resolve(body),
  } as unknown as Response;
}

describe("EspnRssAdapter", () => {
  let adapter: EspnRssAdapter;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    adapter = new EspnRssAdapter();
    fetchSpy = jest.spyOn(global, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("has correct name", () => {
    expect(adapter.name).toBe("espn-rss");
  });

  it("fetches and parses RSS items", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse(SAMPLE_RSS_XML));

    const items = await adapter.fetch();

    expect(items).toHaveLength(2);
    expect(items[0].type).toBe("news");
    expect(items[0].source).toBe("ESPN");
    expect(items[0].confidence).toBe("reported");
  });

  it("extracts headline and description into rawData with correct sourceUrl", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse(SAMPLE_RSS_XML));

    const items = await adapter.fetch();

    expect(items[0].rawData.headline).toBe(
      "Chiefs trade WR to Packers in blockbuster deal"
    );
    expect(items[0].rawData.description).toBe(
      "Kansas City traded wide receiver in a surprising move."
    );
    expect(items[0].sourceUrl).toBe("https://espn.com/nfl/story/12345");

    expect(items[1].rawData.headline).toBe(
      "Eagles QB hurts shoulder in practice"
    );
    expect(items[1].rawData.description).toBe(
      "Philadelphia quarterback left practice early."
    );
    expect(items[1].sourceUrl).toBe("https://espn.com/nfl/story/12346");
  });

  it("returns empty array on fetch error (response.ok = false)", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: () => Promise.resolve("Not Found"),
    } as unknown as Response);

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const items = await adapter.fetch();
    consoleSpy.mockRestore();

    expect(items).toEqual([]);
  });

  it("returns empty array on network error (fetch rejects)", async () => {
    fetchSpy.mockRejectedValueOnce(new Error("Network failure"));

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const items = await adapter.fetch();
    consoleSpy.mockRestore();

    expect(items).toEqual([]);
  });
});
