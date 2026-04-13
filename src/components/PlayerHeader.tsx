import { Player } from "@/types";
import { StatusBadge } from "./StatusBadge";

interface PlayerHeaderProps {
  player: Player;
}

export function PlayerHeader({ player }: PlayerHeaderProps) {
  const displayPos = player.position.replace(/\d+$/, "");

  return (
    <div className="flex items-start gap-5">
      {/* Photo placeholder */}
      <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-bg-card-hover text-2xl font-bold text-text-muted">
        #{player.jerseyNumber}
      </div>
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text-primary">
            {player.name}
          </h1>
          <StatusBadge status={player.injuryStatus} />
        </div>
        <div className="mt-1 flex items-center gap-2 text-sm text-text-secondary">
          <span className="font-semibold">
            {displayPos}
            {player.depthOrder === 1
              ? "1"
              : player.depthOrder === 2
                ? "2"
                : "3"}
          </span>
          <span className="text-text-muted">&middot;</span>
          <span>#{player.jerseyNumber}</span>
          <span className="text-text-muted">&middot;</span>
          <span>{player.team}</span>
        </div>
        <div className="mt-2 flex gap-4 text-xs text-text-muted">
          <span>{player.height}</span>
          <span>{player.weight} lbs</span>
          <span>Age {player.age}</span>
          <span>Yr {player.experience}</span>
          <span>{player.college}</span>
        </div>
      </div>
    </div>
  );
}
