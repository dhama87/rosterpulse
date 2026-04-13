import { createHash } from "crypto";
import type Database from "better-sqlite3";
import { players } from "@/data/players";
import { newsItems } from "@/data/news";

function dedupKey(source: string, headline: string): string {
  const input = `${source.toLowerCase().trim()}:${headline.toLowerCase().trim()}`;
  return createHash("sha256").update(input).digest("hex").slice(0, 16);
}

export interface SeedResult {
  playersSeeded: number;
  newsSeeded: number;
}

export function seedFromMock(db: InstanceType<typeof Database>): SeedResult {
  const now = new Date().toISOString();

  const insertPlayer = db.prepare(`
    INSERT OR REPLACE INTO players (
      id, name, team, position, positionGroup, depthOrder, jerseyNumber,
      height, weight, age, college, experience, injuryStatus, injuryDetail,
      injuryDate, estimatedReturn, irDesignation, practiceStatus, depthChange,
      stats, source, sourceUrl, updatedAt
    ) VALUES (
      @id, @name, @team, @position, @positionGroup, @depthOrder, @jerseyNumber,
      @height, @weight, @age, @college, @experience, @injuryStatus, @injuryDetail,
      @injuryDate, @estimatedReturn, @irDesignation, @practiceStatus, @depthChange,
      @stats, @source, @sourceUrl, @updatedAt
    )
  `);

  const insertNews = db.prepare(`
    INSERT OR REPLACE INTO news (
      id, dedupKey, playerId, playerName, team, position, category,
      headline, description, source, sourceUrl, confidence, timestamp, fetchedAt
    ) VALUES (
      @id, @dedupKey, @playerId, @playerName, @team, @position, @category,
      @headline, @description, @source, @sourceUrl, @confidence, @timestamp, @fetchedAt
    )
  `);

  const seedPlayers = db.transaction(() => {
    for (const player of players) {
      insertPlayer.run({
        id: player.id,
        name: player.name,
        team: player.team,
        position: player.position,
        positionGroup: player.positionGroup,
        depthOrder: player.depthOrder,
        jerseyNumber: player.jerseyNumber,
        height: player.height,
        weight: player.weight,
        age: player.age,
        college: player.college,
        experience: player.experience,
        injuryStatus: player.injuryStatus,
        injuryDetail: player.injuryDetail ?? null,
        injuryDate: player.injuryDate ?? null,
        estimatedReturn: player.estimatedReturn ?? null,
        irDesignation: player.irDesignation ?? null,
        practiceStatus: player.practiceStatus ?? null,
        depthChange: player.depthChange ?? null,
        stats: JSON.stringify(player.stats),
        source: "mock",
        sourceUrl: null,
        updatedAt: now,
      });
    }
    return players.length;
  });

  const seedNews = db.transaction(() => {
    for (const item of newsItems) {
      const source = item.source ?? "mock";
      insertNews.run({
        id: item.id,
        dedupKey: dedupKey(source, item.headline),
        playerId: item.playerId,
        playerName: item.playerName,
        team: item.team,
        position: item.position,
        category: item.category,
        headline: item.headline,
        description: item.description,
        source,
        sourceUrl: item.sourceUrl ?? null,
        confidence: "official",
        timestamp: item.timestamp,
        fetchedAt: now,
      });
    }
    return newsItems.length;
  });

  const playersSeeded = seedPlayers() as number;
  const newsSeeded = seedNews() as number;

  return { playersSeeded, newsSeeded };
}
