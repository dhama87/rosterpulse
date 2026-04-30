import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createRosterService } from "@/services/createRosterService";
import { StatusBadge } from "@/components/StatusBadge";
import { CompareSearch } from "@/components/CompareSearch";
import type { Player, Team } from "@/types";

export const metadata: Metadata = {
  title: "Compare Players",
  description:
    "Compare NFL players side by side. Stats, injury status, depth chart position, and physical attributes.",
  alternates: { canonical: "/compare" },
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

function PlayerColumn({ player, team }: { player: Player; team: Team }) {
  const pos = player.position.replace(/\d+$/, "");
  const depthLabel = player.depthOrder === 1 ? "Starter" : player.depthOrder === 2 ? "Backup" : "3rd String";

  return (
    <div className="flex-1 min-w-0">
      {/* Header */}
      <Link href={`/player/${player.id}`} className="block group">
        <div className="flex items-center gap-3 mb-3">
          {player.espnId ? (
            <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-bg-card-hover shrink-0">
              <Image
                src={`https://a.espncdn.com/i/headshots/nfl/players/full/${player.espnId}.png`}
                alt={player.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-bg-card-hover text-lg font-bold text-text-muted shrink-0">
              #{player.jerseyNumber}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-base font-bold text-text-primary group-hover:underline truncate">
              {player.name}
            </div>
            <div className="text-xs text-text-muted">
              #{player.jerseyNumber} &middot; {pos} &middot; {team.fullName}
            </div>
          </div>
        </div>
      </Link>

      {/* Status */}
      <div className="flex items-center gap-2 mb-4">
        <StatusBadge status={player.injuryStatus} />
        {player.experience === 0 && (
          <span className="inline-flex items-center rounded-full bg-status-blue-bg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-status-blue">
            Rookie
          </span>
        )}
        <span className="text-[11px] text-text-muted">{depthLabel}</span>
      </div>

      {/* Physical */}
      <div className="space-y-2 mb-4">
        <CompareRow label="Height" value={player.height} />
        <CompareRow label="Weight" value={`${player.weight} lbs`} />
        <CompareRow label="Age" value={String(player.age)} />
        <CompareRow label="Experience" value={`${player.experience} yr${player.experience !== 1 ? "s" : ""}`} />
        <CompareRow label="College" value={player.college} />
      </div>

      {/* Stats */}
      {Object.keys(player.stats).length > 0 && (
        <div>
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Season Stats
          </h3>
          <div className="space-y-2">
            {Object.entries(player.stats).map(([key, value]) => (
              <CompareRow
                key={key}
                label={key.replace(/([A-Z])/g, " $1").trim()}
                value={typeof value === "number" && value % 1 !== 0 ? value.toFixed(1) : String(value)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CompareRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-text-muted text-xs uppercase tracking-wider">{label}</span>
      <span className="font-medium text-text-primary">{value}</span>
    </div>
  );
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { p1, p2 } = await searchParams;
  const playerId1 = typeof p1 === "string" ? p1 : "";
  const playerId2 = typeof p2 === "string" ? p2 : "";

  const service = createRosterService();

  const player1 = playerId1 ? await service.getPlayer(playerId1) : null;
  const player2 = playerId2 ? await service.getPlayer(playerId2) : null;

  const team1 = player1 ? service.getTeam(player1.team) : null;
  const team2 = player2 ? service.getTeam(player2.team) : null;

  const hasComparison = player1 && team1 && player2 && team2;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Compare Players</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Side-by-side stats, status, and attributes.
        </p>
      </div>

      {/* Search inputs */}
      <CompareSearch
        currentP1={playerId1}
        currentP2={playerId2}
        name1={player1 ? `${player1.name} (${player1.team})` : ""}
        name2={player2 ? `${player2.name} (${player2.team})` : ""}
      />

      {/* Comparison */}
      {hasComparison ? (
        <div className="mt-6 flex gap-4 sm:gap-6">
          <PlayerColumn player={player1} team={team1} />
          <div className="w-px bg-border shrink-0" />
          <PlayerColumn player={player2} team={team2} />
        </div>
      ) : (
        <div className="mt-12 text-center text-sm text-text-muted">
          {(playerId1 || playerId2) && !hasComparison
            ? "One or both players not found. Try searching again."
            : "Search for two players to compare them side by side."}
        </div>
      )}
    </div>
  );
}
