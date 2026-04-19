import type { Client } from "@libsql/client";
import { SourceAdapter, AdapterResult, ScrapedItem } from "./types";
import { normalizeToPlayer, normalizeToNewsItem } from "./normalize";
import { makeDedupKey, shouldUpgradeConfidence } from "./dedup";
import { enrichNewsItems } from "./enrich";

export interface ScrapeResult {
  totalItems: number;
  adapterResults: AdapterResult[];
  startedAt: string;
  completedAt: string;
}

async function runAdapter(adapter: SourceAdapter): Promise<AdapterResult> {
  const startedAt = new Date().toISOString();
  try {
    const items = await adapter.fetch();
    return {
      adapter: adapter.name,
      status: "success",
      items,
      itemsFound: items.length,
      startedAt,
      completedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      adapter: adapter.name,
      status: "error",
      items: [],
      itemsFound: 0,
      errorMessage: err instanceof Error ? err.message : String(err),
      startedAt,
      completedAt: new Date().toISOString(),
    };
  }
}

export async function runScrape(
  db: Client,
  adapters: SourceAdapter[]
): Promise<ScrapeResult> {
  const startedAt = new Date().toISOString();

  // Run all adapters in parallel
  const settled = await Promise.allSettled(adapters.map(runAdapter));

  const adapterResults: AdapterResult[] = settled.map((result) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    return {
      adapter: "unknown",
      status: "error" as const,
      items: [],
      itemsFound: 0,
      errorMessage: String(result.reason),
      startedAt,
      completedAt: new Date().toISOString(),
    };
  });

  // Enrich and filter news items from all adapters
  for (const adapterResult of adapterResults) {
    if (adapterResult.status !== "success") continue;

    const newsItems = adapterResult.items.filter((i) => i.type === "news");
    const nonNewsItems = adapterResult.items.filter((i) => i.type !== "news");

    if (newsItems.length > 0) {
      const enriched = await enrichNewsItems(newsItems, db);
      adapterResult.items = [...nonNewsItems, ...enriched];
      adapterResult.itemsFound = adapterResult.items.length;
    }
  }

  // Load existing dedup keys from DB
  const dedupResult = await db.execute("SELECT dedupKey FROM news");
  const existingKeys = new Set<string>(
    dedupResult.rows
      .map((r) => r.dedupKey as string)
      .filter(Boolean)
  );

  // Process all items in a transaction
  const tx = await db.transaction("write");

  let totalItems = 0;

  try {
    // Clear stale player data before inserting fresh rosters
    await tx.execute("DELETE FROM players");

    for (const adapterResult of adapterResults) {
      let itemsNew = 0;
      let itemsUpdated = 0;

      for (const item of adapterResult.items) {
        totalItems++;

        if (item.type === "player" && item.rawData._gameData) {
          const g = item.rawData;
          await tx.execute({
            sql: `INSERT OR REPLACE INTO games
              (id, week, seasonType, awayTeam, homeTeam, gameTime, tvNetwork,
               awayScore, homeScore, status, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              g.id as string, g.week as number, g.seasonType as string,
              g.awayTeam as string, g.homeTeam as string, g.gameTime as string,
              (g.tvNetwork as string) ?? null,
              (g.awayScore as number) ?? null, (g.homeScore as number) ?? null,
              g.status as string, item.fetchedAt,
            ],
          });
          itemsNew++;
        } else if (item.type === "player") {
          const player = normalizeToPlayer(item);
          await tx.execute({
            sql: `INSERT OR REPLACE INTO players
              (id, name, team, position, positionGroup, depthOrder, jerseyNumber,
               height, weight, age, college, experience, injuryStatus, injuryDetail,
               injuryDate, estimatedReturn, irDesignation, practiceStatus, depthChange, espnId,
               stats, source, sourceUrl, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              player.id, player.name, player.team, player.position,
              player.positionGroup, player.depthOrder, player.jerseyNumber,
              player.height, player.weight, player.age, player.college,
              player.experience, player.injuryStatus,
              player.injuryDetail ?? null, player.injuryDate ?? null,
              player.estimatedReturn ?? null, player.irDesignation ?? null,
              player.practiceStatus ?? null, player.depthChange ?? null,
              player.espnId ?? null,
              JSON.stringify(player.stats ?? {}),
              item.source, item.sourceUrl, item.fetchedAt,
            ],
          });
          itemsNew++;
        } else if (item.type === "news") {
          const news = normalizeToNewsItem(item);
          const dedupKey = makeDedupKey(item.source, news.headline);

          if (existingKeys.has(dedupKey)) {
            if (shouldUpgradeConfidence("reported", item.confidence)) {
              const result = await tx.execute({
                sql: "UPDATE news SET confidence = 'official' WHERE dedupKey = ? AND confidence = 'reported'",
                args: [dedupKey],
              });
              if (result.rowsAffected > 0) {
                itemsUpdated++;
              }
            }
          } else {
            await tx.execute({
              sql: `INSERT OR IGNORE INTO news
                (id, dedupKey, playerId, playerName, team, position, category, headline,
                 description, source, sourceUrl, confidence, timestamp, fetchedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                news.id, dedupKey, news.playerId ?? null, news.playerName,
                news.team, news.position, news.category, news.headline,
                news.description, news.source ?? null, news.sourceUrl ?? null,
                news.confidence ?? null, news.timestamp, item.fetchedAt,
              ],
            });
            existingKeys.add(dedupKey);
            itemsNew++;
          }
        }
      }

      // Log this adapter's results
      await tx.execute({
        sql: `INSERT INTO scrape_log
          (adapter, status, itemsFound, itemsNew, itemsUpdated, errorMessage, startedAt, completedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          adapterResult.adapter, adapterResult.status, adapterResult.itemsFound,
          itemsNew, itemsUpdated, adapterResult.errorMessage ?? null,
          adapterResult.startedAt, adapterResult.completedAt,
        ],
      });
    }

    await tx.commit();
  } catch (err) {
    await tx.rollback();
    throw err;
  }

  const completedAt = new Date().toISOString();

  return {
    totalItems,
    adapterResults,
    startedAt,
    completedAt,
  };
}
