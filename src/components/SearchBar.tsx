"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  placeholder?: string;
}

export function SearchBar({
  placeholder = "Search players or teams\u2026",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setQuery("");
      }
    },
    [query, router]
  );

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-64 rounded-lg border border-border bg-bg-card px-3 py-1.5 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-border-highlight focus:bg-bg-card-hover"
      />
    </form>
  );
}
