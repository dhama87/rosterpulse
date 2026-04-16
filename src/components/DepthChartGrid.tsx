"use client";

import { useState } from "react";
import { DepthChartEntry, PositionGroup } from "@/types";
import { DepthChartRow } from "./DepthChartRow";
import { useFavoritePlayers } from "@/hooks/useFavorites";

type FilterTab = "all" | PositionGroup;

const tabs: { label: string; value: FilterTab }[] = [
  { label: "All", value: "all" },
  { label: "Offense", value: "offense" },
  { label: "Defense", value: "defense" },
  { label: "Special Teams", value: "specialTeams" },
];

interface DepthChartGridProps {
  depthChart: DepthChartEntry[];
}

export function DepthChartGrid({ depthChart }: DepthChartGridProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const { favs: favPlayers, toggle: togglePlayer } = useFavoritePlayers();

  const filtered =
    activeTab === "all"
      ? depthChart
      : depthChart.filter((e) => e.positionGroup === activeTab);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-lg px-3 py-2.5 sm:py-1.5 text-xs font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-text-primary text-bg"
                : "bg-bg-card text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-lg border border-border bg-bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                Pos
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                Starter
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                2nd
              </th>
              <th className="hidden sm:table-cell px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                3rd
              </th>
              <th className="hidden sm:table-cell px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wider text-text-muted">Stats</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => (
              <DepthChartRow
                key={entry.position}
                position={entry.position}
                players={entry.players}
                favPlayers={favPlayers}
                onToggleFav={togglePlayer}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
