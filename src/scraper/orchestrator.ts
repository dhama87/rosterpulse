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

async function seedDraftDataIfEmpty(tx: import("@libsql/client").Transaction): Promise<void> {
  const countResult = await tx.execute("SELECT COUNT(*) as count FROM draft_picks");
  const count = countResult.rows[0].count as number;
  if (count > 0) return;

  const { draftOrder, topProspects, teamNeeds } = await import("@/data/draft-prospects");
  const now = new Date().toISOString();

  for (const pick of draftOrder) {
    await tx.execute({
      sql: `INSERT OR IGNORE INTO draft_picks
        (id, year, round, pickNumber, teamId, playerName, position, college, isTradeUp, tradeNote, timestamp, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [pick.id, pick.year, pick.round, pick.pickNumber, pick.teamId, pick.playerName, pick.position, pick.college, pick.isTradeUp ? 1 : 0, pick.tradeNote, pick.timestamp, now],
    });
  }

  for (const prospect of topProspects) {
    await tx.execute({
      sql: `INSERT OR IGNORE INTO draft_prospects
        (id, name, position, college, rank, projectedRound, projectedPick, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [prospect.id, prospect.name, prospect.position, prospect.college, prospect.rank, prospect.projectedRound, prospect.projectedPick, now],
    });
  }

  for (const need of teamNeeds) {
    await tx.execute({
      sql: `INSERT OR IGNORE INTO draft_team_needs
        (id, teamId, position, priority, updatedAt)
      VALUES (?, ?, ?, ?, ?)`,
      args: [`${need.teamId}-${need.position}`, need.teamId, need.position, need.priority, now],
    });
  }

  await tx.execute({
    sql: `INSERT OR IGNORE INTO draft_meta (key, value, updatedAt) VALUES (?, ?, ?)`,
    args: ["draftYear", "2026", now],
  });
  await tx.execute({
    sql: `INSERT OR IGNORE INTO draft_meta (key, value, updatedAt) VALUES (?, ?, ?)`,
    args: ["draftDates", JSON.stringify(["2026-04-23T20:00:00-04:00", "2026-04-24T19:00:00-04:00", "2026-04-25T12:00:00-04:00"]), now],
  });
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
    await seedDraftDataIfEmpty(tx);

    for (const adapterResult of adapterResults) {
      let itemsNew = 0;
      let itemsUpdated = 0;

      for (const item of adapterResult.items) {
        totalItems++;

        if (item.type === "player" && item.rawData._draftOrderData) {
          const picks = item.rawData.picks as Array<{
            pickNumber: number;
            teamId: string;
            round: number;
            tradeNote: string | null;
          }>;
          const year = item.rawData.year as number;
          // Clear unfilled picks (preserve filled picks from ESPN draft adapter)
          await tx.execute("DELETE FROM draft_picks WHERE playerName = ''");
          for (const pick of picks) {
            await tx.execute({
              sql: `INSERT OR IGNORE INTO draft_picks
                (id, year, round, pickNumber, teamId, playerName, position, college,
                 isTradeUp, tradeNote, timestamp, updatedAt)
              VALUES (?, ?, ?, ?, ?, '', '', '', ?, ?, NULL, ?)`,
              args: [
                `${year}-R${pick.round}-P${pick.pickNumber}`,
                year, pick.round, pick.pickNumber, pick.teamId,
                pick.tradeNote ? 1 : 0, pick.tradeNote, item.fetchedAt,
              ],
            });
          }
          await tx.execute({
            sql: `INSERT OR REPLACE INTO draft_meta (key, value, updatedAt) VALUES ('draftYear', ?, ?)`,
            args: [String(year), item.fetchedAt],
          });
          await tx.execute({
            sql: `INSERT OR REPLACE INTO draft_meta (key, value, updatedAt) VALUES ('lastUpdated', ?, ?)`,
            args: [item.fetchedAt, item.fetchedAt],
          });
          itemsNew += picks.length;
        } else if (item.type === "player" && item.rawData._prospectData) {
          const prospects = item.rawData.prospects as Array<{
            rank: number;
            name: string;
            position: string;
            college: string;
          }>;
          const source = item.rawData.source as string;
          await tx.execute("DELETE FROM draft_prospects");
          for (const p of prospects) {
            const id = `${p.rank}-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
            await tx.execute({
              sql: `INSERT OR REPLACE INTO draft_prospects
                (id, name, position, college, rank, projectedRound, projectedPick, source, updatedAt)
              VALUES (?, ?, ?, ?, ?, 1, NULL, ?, ?)`,
              args: [id, p.name, p.position, p.college, p.rank, source, item.fetchedAt],
            });
          }
          await tx.execute({
            sql: `INSERT OR REPLACE INTO draft_meta (key, value, updatedAt) VALUES ('prospectsSource', ?, ?)`,
            args: [source, item.fetchedAt],
          });
          await tx.execute({
            sql: `INSERT OR REPLACE INTO draft_meta (key, value, updatedAt) VALUES ('lastUpdated', ?, ?)`,
            args: [item.fetchedAt, item.fetchedAt],
          });
          itemsNew += prospects.length;
        } else if (item.type === "player" && item.rawData._teamNeedsData) {
          const needs = item.rawData.needs as Array<{
            teamId: string;
            position: string;
            priority: number;
          }>;
          const source = item.rawData.source as string;
          await tx.execute("DELETE FROM draft_team_needs");
          for (const n of needs) {
            await tx.execute({
              sql: `INSERT INTO draft_team_needs
                (id, teamId, position, priority, source, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?)`,
              args: [`${n.teamId}-${n.position}`, n.teamId, n.position, n.priority, source, item.fetchedAt],
            });
          }
          await tx.execute({
            sql: `INSERT OR REPLACE INTO draft_meta (key, value, updatedAt) VALUES ('needsSource', ?, ?)`,
            args: [source, item.fetchedAt],
          });
          await tx.execute({
            sql: `INSERT OR REPLACE INTO draft_meta (key, value, updatedAt) VALUES ('lastUpdated', ?, ?)`,
            args: [item.fetchedAt, item.fetchedAt],
          });
          itemsNew += needs.length;
        } else if (item.type === "player" && item.rawData._gameData) {
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
        } else if (item.type === "player" && item.rawData._draftData) {
          const d = item.rawData;
          await tx.execute({
            sql: `INSERT OR REPLACE INTO draft_picks
              (id, year, round, pickNumber, teamId, playerName, position, college,
               isTradeUp, tradeNote, timestamp, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              d.id as string, d.year as number, d.round as number,
              d.pickNumber as number, d.teamId as string,
              d.playerName as string, d.position as string,
              d.college as string, d.isTradeUp as number,
              (d.tradeNote as string) ?? null,
              (d.timestamp as string) ?? null, item.fetchedAt,
            ],
          });
          // Update lastUpdated in draft_meta
          await tx.execute({
            sql: `INSERT OR REPLACE INTO draft_meta (key, value, updatedAt) VALUES ('lastUpdated', ?, ?)`,
            args: [item.fetchedAt, item.fetchedAt],
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
