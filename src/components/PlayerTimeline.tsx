import { NewsItem, NewsCategory } from "@/types";

const dotColor: Record<NewsCategory, string> = {
  INJURY: "bg-status-red",
  TRADE: "bg-status-blue",
  SIGNING: "bg-status-blue",
  IR: "bg-status-red",
  DEPTH_CHART: "bg-status-green",
  SUSPENSION: "bg-status-red",
  RETURN: "bg-status-green",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface PlayerTimelineProps {
  newsItems: NewsItem[];
}

export function PlayerTimeline({ newsItems }: PlayerTimelineProps) {
  if (newsItems.length === 0) {
    return (
      <p className="py-4 text-sm text-text-muted">
        No recent news for this player.
      </p>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

      <div className="space-y-4">
        {newsItems.map((item) => (
          <div key={item.id} className="relative flex gap-4 pl-6">
            {/* Timeline dot */}
            <div
              className={`absolute left-0 top-1.5 h-[14px] w-[14px] rounded-full border-2 border-bg ${dotColor[item.category]}`}
            />
            <div>
              <p className="font-mono text-[11px] text-text-muted">
                {formatDate(item.timestamp)}
              </p>
              <h4 className="mt-0.5 text-sm font-medium text-text-primary">
                {item.headline}
              </h4>
              <p className="mt-0.5 text-xs text-text-secondary">
                {item.description}
              </p>
              {item.source && (
                <p className="mt-1 font-mono text-[10px] text-text-muted">
                  {item.source}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
