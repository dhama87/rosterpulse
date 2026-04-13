import { getDb, closeDb } from "../db/client";
import { seedFromMock } from "../db/seed";
import { runScrape } from "./orchestrator";
import { EspnRssAdapter } from "./adapters/espn-rss";
import { NflTransactionsAdapter } from "./adapters/nfl-transactions";
import { EspnRosterAdapter } from "./adapters/espn-roster";
import { RotoworldRssAdapter } from "./adapters/rotoworld-rss";

async function main(): Promise<void> {
  console.log("RosterPulse Scraper — starting...");

  const db = getDb();

  // Seed from mock data if DB is empty
  const { count } = db
    .prepare("SELECT COUNT(*) as count FROM players")
    .get() as { count: number };

  if (count === 0) {
    const seedResult = seedFromMock(db);
    console.log(
      `DB empty — seeded ${seedResult.playersSeeded} players and ${seedResult.newsSeeded} news items from mock data.`
    );
  }

  const adapters = [
    new EspnRssAdapter(),
    new NflTransactionsAdapter(),
    new EspnRosterAdapter(),
    new RotoworldRssAdapter(),
  ];

  console.log(`Running ${adapters.length} adapters...`);

  const result = await runScrape(db, adapters);

  // Calculate duration in seconds
  const durationMs =
    new Date(result.completedAt).getTime() -
    new Date(result.startedAt).getTime();
  const durationSec = (durationMs / 1000).toFixed(2);

  console.log(
    `\nScrape complete in ${durationSec}s — ${result.totalItems} total items\n`
  );

  for (const ar of result.adapterResults) {
    const icon = ar.status === "success" ? "✓" : "✗";
    const summary = `${icon} ${ar.adapter}: ${ar.itemsFound} items found`;
    if (ar.status === "error" && ar.errorMessage) {
      console.log(`${summary} — ERROR: ${ar.errorMessage}`);
    } else {
      console.log(summary);
    }
  }

  closeDb();

  const allFailed = result.adapterResults.every((ar) => ar.status === "error");
  process.exit(allFailed ? 1 : 0);
}

main().catch((err: unknown) => {
  console.error("Fatal error:", err instanceof Error ? err.message : String(err));
  closeDb();
  process.exit(1);
});
