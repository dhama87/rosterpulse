import Link from "next/link";
import Image from "next/image";
import type { Game } from "@/types";

interface ScheduleBracketProps {
  game: Game;
  /** Starter injuries for both teams (optional, for injury badges) */
  injurySummary?: {
    awayOut: number;
    awayQuestionable: number;
    homeOut: number;
    homeQuestionable: number;
  };
  /** Whether away or home team is a favorite */
  favTeams?: Set<string>;
  /** Primetime style: "snf" | "mnf" | null */
  primetime?: "snf" | "mnf" | null;
  /** Playoff tag text, e.g. "Win & in" */
  playoffTag?: { text: string; color: string } | null;
}

function formatGameTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  });
}

export function ScheduleBracket({
  game,
  injurySummary,
  favTeams,
  primetime,
  playoffTag,
}: ScheduleBracketProps) {
  const isFavAway = favTeams?.has(game.awayTeam.id) ?? false;
  const isFavHome = favTeams?.has(game.homeTeam.id) ?? false;

  const isFinal = game.status === "final" && game.awayScore != null && game.homeScore != null;
  const awayWon = isFinal && (game.awayScore ?? 0) > (game.homeScore ?? 0);
  const homeWon = isFinal && (game.homeScore ?? 0) > (game.awayScore ?? 0);

  const borderClass =
    primetime === "snf"
      ? "border-status-blue/20 shadow-[0_0_12px_rgba(59,130,246,0.06)]"
      : primetime === "mnf"
        ? "border-status-amber/20 shadow-[0_0_12px_rgba(245,158,11,0.06)]"
        : "border-border";

  return (
    <div className="w-[220px]">
      <div className={`flex flex-col rounded-lg border overflow-hidden ${borderClass}`}>
        {/* Away team (top) */}
        <Link
          href={`/team/${game.awayTeam.id}`}
          className={`flex items-center gap-2.5 px-3 py-2.5 border-b-2 border-border/50 transition-colors hover:bg-bg-card-hover ${isFavAway ? "bg-status-blue-bg/30" : ""}`}
        >
          <Image
            src={game.awayTeam.logo}
            alt={game.awayTeam.name}
            width={26}
            height={26}
            className="h-[26px] w-[26px] object-contain"
          />
          <span className={`flex-1 text-[13px] font-semibold ${isFinal && !awayWon ? "text-text-muted" : "text-text-primary"}`}>
            {game.awayTeam.name}
          </span>
          {isFinal ? (
            <span className={`font-mono text-[13px] ${awayWon ? "font-bold text-text-primary" : "text-text-muted"}`}>
              {game.awayScore}
            </span>
          ) : (
            <span className="font-mono text-[11px] text-text-muted">
              {game.awayTeam.record}
            </span>
          )}
        </Link>

        {/* Home team (bottom) */}
        <Link
          href={`/team/${game.homeTeam.id}`}
          className={`flex items-center gap-2.5 px-3 py-2.5 transition-colors hover:bg-bg-card-hover ${isFavHome ? "bg-status-blue-bg/30" : ""}`}
        >
          <Image
            src={game.homeTeam.logo}
            alt={game.homeTeam.name}
            width={26}
            height={26}
            className="h-[26px] w-[26px] object-contain"
          />
          <span className={`flex-1 text-[13px] font-semibold ${isFinal && !homeWon ? "text-text-muted" : "text-text-primary"}`}>
            {game.homeTeam.name}
          </span>
          {isFinal ? (
            <span className={`font-mono text-[13px] ${homeWon ? "font-bold text-text-primary" : "text-text-muted"}`}>
              {game.homeScore}
            </span>
          ) : (
            <span className="font-mono text-[11px] text-text-muted">
              {game.homeTeam.record}
            </span>
          )}
        </Link>
      </div>

      {/* Game info / injury badges below bracket */}
      <div className="mt-1 flex items-center justify-between px-1">
        <span className="text-[10px] text-text-muted">
          {game.status === "final"
            ? "Final"
            : formatGameTime(game.gameTime)}
        </span>
        <div className="flex items-center gap-1.5">
          {injurySummary && injurySummary.awayOut + injurySummary.homeOut > 0 && (
            <span className="text-[9px] text-status-red">
              {injurySummary.awayOut + injurySummary.homeOut} Out
            </span>
          )}
          {injurySummary &&
            injurySummary.awayQuestionable + injurySummary.homeQuestionable > 0 && (
              <span className="text-[9px] text-status-amber">
                {injurySummary.awayQuestionable + injurySummary.homeQuestionable} Q
              </span>
            )}
        </div>
      </div>

      {/* Playoff tag */}
      {playoffTag && (
        <div className="mt-0.5 px-1">
          <span className={`text-[9px] font-semibold ${playoffTag.color}`}>
            {playoffTag.text}
          </span>
        </div>
      )}
    </div>
  );
}
