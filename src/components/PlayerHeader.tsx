import Image from "next/image";
import { Player } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { PlayerFavButton } from "./PlayerFavButton";

interface PlayerHeaderProps {
  player: Player;
}

export function PlayerHeader({ player }: PlayerHeaderProps) {
  const displayPos = player.position.replace(/\d+$/, "");

  return (
    <div className="flex items-start gap-5">
      {player.espnId ? (
        <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-bg-card-hover">
          <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-text-muted">
            #{player.jerseyNumber}
          </div>
          <Image
            src={`https://a.espncdn.com/i/headshots/nfl/players/full/${player.espnId}.png`}
            alt={player.name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-bg-card-hover text-2xl font-bold text-text-muted">
          #{player.jerseyNumber}
        </div>
      )}
      <div>
        <div className="flex items-center gap-3">
          <PlayerFavButton playerId={player.id} />
          <h1 className="text-2xl font-bold text-text-primary">
            {player.name}
          </h1>
          <StatusBadge status={player.injuryStatus} />
          {player.experience === 0 && (
            <span className="inline-flex items-center rounded-full bg-status-blue-bg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-status-blue">
              Draft &apos;{new Date().getFullYear().toString().slice(-2)}
            </span>
          )}
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
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
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
