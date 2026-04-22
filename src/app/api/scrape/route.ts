import { NextResponse } from "next/server";
import { getDb, closeDb } from "@/db/client";
import { createTables } from "@/db/schema";
import { seedFromMock } from "@/db/seed";
import { runScrape } from "@/scraper/orchestrator";
import { EspnRssAdapter } from "@/scraper/adapters/espn-rss";
import { NflTransactionsAdapter } from "@/scraper/adapters/nfl-transactions";
import { EspnRosterAdapter } from "@/scraper/adapters/espn-roster";
import { RotoworldRssAdapter } from "@/scraper/adapters/rotoworld-rss";
import { EspnScheduleAdapter } from "@/scraper/adapters/espn-schedule";
import { EspnDraftAdapter } from "@/scraper/adapters/espn-draft";

// Vercel crons use GET requests
export async function GET(request: Request) {
  return handleScrape(request);
}

export async function POST(request: Request) {
  return handleScrape(request);
}

async function handleScrape(request: Request) {
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

    // Ensure tables exist
    await createTables(db);

    // Seed if empty
    const countResult = await db.execute(
      "SELECT COUNT(*) as count FROM players"
    );
    const playerCount = countResult.rows[0].count as number;
    if (playerCount === 0) {
      await seedFromMock(db);
    }

    // Create adapters and run scrape
    const adapters = [
      new EspnRssAdapter(),
      new NflTransactionsAdapter(),
      new EspnRosterAdapter(),
      new RotoworldRssAdapter(),
      new EspnScheduleAdapter(),
      new EspnDraftAdapter(),
    ];

    const result = await runScrape(db, adapters);

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
