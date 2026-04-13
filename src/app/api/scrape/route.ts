import { NextResponse } from "next/server";
import { getDb, closeDb } from "@/db/client";
import { seedFromMock } from "@/db/seed";
import { runScrape } from "@/scraper/orchestrator";
import { EspnRssAdapter } from "@/scraper/adapters/espn-rss";
import { NflTransactionsAdapter } from "@/scraper/adapters/nfl-transactions";
import { EspnRosterAdapter } from "@/scraper/adapters/espn-roster";
import { RotoworldRssAdapter } from "@/scraper/adapters/rotoworld-rss";

export async function POST(request: Request) {
  // Auth check
  const secret = process.env.SCRAPE_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const db = getDb();

    // Seed if empty
    const playerCount = (
      db.prepare("SELECT COUNT(*) as count FROM players").get() as {
        count: number;
      }
    ).count;
    if (playerCount === 0) {
      seedFromMock(db);
    }

    // Create adapters and run scrape
    const adapters = [
      new EspnRssAdapter(),
      new NflTransactionsAdapter(),
      new EspnRosterAdapter(),
      new RotoworldRssAdapter(),
    ];

    const result = await runScrape(db, adapters);

    // Build summary
    const summary = {
      totalItems: result.totalItems,
      adapters: result.adapterResults.map((ar) => ({
        adapter: ar.adapter,
        status: ar.status,
        items: ar.itemsFound,
        errors: ar.errorMessage ?? null,
        startedAt: ar.startedAt,
        completedAt: ar.completedAt,
      })),
      startedAt: result.startedAt,
      completedAt: result.completedAt,
    };

    return NextResponse.json({ success: true, summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  } finally {
    closeDb();
  }
}
