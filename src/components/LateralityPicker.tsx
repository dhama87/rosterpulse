"use client";

import { LateralityOption } from "@/types";

export function LateralityPicker({
  options,
}: {
  options: LateralityOption[];
}) {
  if (options.length === 0) return null;

  return (
    <div className="rounded-xl border border-border-light bg-bg-card p-4">
      <h4 className="mb-3 font-mono text-[0.63rem] font-semibold uppercase tracking-widest text-text-muted">
        Laterality
      </h4>
      <div className="flex gap-2">
        {options.map((opt) => (
          <div
            key={opt.digit}
            className="flex-1 rounded-lg border border-border-light px-3 py-2 text-center text-sm transition-colors hover:border-accent-blue hover:bg-accent-blue-soft"
          >
            <div className="font-mono font-semibold text-accent-blue">
              {opt.digit}
            </div>
            <div className="text-xs text-text-secondary">{opt.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
