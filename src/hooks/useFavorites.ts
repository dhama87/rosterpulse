"use client";

import { useState, useEffect, useCallback } from "react";

const TEAMS_KEY = "rosterpulse-fav-teams";
const PLAYERS_KEY = "rosterpulse-fav-players";

function load(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function save(key: string, set: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...set]));
}

export function useFavoriteTeams() {
  const [favs, setFavs] = useState<Set<string>>(new Set());

  useEffect(() => {
    setFavs(load(TEAMS_KEY));
  }, []);

  const toggle = useCallback((teamId: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) next.delete(teamId);
      else next.add(teamId);
      save(TEAMS_KEY, next);
      return next;
    });
  }, []);

  return { favs, toggle };
}

export function useFavoritePlayers() {
  const [favs, setFavs] = useState<Set<string>>(new Set());

  useEffect(() => {
    setFavs(load(PLAYERS_KEY));
  }, []);

  const toggle = useCallback((playerId: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      save(PLAYERS_KEY, next);
      return next;
    });
  }, []);

  return { favs, toggle };
}
