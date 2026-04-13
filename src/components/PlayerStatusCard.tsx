import { Player } from "@/types";

interface PlayerStatusCardProps {
  player: Player;
  lastVerified: string;
}

const borderColorMap: Record<string, string> = {
  Active: "border-status-green",
  Questionable: "border-status-amber",
  Doubtful: "border-status-amber",
  Out: "border-status-red",
  IR: "border-status-red",
  Suspended: "border-status-red",
  Holdout: "border-status-amber",
};

export function PlayerStatusCard({
  player,
  lastVerified,
}: PlayerStatusCardProps) {
  const borderColor = borderColorMap[player.injuryStatus] || "border-border";

  return (
    <div className={`rounded-lg border-l-4 bg-bg-card p-4 ${borderColor}`}>
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
        Current Status
      </h3>
      <p className="text-lg font-bold text-text-primary">
        {player.injuryStatus}
      </p>
      {player.injuryDetail && (
        <p className="mt-1 text-sm text-text-secondary">
          {player.injuryDetail}
        </p>
      )}
      <p className="mt-2 font-mono text-[10px] text-text-muted">
        Verified{" "}
        {new Date(lastVerified).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}
      </p>
    </div>
  );
}
