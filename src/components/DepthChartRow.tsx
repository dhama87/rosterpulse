import Link from "next/link";
import { Player } from "@/types";
import { StatusBadge } from "./StatusBadge";

interface DepthChartRowProps {
  position: string;
  players: Player[];
}

export function DepthChartRow({ position, players }: DepthChartRowProps) {
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
        {starter && <PlayerCell player={starter} showDetail />}
      </td>
      <td className="px-3 py-2">
        {second && <PlayerCell player={second} />}
      </td>
      <td className="px-3 py-2">
        {third && <PlayerCell player={third} />}
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
      <StatusBadge status={player.injuryStatus} showOnlyIfNotActive />
      {showDetail && player.injuryDetail && (
        <span className="text-[10px] text-text-muted">
          {player.injuryDetail}
        </span>
      )}
    </div>
  );
}
