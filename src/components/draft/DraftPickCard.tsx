import Image from "next/image";
import type { DraftPick, Team } from "@/types";

interface DraftPickCardProps {
  pick: DraftPick;
  team?: Team;
  isNew?: boolean;
  showRound?: boolean;
}

export function DraftPickCard({ pick, team, isNew, showRound }: DraftPickCardProps) {
  const isFilled = pick.playerName !== "";

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all ${
        isNew
          ? "animate-pulse border-status-green/40 bg-status-green-bg/20"
          : "border-border bg-bg-card"
      }`}
    >
      <div className="flex flex-col items-center justify-center w-10">
        <span className="text-xs text-text-muted">
          {showRound ? `R${pick.round}` : ""}
        </span>
        <span className="text-lg font-bold font-mono text-text-primary">
          {pick.pickNumber}
        </span>
      </div>

      {team && (
        <Image
          src={team.logo}
          alt={team.name}
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
        />
      )}

      <div className="flex-1 min-w-0">
        {isFilled ? (
          <>
            <div className="text-sm font-semibold text-text-primary truncate">
              {pick.playerName}
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span className="font-medium text-text-secondary">{pick.position}</span>
              <span>{pick.college}</span>
            </div>
          </>
        ) : (
          <div className="text-sm text-text-muted">{team?.fullName ?? "TBD"}</div>
        )}
      </div>

      {pick.isTradeUp && (
        <span className="shrink-0 rounded-full bg-status-amber-bg px-2 py-0.5 text-[10px] font-semibold text-status-amber">
          TRADE
        </span>
      )}

      {isNew && (
        <span className="shrink-0 rounded-full bg-status-green-bg px-2 py-0.5 text-[10px] font-semibold text-status-green">
          JUST IN
        </span>
      )}
    </div>
  );
}
