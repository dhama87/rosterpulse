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
      {player.injuryStatus !== "Active" && (
        <div className="mt-3 space-y-1.5 border-t border-border pt-3">
          {player.injuryDate && (
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-muted">Injured</span>
              <span className="text-[11px] font-medium text-text-secondary">
                {new Date(player.injuryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          )}
          {player.irDesignation && (
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-muted">IR Window</span>
              <span className="text-[11px] font-medium text-text-secondary">
                {player.irDesignation === "season" ? "Season-ending" : `${player.irDesignation} return`}
              </span>
            </div>
          )}
          {player.estimatedReturn && (
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-muted">Est. Return</span>
              <span className="text-[11px] font-semibold text-status-blue">
                {player.estimatedReturn}
              </span>
            </div>
          )}
          {player.practiceStatus && (
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-muted">Practice</span>
              <span className={`text-[11px] font-semibold ${
                player.practiceStatus === "Full" ? "text-status-green" :
                player.practiceStatus === "Limited" ? "text-status-amber" :
                "text-status-red"
              }`}>
                {player.practiceStatus === "DNP" ? "Did Not Participate" : `${player.practiceStatus} Participant`}
              </span>
            </div>
          )}
        </div>
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
