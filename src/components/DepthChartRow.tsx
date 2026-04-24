import Link from "next/link";
import { Player } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { FavStar } from "./FavStar";
import { getStatLine } from "@/utils/statLine";

/** Show DRAFT badge until 1 week before the regular season opener (~first Thursday of September). */
function isRookieBadgeActive(): boolean {
  const now = new Date();
  const year = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear();
  // NFL season typically starts first Thursday after Labor Day (Sep 4-10 range).
  // Use Sep 1 as cutoff — badge disappears 1 week before earliest possible opener.
  const cutoff = new Date(year, 7, 25); // Aug 25
  return now < cutoff;
}

interface DepthChartRowProps {
  position: string;
  players: Player[];
  favPlayers?: Set<string>;
  onToggleFav?: (playerId: string) => void;
}

export function DepthChartRow({ position, players, favPlayers, onToggleFav }: DepthChartRowProps) {
  // Clean position display (remove trailing numbers like DE1 -> DE)
  const displayPos = position.replace(/\d+$/, "");

  const starter = players.find((p) => p.depthOrder === 1);
  const second = players.find((p) => p.depthOrder === 2);
  const third = players.find((p) => p.depthOrder === 3);

  const borderColor =
    starter?.injuryStatus === "Out" ||
    starter?.injuryStatus === "IR" ||
    starter?.injuryStatus === "Suspended"
      ? "border-l-status-red"
      : starter?.injuryStatus === "Questionable" ||
          starter?.injuryStatus === "Doubtful"
        ? "border-l-status-amber"
        : "border-l-transparent";

  return (
    <tr
      className={`border-b border-border transition-colors hover:bg-bg-card-hover border-l-2 ${borderColor}`}
    >
      <td className="px-3 py-2 font-mono text-xs font-semibold text-text-muted">
        {displayPos}
      </td>
      <td className="px-3 py-2">
        {starter && (
          <div className="flex items-center gap-1">
            {onToggleFav && (
              <FavStar
                active={favPlayers?.has(starter.id) ?? false}
                onClick={() => onToggleFav(starter.id)}
              />
            )}
            <PlayerCell player={starter} showDetail />
          </div>
        )}
      </td>
      <td className="px-3 py-2">
        {second && <PlayerCell player={second} />}
      </td>
      <td className="hidden sm:table-cell px-3 py-2">
        {third && <PlayerCell player={third} />}
      </td>
      <td className="hidden sm:table-cell px-3 py-2 text-right">
        {starter && (
          <span className="font-mono text-[11px] text-text-muted">
            {getStatLine(starter)}
          </span>
        )}
      </td>
    </tr>
  );
}

function PlayerCell({
  player,
  showDetail = false,
}: {
  player: Player;
  showDetail?: boolean;
}) {
  const isOut =
    player.injuryStatus === "Out" ||
    player.injuryStatus === "IR" ||
    player.injuryStatus === "Suspended";

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/player/${player.id}`}
        className={`text-sm hover:underline ${
          isOut ? "text-text-muted line-through" : "text-text-primary"
        }`}
      >
        <span className="font-mono text-[11px] text-text-muted">
          #{player.jerseyNumber}
        </span>{" "}
        {player.name}
      </Link>
      {player.depthChange === "up" && (
        <span className="text-[10px] text-status-green">▲</span>
      )}
      {player.depthChange === "down" && (
        <span className="text-[10px] text-status-red">▼</span>
      )}
      {player.experience === 0 && isRookieBadgeActive() && (
        <span className="inline-flex items-center rounded-full bg-status-blue-bg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-status-blue">
          Draft
        </span>
      )}
      <StatusBadge status={player.injuryStatus} showOnlyIfNotActive />
      {showDetail && player.injuryDetail && (
        <span className="text-[10px] text-text-muted">
          {player.injuryDetail}
        </span>
      )}
      {showDetail && player.estimatedReturn && (
        <span className="text-[10px] font-medium text-status-blue">
          ETA: {player.estimatedReturn}
        </span>
      )}
      {showDetail && player.practiceStatus && player.injuryStatus !== "Active" && (
        <span className={`text-[10px] font-medium ${
          player.practiceStatus === "Full" ? "text-status-green" :
          player.practiceStatus === "Limited" ? "text-status-amber" :
          "text-status-red"
        }`}>
          {player.practiceStatus}
        </span>
      )}
    </div>
  );
}
