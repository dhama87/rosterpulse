import { NextResponse } from "next/server";
import { createRosterService } from "@/services/createRosterService";
import type { DraftLiveResponse } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const since = searchParams.get("since");

  const service = createRosterService();
  const meta = await service.getDraftMeta();
  const year = parseInt(meta.draftYear ?? "2026", 10);
  const allPicks = await service.getDraftPicks(year);

  // Filter to only filled picks (have a playerName)
  const filledPicks = allPicks.filter((p) => p.playerName !== "");

  // If `since` param, return only picks after that timestamp
  const newPicks = since
    ? filledPicks.filter((p) => p.timestamp && p.timestamp > since)
    : filledPicks;

  // Determine current pick (next unfilled)
  const nextUnfilled = allPicks.find((p) => p.playerName === "");
  const currentPick = nextUnfilled?.pickNumber ?? filledPicks.length + 1;

  // Check if draft is currently active
  const draftDates = JSON.parse(meta.draftDates ?? "[]") as string[];
  const now = new Date();
  const isActive = draftDates.some((dateStr) => {
    const start = new Date(dateStr);
    const end = new Date(start.getTime() + 12 * 60 * 60 * 1000); // 12 hour window (aligned with page mode)
    return now >= start && now <= end;
  });

  const response: DraftLiveResponse = {
    currentPick,
    onTheClock: nextUnfilled
      ? { teamId: nextUnfilled.teamId, timeRemaining: 0 }
      : null,
    picks: newPicks,
    lastUpdated: meta.lastUpdated ?? new Date().toISOString(),
    isActive,
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
