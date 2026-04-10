"use client";

import { DenialReference } from "@/types";

const freqStyles = {
  high: "bg-accent-rose-soft text-accent-rose",
  medium: "bg-accent-amber-soft text-accent-amber",
  low: "bg-accent-emerald-soft text-accent-emerald",
};

export function DenialCodeTable({
  denials,
}: {
  denials: DenialReference[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border-light bg-bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-border">
            <th className="px-4 py-3 text-left font-mono text-[0.63rem] font-semibold uppercase tracking-widest text-text-muted">
              Code
            </th>
            <th className="px-4 py-3 text-left font-mono text-[0.63rem] font-semibold uppercase tracking-widest text-text-muted">
              Type
            </th>
            <th className="px-4 py-3 text-left font-mono text-[0.63rem] font-semibold uppercase tracking-widest text-text-muted">
              Description
            </th>
            <th className="px-4 py-3 text-left font-mono text-[0.63rem] font-semibold uppercase tracking-widest text-text-muted">
              How to Resolve
            </th>
            <th className="px-4 py-3 text-left font-mono text-[0.63rem] font-semibold uppercase tracking-widest text-text-muted">
              Freq
            </th>
          </tr>
        </thead>
        <tbody>
          {denials.map((d) => (
            <tr
              key={d.code}
              className="border-b border-border-light last:border-0 hover:bg-bg"
            >
              <td className="px-4 py-3">
                <span className="font-mono font-semibold text-accent-rose">
                  {d.code}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-text-muted">{d.type}</td>
              <td className="px-4 py-3 text-text-secondary">
                {d.description}
              </td>
              <td className="px-4 py-3 text-[0.76rem] text-text-secondary">
                {d.resolution}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded px-2 py-0.5 text-[0.65rem] font-semibold capitalize ${freqStyles[d.frequency]}`}
                >
                  {d.frequency}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
