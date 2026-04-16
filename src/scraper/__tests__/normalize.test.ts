import { normalizeToPlayer, normalizeToNewsItem } from "../normalize";
import type { ScrapedItem } from "../types";

const playerItem: ScrapedItem = {
  type: "player",
  sourceAdapter: "espn-roster",
  source: "ESPN",
  sourceUrl: "https://www.espn.com/nfl/team/roster/_/name/kc/kansas-city-chiefs",
  confidence: "official",
  fetchedAt: "2026-04-13T00:00:00.000Z",
  rawData: {
    id: "KC-QB-1",
    name: "Patrick Mahomes",
    team: "KC",
    position: "QB",
    positionGroup: "offense",
    depthOrder: 1,
    jerseyNumber: 15,
    height: "6-2",
    weight: "230",
    age: 30,
    college: "Texas Tech",
    experience: 8,
    injuryStatus: "Active",
  },
};

const playerItemWithExtras: ScrapedItem = {
  ...playerItem,
  rawData: {
    ...playerItem.rawData,
    injuryDetail: "Right knee soreness",
    stats: { passingYards: 4183, touchdowns: 26 },
  },
};

const newsItem: ScrapedItem = {
  type: "news",
  sourceAdapter: "rotoworld-rss",
  source: "Rotoworld",
  sourceUrl: "https://www.nbcsports.com/nfl/news/mahomes-limited-practice",
  confidence: "reported",
  fetchedAt: "2026-04-13T00:00:00.000Z",
  rawData: {
    playerId: "KC-QB-1",
    playerName: "Patrick Mahomes",
    team: "KC",
    position: "QB",
    category: "INJURY",
    headline: "Mahomes limited in practice with knee soreness",
    description:
      "Patrick Mahomes was a limited participant in Wednesday's practice due to knee soreness, though he is expected to play Sunday.",
    timestamp: "2026-04-13T10:30:00.000Z",
  },
};

describe("normalizeToPlayer", () => {
  it("converts a player ScrapedItem to a Player with full field mapping", () => {
    const player = normalizeToPlayer(playerItem);

    expect(player.id).toBe("KC-QB-1");
    expect(player.name).toBe("Patrick Mahomes");
    expect(player.team).toBe("KC");
    expect(player.position).toBe("QB");
    expect(player.positionGroup).toBe("offense");
    expect(player.depthOrder).toBe(1);
    expect(player.jerseyNumber).toBe(15);
    expect(player.height).toBe("6-2");
    expect(player.weight).toBe("230");
    expect(player.age).toBe(30);
    expect(player.college).toBe("Texas Tech");
    expect(player.experience).toBe(8);
    expect(player.injuryStatus).toBe("Active");
    expect(player.injuryDetail).toBeUndefined();
    expect(player.stats).toEqual({});
  });

  it("includes injuryDetail and stats when present in rawData", () => {
    const player = normalizeToPlayer(playerItemWithExtras);

    expect(player.injuryDetail).toBe("Right knee soreness");
    expect(player.stats).toEqual({ passingYards: 4183, touchdowns: 26 });
  });
});

describe("normalizeToNewsItem", () => {
  it("converts a news ScrapedItem to a NewsItem with full field mapping", () => {
    const news = normalizeToNewsItem(newsItem);

    expect(news.playerId).toBe("KC-QB-1");
    expect(news.playerName).toBe("Patrick Mahomes");
    expect(news.team).toBe("KC");
    expect(news.position).toBe("QB");
    expect(news.category).toBe("INJURY");
    expect(news.headline).toBe("Mahomes limited in practice with knee soreness");
    expect(news.description).toBe(
      "Patrick Mahomes was a limited participant in Wednesday's practice due to knee soreness, though he is expected to play Sunday."
    );
    expect(news.source).toBe("Rotoworld");
    expect(news.sourceUrl).toBe(
      "https://www.nbcsports.com/nfl/news/mahomes-limited-practice"
    );
    expect(news.confidence).toBe("reported");
    expect(news.timestamp).toBe("2026-04-13T10:30:00.000Z");
  });

  it("id should be any string (randomUUID when not in rawData)", () => {
    const news = normalizeToNewsItem(newsItem);
    expect(typeof news.id).toBe("string");
    expect(news.id.length).toBeGreaterThan(0);
  });

  it("uses id from rawData when present", () => {
    const itemWithId: ScrapedItem = {
      ...newsItem,
      rawData: { ...newsItem.rawData, id: "explicit-news-id-123" },
    };
    const news = normalizeToNewsItem(itemWithId);
    expect(news.id).toBe("explicit-news-id-123");
  });
});
