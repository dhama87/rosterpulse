"use client";

import { SeventhCharOption } from "@/types";

export function SeventhCharPicker({
  baseCode,
  options,
}: {
  baseCode: string;
  options: SeventhCharOption[];
}) {
  if (options.length === 0) return null;

  return (
    <div className="rounded-xl border border-border-light bg-bg-card p-4">
      <h4 className="mb-3 font-mono text-[0.63rem] font-semibold uppercase tracking-widest text-text-muted">
        7th Character Extension
      </h4>
      <p className="mb-3 text-xs text-text-muted">
        Select the appropriate 7th character for <strong>{baseCode}</strong>:
      </p>
      <div className="space-y-1.5">
        {options.map((opt) => (
          <div
            key={opt.character}
            className="flex items-center gap-3 rounded-lg border border-border-light px-3 py-2 text-sm transition-colors hover:border-accent-blue hover:bg-accent-blue-soft"
          >
            <span className="font-mono font-semibold text-accent-blue">
              {opt.character}
            </span>
            <span className="text-text-secondary">{opt.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
