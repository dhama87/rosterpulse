import Link from "next/link";
import Image from "next/image";
import { Team } from "@/types";

interface TeamCardProps {
  team: Team;
  newsCount: number;
}

export function TeamCard({ team, newsCount }: TeamCardProps) {
  const hasBreakingNews = newsCount > 0;

  return (
    <Link
      href={`/team/${team.id}`}
      className={`group flex items-center gap-3 rounded-lg border bg-bg-card px-3 py-2.5 transition-all hover:bg-bg-card-hover ${
        hasBreakingNews
          ? "border-status-amber/30 shadow-[0_0_8px_rgba(245,158,11,0.08)]"
          : "border-border"
      }`}
    >
      <Image src={team.logo} alt={team.name} width={32} height={32} className="h-8 w-8 object-contain" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-text-primary group-hover:text-white">
          {team.name}
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-text-muted">
          <span>{team.record}</span>
          <span className="text-text-muted/60">BYE {team.byeWeek}</span>
        </div>
      </div>
      {hasBreakingNews && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-status-amber-bg text-[10px] font-bold text-status-amber">
          {newsCount}
        </span>
      )}
    </Link>
  );
}
