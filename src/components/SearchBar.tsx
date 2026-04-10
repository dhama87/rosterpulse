"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar({
  defaultValue = "",
  compact = false,
}: {
  defaultValue?: string;
  compact?: boolean;
}) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/results?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <svg
        className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search symptoms, conditions, or procedures..."
        className={`w-full rounded-xl border-2 border-border bg-bg-card pl-12 pr-4 font-sans text-text-primary shadow-sm outline-none transition-colors placeholder:text-text-muted focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10 ${
          compact ? "py-2.5 text-sm" : "py-4 text-base"
        }`}
      />
    </form>
  );
}
