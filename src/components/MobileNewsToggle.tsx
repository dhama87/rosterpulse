"use client";

import { useState } from "react";
import { NewsItem } from "@/types";
import { NewsFeed } from "./NewsFeed";

interface MobileNewsToggleProps {
  items: NewsItem[];
  title?: string;
  showFilters?: boolean;
}

export function MobileNewsToggle({ items, title, showFilters }: MobileNewsToggleProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden border-t border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-text-secondary active:bg-bg-card-hover"
      >
        <span>{title ?? "Latest News"} ({items.length})</span>
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="max-h-[60vh] overflow-y-auto border-t border-border bg-bg-card">
          <NewsFeed items={items} title={title} showFilters={showFilters} maxItems={20} />
        </div>
      )}
    </div>
  );
}
