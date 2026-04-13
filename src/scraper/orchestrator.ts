import Database from "better-sqlite3";
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
  db: InstanceType<typeof Database>,
  adapters: SourceAdapter[]
): Promise<ScrapeResult> {
  const startedAt = new Date().toISOString();

  // Run all adapters in parallel
  const settled = await Promise.allSettled(adapters.map(runAdapter));

  const adapterResults: AdapterResult[] = settled.map((result) => {
    // runAdapter never rejects — it catches internally — but handle just in case
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
      const enriched = enrichNewsItems(newsItems, db);
      adapterResult.items = [...nonNewsItems, ...enriched];
      adapterResult.itemsFound = adapterResult.items.length;
    }
  }

  // Load existing dedup keys from DB
  const existingKeys = new Set<string>(
    (db.prepare("SELECT dedupKey FROM news").all() as Array<{ dedupKey: string }>)
      .map((r) => r.dedupKey)
      .filter(Boolean)
  );

  // Prepare statements
  const insertNews = db.prepare(`
    INSERT OR IGNORE INTO news
      (id, dedupKey, playerId, playerName, team, position, category, headline,
       description, source, sourceUrl, confidence, timestamp, fetchedAt)
    VALUES
      (@id, @dedupKey, @playerId, @playerName, @team, @position, @category, @headline,
       @description, @source, @sourceUrl, @confidence, @timestamp, @fetchedAt)
  `);

  const insertPlayer = db.prepare(`
    INSERT OR REPLACE INTO players
      (id, name, team, position, positionGroup, depthOrder, jerseyNumber,
       height, weight, age, college, experience, injuryStatus, injuryDetail,
       stats, source, sourceUrl, updatedAt)
    VALUES
      (@id, @name, @team, @position, @positionGroup, @depthOrder, @jerseyNumber,
       @height, @weight, @age, @college, @experience, @injuryStatus, @injuryDetail,
       @stats, @source, @sourceUrl, @updatedAt)
  `);

  const upgradeConfidence = db.prepare(`
    UPDATE news SET confidence = 'official'
    WHERE dedupKey = ? AND confidence = 'reported'
  `);

  const insertLog = db.prepare(`
    INSERT INTO scrape_log
      (adapter, status, itemsFound, itemsNew, itemsUpdated, errorMessage, startedAt, completedAt)
    VALUES
      (@adapter, @status, @itemsFound, @itemsNew, @itemsUpdated, @errorMessage, @startedAt, @completedAt)
  `);

  // Process all items in a single transaction
  const processAll = db.transaction(() => {
    let totalItems = 0;

    for (const adapterResult of adapterResults) {
      let itemsNew = 0;
      let itemsUpdated = 0;

      for (const item of adapterResult.items) {
        totalItems++;

        if (item.type === "player") {
          const player = normalizeToPlayer(item);
          insertPlayer.run({
            ...player,
            injuryDetail: player.injuryDetail ?? null,
            stats: JSON.stringify(player.stats ?? {}),
            source: item.source,
            sourceUrl: item.sourceUrl,
            updatedAt: item.fetchedAt,
          });
          itemsNew++;
        } else if (item.type === "news") {
          const news = normalizeToNewsItem(item);
          const dedupKey = makeDedupKey(item.source, news.headline);

          if (existingKeys.has(dedupKey)) {
            // Duplicate — check for confidence upgrade
            if (shouldUpgradeConfidence("reported", item.confidence)) {
              const info = upgradeConfidence.run(dedupKey) as { changes: number };
              if (info.changes > 0) {
                itemsUpdated++;
              }
            }
          } else {
            // New item
            insertNews.run({
              id: news.id,
              dedupKey,
              playerId: news.playerId ?? null,
              playerName: news.playerName,
              team: news.team,
              position: news.position,
              category: news.category,
              headline: news.headline,
              description: news.description,
              source: news.source,
              sourceUrl: news.sourceUrl,
              confidence: news.confidence,
              timestamp: news.timestamp,
              fetchedAt: item.fetchedAt,
            });
            existingKeys.add(dedupKey);
            itemsNew++;
          }
        }
      }

      // Log this adapter's results
      insertLog.run({
        adapter: adapterResult.adapter,
        status: adapterResult.status,
        itemsFound: adapterResult.itemsFound,
        itemsNew,
        itemsUpdated,
        errorMessage: adapterResult.errorMessage ?? null,
        startedAt: adapterResult.startedAt,
        completedAt: adapterResult.completedAt,
      });
    }

    return totalItems;
  });

  const totalItems = processAll() as number;
  const completedAt = new Date().toISOString();

  return {
    totalItems,
    adapterResults,
    startedAt,
    completedAt,
  };
}
