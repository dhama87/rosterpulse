import { getDb, closeDb } from "../db/client";
import { createTables } from "../db/schema";
import { seedFromMock } from "../db/seed";
import { runScrape } from "./orchestrator";
import { EspnRssAdapter } from "./adapters/espn-rss";
import { NflTransactionsAdapter } from "./adapters/nfl-transactions";
import { EspnRosterAdapter } from "./adapters/espn-roster";
import { RotoworldRssAdapter } from "./adapters/rotoworld-rss";
import { EspnScheduleAdapter } from "./adapters/espn-schedule";
import { EspnDraftAdapter } from "./adapters/espn-draft";
import { TankathonDraftOrderAdapter } from "./adapters/tankathon-draft-order";
import { TankathonProspectsAdapter } from "./adapters/tankathon-prospects";
import { NflTeamNeedsAdapter } from "./adapters/nfl-team-needs";

async function main(): Promise<void> {
  console.log("RosterPulse Scraper — starting...");

  const db = getDb();

  // Ensure tables exist
  await createTables(db);

  // Seed from mock data if DB is empty
  const countResult = await db.execute(
    "SELECT COUNT(*) as count FROM players"
  );
  const count = countResult.rows[0].count as number;

  if (count === 0) {
    const seedResult = await seedFromMock(db);
    console.log(
      `DB empty — seeded ${seedResult.playersSeeded} players and ${seedResult.newsSeeded} news items from mock data.`
    );
  }

  const adapters = [
    new EspnRssAdapter(),
    new NflTransactionsAdapter(),
    new EspnRosterAdapter(),
    new RotoworldRssAdapter(),
    new EspnScheduleAdapter(),
    new EspnDraftAdapter(),
    new TankathonDraftOrderAdapter(),
    new TankathonProspectsAdapter(),
    new NflTeamNeedsAdapter(),
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
