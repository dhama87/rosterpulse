"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "medcode-recent-searches";
const MAX_RECENT = 8;

export function addRecentSearch(query: string) {
  if (typeof window === "undefined") return;
  const existing: string[] = JSON.parse(
    localStorage.getItem(STORAGE_KEY) ?? "[]"
  );
  const updated = [query, ...existing.filter((q) => q !== query)].slice(
    0,
    MAX_RECENT
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function RecentSearches() {
  const [searches, setSearches] = useState<string[]>([]);

  useEffect(() => {
    setSearches(
      JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")
    );
  }, []);

  if (searches.length === 0) return null;

  return (
    <div className="mx-auto mt-6 max-w-xl">
      <h3 className="mb-2 font-mono text-[0.65rem] font-semibold uppercase tracking-widest text-text-muted">
        Recent Searches
      </h3>
      <div className="flex flex-wrap gap-2">
        {searches.map((q) => (
          <Link
            key={q}
            href={`/results?q=${encodeURIComponent(q)}`}
            className="rounded-full bg-accent-blue/5 px-3.5 py-1.5 text-sm text-accent-blue hover:bg-accent-blue/10"
          >
            {q}
          </Link>
        ))}
      </div>
    </div>
  );
}
