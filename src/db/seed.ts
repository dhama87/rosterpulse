import { createHash } from "crypto";
import type { Client } from "@libsql/client";
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

export async function seedFromMock(db: Client): Promise<SeedResult> {
  const now = new Date().toISOString();

  const tx = await db.transaction("write");

  try {
    for (const player of players) {
      await tx.execute({
        sql: `INSERT OR REPLACE INTO players (
          id, name, team, position, positionGroup, depthOrder, jerseyNumber,
          height, weight, age, college, experience, injuryStatus, injuryDetail,
          injuryDate, estimatedReturn, irDesignation, practiceStatus, depthChange, espnId,
          stats, source, sourceUrl, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          player.id, player.name, player.team, player.position,
          player.positionGroup, player.depthOrder, player.jerseyNumber,
          player.height, player.weight, player.age, player.college,
          player.experience, player.injuryStatus, player.injuryDetail ?? null,
          player.injuryDate ?? null, player.estimatedReturn ?? null,
          player.irDesignation ?? null, player.practiceStatus ?? null,
          player.depthChange ?? null, player.espnId ?? null,
          JSON.stringify(player.stats), "mock", null, now,
        ],
      });
    }

    for (const item of newsItems) {
      const source = item.source ?? "mock";
      await tx.execute({
        sql: `INSERT OR REPLACE INTO news (
          id, dedupKey, playerId, playerName, team, position, category,
          headline, description, source, sourceUrl, confidence, timestamp, fetchedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          item.id, dedupKey(source, item.headline), item.playerId,
          item.playerName, item.team, item.position, item.category,
          item.headline, item.description, source, item.sourceUrl ?? null,
          "official", item.timestamp, now,
        ],
      });
    }

    await tx.commit();
  } catch (err) {
    await tx.rollback();
    throw err;
  }

  return { playersSeeded: players.length, newsSeeded: newsItems.length };
}
