"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ScheduleBracket } from "./ScheduleBracket";
import type { Game, PlayoffScenario } from "@/types";

interface TimeSlot {
  label: string;
  primetime: "snf" | "mnf" | null;
  games: Game[];
}

interface ScheduleGridProps {
  games: Game[];
  week: number;
  maxWeek: number;
  byeTeams: string[];
  injuryMap: Record<string, { out: number; questionable: number }>;
  playoffScenarios?: PlayoffScenario[];
}

function groupByTimeSlot(games: Game[]): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const slotMap = new Map<string, { label: string; primetime: "snf" | "mnf" | null; games: Game[] }>();

  for (const game of games) {
    const d = new Date(game.gameTime);
    const dayOfWeek = d.getUTCDay(); // 0=Sun, 1=Mon, ..., 4=Thu
    const hour = d.getUTCHours();

    let label: string;
    let primetime: "snf" | "mnf" | null = null;

    if (dayOfWeek === 4) {
      // Thursday
      label = "Thursday Night Football";
    } else if (dayOfWeek === 0 && hour >= 23) {
      // Sunday ~8pm ET = 00-01 UTC Monday
      label = "Sunday Night Football";
      primetime = "snf";
    } else if (dayOfWeek === 1 && hour <= 2) {
      // Sunday night game that starts late
      label = "Sunday Night Football";
      primetime = "snf";
    } else if (dayOfWeek === 1 || (dayOfWeek === 2 && hour <= 5)) {
      // Monday
      label = "Monday Night Football";
      primetime = "mnf";
    } else if (dayOfWeek === 0 && hour < 20) {
      // Sunday early/late
      if (hour < 19) {
        label = "Sunday Early · 1:00 PM";
      } else {
        label = "Sunday Late · 4:25 PM";
      }
    } else if (dayOfWeek === 6) {
      // Saturday (late season / playoffs)
      label = "Saturday";
    } else {
      label = d.toLocaleDateString("en-US", { weekday: "long", timeZone: "America/New_York" });
    }

    const existing = slotMap.get(label);
    if (existing) {
      existing.games.push(game);
    } else {
      slotMap.set(label, { label, primetime, games: [game] });
    }
  }

  for (const slot of slotMap.values()) {
    slots.push(slot);
  }

  return slots;
}

function getPlayoffTag(
  game: Game,
  scenarios?: PlayoffScenario[]
): { text: string; color: string } | null {
  if (!scenarios || scenarios.length === 0) return null;

  const awayScenario = scenarios.find((s) => s.teamId === game.awayTeam.id);
  const homeScenario = scenarios.find((s) => s.teamId === game.homeTeam.id);

  // Check for elimination game
  if (
    awayScenario?.mustWin &&
    awayScenario.status === "in_hunt" &&
    homeScenario?.mustWin &&
    homeScenario.status === "in_hunt"
  ) {
    return { text: "Elimination game", color: "text-status-red" };
  }

  // Check for win-and-in
  if (awayScenario?.scenarioText?.includes("win") && awayScenario?.scenarioText?.includes("clinch")) {
    return { text: "Win & in", color: "text-status-green" };
  }
  if (homeScenario?.scenarioText?.includes("win") && homeScenario?.scenarioText?.includes("clinch")) {
    return { text: "Win & in", color: "text-status-green" };
  }

  // Controls destiny
  if (awayScenario?.scenarioText?.includes("destiny") || homeScenario?.scenarioText?.includes("destiny")) {
    return { text: "Controls destiny", color: "text-status-blue" };
  }

  return null;
}

export function ScheduleGrid({
  games,
  week,
  maxWeek,
  byeTeams,
  injuryMap,
  playoffScenarios,
}: ScheduleGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // No useFavoriteTeams hook exists yet — use empty set
  const favSet = new Set<string>();
  const slots = groupByTimeSlot(games);

  function navigateWeek(newWeek: number) {
    if (newWeek < 1 || newWeek > maxWeek) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("week", String(newWeek));
    router.push(`/schedule?${params.toString()}`);
  }

  return (
    <div>
      {/* Week Navigator */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigateWeek(week - 1)}
          disabled={week <= 1}
          className="rounded bg-bg-card px-2.5 py-1 text-sm text-text-muted hover:bg-bg-card-hover disabled:opacity-30"
        >
          ‹
        </button>
        <span className="text-base font-bold text-text-primary tracking-wide">
          WEEK {week}
        </span>
        <button
          onClick={() => navigateWeek(week + 1)}
          disabled={week >= maxWeek}
          className="rounded bg-bg-card px-2.5 py-1 text-sm text-text-muted hover:bg-bg-card-hover disabled:opacity-30"
        >
          ›
        </button>
      </div>

      {/* Time Slot Sections */}
      {slots.map((slot) => (
        <div key={slot.label} className="mb-7">
          <div className="mb-3 border-b border-border/50 pb-1.5">
            <span className="text-[9px] font-bold uppercase tracking-[2px] text-text-muted">
              {slot.label}
            </span>
          </div>
          <div className="flex flex-wrap gap-5">
            {slot.games.map((game) => {
              const awayInjury = injuryMap[game.awayTeam.id];
              const homeInjury = injuryMap[game.homeTeam.id];

              return (
                <ScheduleBracket
                  key={game.id}
                  game={game}
                  favTeams={favSet}
                  primetime={slot.primetime}
                  injurySummary={
                    awayInjury || homeInjury
                      ? {
                          awayOut: awayInjury?.out ?? 0,
                          awayQuestionable: awayInjury?.questionable ?? 0,
                          homeOut: homeInjury?.out ?? 0,
                          homeQuestionable: homeInjury?.questionable ?? 0,
                        }
                      : undefined
                  }
                  playoffTag={getPlayoffTag(game, playoffScenarios)}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* No games */}
      {games.length === 0 && (
        <div className="py-12 text-center text-sm text-text-muted">
          No games scheduled for this week yet.
        </div>
      )}

      {/* Bye Week */}
      {byeTeams.length > 0 && (
        <div className="mt-8 rounded-lg border border-border/30 bg-bg-card/50 px-4 py-3">
          <span className="text-[9px] font-bold uppercase tracking-[1.5px] text-text-muted">
            Bye Week:{" "}
          </span>
          <span className="text-[11px] text-text-secondary">
            {byeTeams.join(" · ")}
          </span>
        </div>
      )}
    </div>
  );
}
