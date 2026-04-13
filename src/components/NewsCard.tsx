import Link from "next/link";
import { NewsItem, NewsCategory } from "@/types";

const categoryConfig: Record<
  NewsCategory,
  { label: string; bg: string; text: string }
> = {
  INJURY: { label: "INJURY", bg: "bg-status-red-bg", text: "text-status-red" },
  TRADE: {
    label: "TRADE",
    bg: "bg-status-blue-bg",
    text: "text-status-blue",
  },
  SIGNING: {
    label: "SIGNING",
    bg: "bg-status-blue-bg",
    text: "text-status-blue",
  },
  IR: { label: "IR", bg: "bg-status-red-bg", text: "text-status-red" },
  DEPTH_CHART: {
    label: "DEPTH CHART",
    bg: "bg-status-green-bg",
    text: "text-status-green",
  },
  SUSPENSION: {
    label: "SUSPENSION",
    bg: "bg-status-red-bg",
    text: "text-status-red",
  },
  RETURN: {
    label: "RETURN",
    bg: "bg-status-green-bg",
    text: "text-status-green",
  },
};

function formatTimestamp(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

interface NewsCardProps {
  item: NewsItem;
}

export function NewsCard({ item }: NewsCardProps) {
  const catConfig = categoryConfig[item.category];

  return (
    <div className="border-b border-border px-4 py-3 transition-colors hover:bg-bg-card-hover">
      <div className="mb-1.5 flex items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${catConfig.bg} ${catConfig.text}`}
        >
          {catConfig.label}
        </span>
        <span className="font-mono text-[11px] text-text-muted">
          {formatTimestamp(item.timestamp)}
        </span>
      </div>
      <h3 className="mb-1 text-sm font-medium leading-snug text-text-primary">
        <Link
          href={`/player/${item.playerId}`}
          className="hover:underline"
        >
          {item.playerName}
        </Link>
        <span className="text-text-muted">
          {" "}
          &middot; {item.position} &middot; {item.team}
        </span>
      </h3>
      <p className="text-xs leading-relaxed text-text-secondary">
        {item.description}
      </p>
      {item.source && (
        <p className="mt-1 font-mono text-[10px] text-text-muted">
          {item.source}
        </p>
      )}
    </div>
  );
}
