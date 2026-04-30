"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  name: string;
  team: string;
  position: string;
  jerseyNumber: number;
}

interface CompareSearchProps {
  currentP1: string;
  currentP2: string;
  name1?: string;
  name2?: string;
}

function PlayerSearchInput({
  value,
  displayName,
  placeholder,
  onSelect,
}: {
  value: string;
  displayName: string;
  placeholder: string;
  onSelect: (id: string, name: string) => void;
}) {
  const [query, setQuery] = useState(displayName);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const search = useCallback((q: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    timerRef.current = setTimeout(async () => {
      const res = await fetch(`/api/players/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
      setOpen(data.length > 0);
    }, 200);
  }, []);

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          search(e.target.value);
        }}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-border-highlight focus:bg-bg-card-hover"
      />
      {open && (
        <div className="absolute z-20 top-full mt-1 left-0 right-0 max-h-60 overflow-y-auto rounded-lg border border-border bg-bg-card shadow-lg">
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                const label = `${r.name} (${r.team})`;
                setQuery(label);
                setOpen(false);
                onSelect(r.id, label);
              }}
              className="flex w-full items-center justify-between px-3 py-2 text-sm text-text-primary hover:bg-bg-card-hover transition-colors text-left"
            >
              <span>
                <span className="font-medium">{r.name}</span>
                <span className="text-text-muted ml-2 text-xs">{r.position} &middot; {r.team}</span>
              </span>
              <span className="font-mono text-[11px] text-text-muted">#{r.jerseyNumber}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CompareSearch({ currentP1, currentP2, name1 = "", name2 = "" }: CompareSearchProps) {
  const [p1, setP1] = useState(currentP1);
  const [p2, setP2] = useState(currentP2);
  const [label1, setLabel1] = useState(name1);
  const [label2, setLabel2] = useState(name2);
  const router = useRouter();

  const handleCompare = useCallback(() => {
    if (p1 && p2) {
      router.push(`/compare?p1=${encodeURIComponent(p1)}&p2=${encodeURIComponent(p2)}`);
    }
  }, [p1, p2, router]);

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <PlayerSearchInput
        value={p1}
        displayName={label1}
        placeholder="Search player 1…"
        onSelect={(id, name) => { setP1(id); setLabel1(name); }}
      />
      <PlayerSearchInput
        value={p2}
        displayName={label2}
        placeholder="Search player 2…"
        onSelect={(id, name) => { setP2(id); setLabel2(name); }}
      />
      <button
        type="button"
        onClick={handleCompare}
        disabled={!p1 || !p2}
        className="rounded-lg bg-text-primary px-4 py-2 text-sm font-semibold text-bg transition-colors hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Compare
      </button>
    </div>
  );
}
