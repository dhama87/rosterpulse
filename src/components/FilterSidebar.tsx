"use client";

import { CodeSystem } from "@/types";

interface FilterSidebarProps {
  systems: { system: CodeSystem; count: number }[];
  specialties: { name: string; count: number }[];
  selectedSystem?: CodeSystem;
  selectedSpecialty?: string;
  onSystemChange: (system?: CodeSystem) => void;
  onSpecialtyChange: (specialty?: string) => void;
}

export function FilterSidebar({
  systems,
  specialties,
  selectedSystem,
  selectedSpecialty,
  onSystemChange,
  onSpecialtyChange,
}: FilterSidebarProps) {
  return (
    <aside className="w-56 shrink-0 border-r border-border-light bg-bg-card p-6">
      <div className="mb-7">
        <h3 className="mb-3 font-mono text-[0.65rem] font-semibold uppercase tracking-widest text-text-muted">
          Code System
        </h3>
        {systems.map((s) => (
          <label
            key={s.system}
            className="mb-2.5 flex cursor-pointer items-center gap-2.5 text-sm text-text-secondary"
          >
            <input
              type="checkbox"
              checked={!selectedSystem || selectedSystem === s.system}
              onChange={() =>
                onSystemChange(
                  selectedSystem === s.system ? undefined : s.system
                )
              }
              className="h-4 w-4 rounded border-border accent-accent-blue"
            />
            {s.system}
            <span className="ml-auto text-xs text-text-muted">{s.count}</span>
          </label>
        ))}
      </div>

      <div>
        <h3 className="mb-3 font-mono text-[0.65rem] font-semibold uppercase tracking-widest text-text-muted">
          Specialty
        </h3>
        {specialties.map((s) => (
          <button
            key={s.name}
            onClick={() =>
              onSpecialtyChange(
                selectedSpecialty === s.name ? undefined : s.name
              )
            }
            className={`block w-full py-1.5 text-left text-sm transition-colors ${
              selectedSpecialty === s.name
                ? "font-semibold text-accent-blue"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>
    </aside>
  );
}
