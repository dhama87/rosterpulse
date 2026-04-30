import { NextResponse } from "next/server";
import { createRosterService } from "@/services/createRosterService";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  if (q.length < 2) return NextResponse.json([]);

  const service = createRosterService();
  const players = await service.searchPlayers(q);

  const results = players.slice(0, 10).map((p) => ({
    id: p.id,
    name: p.name,
    team: p.team,
    position: p.position.replace(/\d+$/, ""),
    jerseyNumber: p.jerseyNumber,
  }));

  return NextResponse.json(results);
}
