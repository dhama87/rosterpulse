import { NflTransactionsAdapter } from "../../adapters/nfl-transactions";

const SAMPLE_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>NFL.com Transactions</title>
    <item>
      <title>Bills signed LB Ray to the practice squad</title>
      <description>Buffalo Bills signed LB Ray to the practice squad.</description>
      <link>https://nfl.com/transactions/12345</link>
      <pubDate>Sun, 13 Apr 2026 14:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Dolphins placed CB on injured reserve</title>
      <description>Miami Dolphins placed CB on injured reserve.</description>
      <link>https://nfl.com/transactions/12346</link>
      <pubDate>Sun, 13 Apr 2026 13:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

function makeFetchMock(body: string, ok = true) {
  return jest.fn().mockResolvedValue({
    ok,
    text: jest.fn().mockResolvedValue(body),
  } as unknown as Response);
}

describe("NflTransactionsAdapter", () => {
  let fetchSpy: jest.SpyInstance;

  afterEach(() => {
    fetchSpy?.mockRestore();
  });

  it("has correct name", () => {
    const adapter = new NflTransactionsAdapter();
    expect(adapter.name).toBe("nfl-transactions");
  });

  it("fetches and parses RSS items with official confidence", async () => {
    fetchSpy = jest.spyOn(global, "fetch").mockImplementation(makeFetchMock(SAMPLE_RSS));

    const adapter = new NflTransactionsAdapter();
    const items = await adapter.fetch();

    expect(items).toHaveLength(2);
    expect(items[0].source).toBe("NFL.com");
    expect(items[0].confidence).toBe("official");
    expect(items[1].source).toBe("NFL.com");
    expect(items[1].confidence).toBe("official");
  });

  it("extracts headline and description into rawData", async () => {
    fetchSpy = jest.spyOn(global, "fetch").mockImplementation(makeFetchMock(SAMPLE_RSS));

    const adapter = new NflTransactionsAdapter();
    const items = await adapter.fetch();

    expect(items[0].rawData.headline).toBe("Bills signed LB Ray to the practice squad");
    expect(items[0].rawData.description).toBe("Buffalo Bills signed LB Ray to the practice squad.");
    expect(items[1].rawData.headline).toBe("Dolphins placed CB on injured reserve");
    expect(items[1].rawData.description).toBe("Miami Dolphins placed CB on injured reserve.");
  });

  it("returns empty array on fetch error", async () => {
    fetchSpy = jest.spyOn(global, "fetch").mockRejectedValue(new Error("Network error"));

    const adapter = new NflTransactionsAdapter();
    const items = await adapter.fetch();

    expect(items).toEqual([]);
  });
});
