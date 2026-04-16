"use client";

import { useFavoritePlayers } from "@/hooks/useFavorites";
import { FavStar } from "./FavStar";

export function PlayerFavButton({ playerId }: { playerId: string }) {
  const { favs, toggle } = useFavoritePlayers();

  return (
    <FavStar
      active={favs.has(playerId)}
      onClick={() => toggle(playerId)}
      size="md"
    />
  );
}
