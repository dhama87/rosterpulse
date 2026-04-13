import Link from "next/link";
import { Player, DepthChartEntry, Team } from "@/types";

interface PlayerSidebarProps {
  player: Player;
  team: Team;
  depthChartEntry?: DepthChartEntry;
}

export function PlayerSidebar({
  player,
  team,
  depthChartEntry,
}: PlayerSidebarProps) {
  const displayPos = player.position.replace(/\d+$/, "");

  return (
    <div className="space-y-5">
      {/* Depth Chart Position */}
      {depthChartEntry && (
        <div className="rounded-lg border border-border bg-bg-card p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            {displayPos} Depth Chart
          </h3>
          <div className="space-y-1.5">
            {depthChartEntry.players.map((p) => (
              <Link
                key={p.id}
                href={`/player/${p.id}`}
                className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                  p.id === player.id
                    ? "bg-bg-card-hover font-medium text-text-primary"
                    : "text-text-secondary hover:bg-bg-card-hover hover:text-text-primary"
                }`}
              >
                <span>
                  {displayPos}
                  {p.depthOrder} &mdash; {p.name}
                </span>
                <span className="font-mono text-[11px] text-text-muted">
                  #{p.jerseyNumber}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Next Game (placeholder) */}
      <div className="rounded-lg border border-border bg-bg-card p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Next Game
        </h3>
        <p className="text-sm text-text-secondary">{team.fullName}</p>
        <p className="mt-1 text-xs text-text-muted">
          Schedule data coming soon
        </p>
      </div>

      {/* Season Stats */}
      <div className="rounded-lg border border-border bg-bg-card p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Season Stats
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(player.stats)
            .slice(0, 4)
            .map(([key, value]) => (
              <div key={key}>
                <p className="font-mono text-[10px] uppercase text-text-muted">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </p>
                <p className="text-lg font-bold text-text-primary">
                  {typeof value === "number" && value % 1 !== 0
                    ? value.toFixed(1)
                    : value}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
