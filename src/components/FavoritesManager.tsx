"use client";

import { useEffect, useState } from "react";
import { SavedCodeSet } from "@/types";
import Link from "next/link";

const STORAGE_KEY = "medcode-favorites";

function loadFavorites(): SavedCodeSet[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
}

function saveFavorites(favorites: SavedCodeSet[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

export function FavoritesManager() {
  const [favorites, setFavorites] = useState<SavedCodeSet[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [codes, setCodes] = useState("");

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  function handleAdd() {
    if (!name.trim() || !codes.trim()) return;
    const newFav: SavedCodeSet = {
      id: Date.now().toString(),
      name: name.trim(),
      codes: codes.split(",").map((c) => c.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };
    const updated = [...favorites, newFav];
    setFavorites(updated);
    saveFavorites(updated);
    setName("");
    setCodes("");
    setShowAdd(false);
  }

  function handleRemove(id: string) {
    const updated = favorites.filter((f) => f.id !== id);
    setFavorites(updated);
    saveFavorites(updated);
  }

  return (
    <div className="mx-auto mt-8 max-w-xl">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-mono text-[0.65rem] font-semibold uppercase tracking-widest text-text-muted">
          Saved Code Sets
        </h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-sm text-accent-blue hover:underline"
        >
          {showAdd ? "Cancel" : "+ Add Set"}
        </button>
      </div>

      {showAdd && (
        <div className="mb-4 rounded-xl border border-border-light bg-bg-card p-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Set name (e.g., Diabetes Wellness Visit)"
            className="mb-2 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent-blue"
          />
          <input
            type="text"
            value={codes}
            onChange={(e) => setCodes(e.target.value)}
            placeholder="Codes, comma-separated (e.g., E11.9, 99214, 83036)"
            className="mb-2 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm outline-none focus:border-accent-blue"
          />
          <button
            onClick={handleAdd}
            className="rounded-lg bg-text-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Save
          </button>
        </div>
      )}

      {favorites.length === 0 && !showAdd && (
        <p className="text-sm text-text-muted">
          No saved code sets yet. Click &quot;+ Add Set&quot; to save your frequently used
          code combinations.
        </p>
      )}

      <div className="space-y-2">
        {favorites.map((fav) => (
          <div
            key={fav.id}
            className="flex items-center justify-between rounded-xl border border-border-light bg-bg-card p-4"
          >
            <div>
              <div className="text-sm font-semibold">{fav.name}</div>
              <div className="mt-0.5 flex gap-1.5">
                {fav.codes.map((code) => (
                  <Link
                    key={code}
                    href={`/code/${encodeURIComponent(code)}`}
                    className="font-mono text-xs font-semibold text-accent-blue hover:underline"
                  >
                    {code}
                  </Link>
                ))}
              </div>
            </div>
            <button
              onClick={() => handleRemove(fav.id)}
              className="text-xs text-text-muted hover:text-accent-rose"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
