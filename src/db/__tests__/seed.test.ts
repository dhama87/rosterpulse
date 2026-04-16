import Database from "better-sqlite3";
import { createTables } from "../schema";
import { seedFromMock } from "../seed";

describe("seedFromMock", () => {
  let db: InstanceType<typeof Database>;

  beforeEach(() => {
    db = new Database(":memory:");
    createTables(db);
  });

  afterEach(() => {
    db.close();
  });

  it("seeds players from mock data — count > 0 and matches result.playersSeeded", async () => {
    const result = await seedFromMock(db);

    const { count } = db
      .prepare("SELECT COUNT(*) as count FROM players")
      .get() as { count: number };

    expect(count).toBeGreaterThan(0);
    expect(count).toBe(result.playersSeeded);
  });

  it("seeds news from mock data — count > 0 and matches result.newsSeeded", async () => {
    const result = await seedFromMock(db);

    const { count } = db
      .prepare("SELECT COUNT(*) as count FROM news")
      .get() as { count: number };

    expect(count).toBeGreaterThan(0);
    expect(count).toBe(result.newsSeeded);
  });

  it("seeds all 32 teams worth of players — distinct team count = 32", async () => {
    await seedFromMock(db);

    const { teamCount } = db
      .prepare("SELECT COUNT(DISTINCT team) as teamCount FROM players")
      .get() as { teamCount: number };

    expect(teamCount).toBe(32);
  });

  it("is idempotent — running twice does not duplicate rows", async () => {
    await seedFromMock(db);

    const { playersBefore } = db
      .prepare("SELECT COUNT(*) as playersBefore FROM players")
      .get() as { playersBefore: number };
    const { newsBefore } = db
      .prepare("SELECT COUNT(*) as newsBefore FROM news")
      .get() as { newsBefore: number };

    await seedFromMock(db);

    const { playersAfter } = db
      .prepare("SELECT COUNT(*) as playersAfter FROM players")
      .get() as { playersAfter: number };
    const { newsAfter } = db
      .prepare("SELECT COUNT(*) as newsAfter FROM news")
      .get() as { newsAfter: number };

    expect(playersAfter).toBe(playersBefore);
    expect(newsAfter).toBe(newsBefore);
  });
});
