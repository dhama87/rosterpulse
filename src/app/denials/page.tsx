"use client";

import { useState, useEffect } from "react";
import { DenialReference } from "@/types";
import { DenialCodeTable } from "@/components/DenialCodeTable";

export default function DenialsPage() {
  const [denials, setDenials] = useState<DenialReference[]>([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (typeFilter) params.set("type", typeFilter);
    fetch(`/api/denials?${params.toString()}`)
      .then((r) => r.json())
      .then(setDenials);
  }, [query, typeFilter]);

  return (
    <div className="bg-bg px-7 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Denial Code Reference</h1>
          <p className="mt-1 text-sm text-text-muted">
            CARC, RARC, and Group Codes — search by code or description
          </p>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search denial codes..."
          className="w-72 rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm outline-none focus:border-accent-blue"
        />
      </div>

      <div className="mb-5 flex gap-2">
        {["", "CARC", "RARC", "Group"].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              typeFilter === t
                ? "bg-text-primary text-white"
                : "border border-border bg-bg-card text-text-secondary"
            }`}
          >
            {t || "All"}
          </button>
        ))}
      </div>

      <DenialCodeTable denials={denials} />
    </div>
  );
}
