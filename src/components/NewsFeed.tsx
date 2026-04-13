"use client";

import { useState } from "react";
import { NewsItem, NewsCategory } from "@/types";
import { NewsCard } from "./NewsCard";

const filterOptions: { label: string; value: NewsCategory | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Injuries", value: "INJURY" },
  { label: "Transactions", value: "TRADE" },
  { label: "IR", value: "IR" },
  { label: "Depth Chart", value: "DEPTH_CHART" },
  { label: "Returns", value: "RETURN" },
  { label: "Suspensions", value: "SUSPENSION" },
  { label: "Signings", value: "SIGNING" },
];

interface NewsFeedProps {
  items: NewsItem[];
  title?: string;
  showFilters?: boolean;
  maxItems?: number;
}

export function NewsFeed({
  items,
  title = "Latest News",
  showFilters = true,
  maxItems,
}: NewsFeedProps) {
  const [activeFilter, setActiveFilter] = useState<NewsCategory | "ALL">("ALL");

  const filtered =
    activeFilter === "ALL"
      ? items
      : items.filter((item) => item.category === activeFilter);

  const displayed = maxItems ? filtered.slice(0, maxItems) : filtered;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
          {title}
        </h2>
        {showFilters && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setActiveFilter(opt.value)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  activeFilter === opt.value
                    ? "bg-text-primary text-bg"
                    : "bg-bg-card-hover text-text-secondary hover:text-text-primary"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {displayed.length > 0 ? (
          displayed.map((item) => <NewsCard key={item.id} item={item} />)
        ) : (
          <div className="px-4 py-8 text-center text-sm text-text-muted">
            No news items match this filter.
          </div>
        )}
      </div>
    </div>
  );
}
