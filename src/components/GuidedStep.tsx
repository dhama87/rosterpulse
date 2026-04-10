"use client";

import { GuidedNode } from "@/types";

interface GuidedStepProps {
  node: GuidedNode;
  stepIndex: number;
  totalSteps: number;
  onSelect: (option: GuidedNode["options"][0]) => void;
  onBack: () => void;
}

export function GuidedStep({
  node,
  stepIndex,
  totalSteps,
  onSelect,
  onBack,
}: GuidedStepProps) {
  return (
    <div className="flex min-h-[460px] flex-col items-center bg-bg px-10 py-12">
      {/* Progress */}
      <div className="mb-10 flex items-center gap-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1 w-10 rounded-full ${
              i < stepIndex
                ? "bg-accent-blue"
                : i === stepIndex
                  ? "bg-accent-blue/50"
                  : "bg-border"
            }`}
          />
        ))}
      </div>

      <h2 className="mb-2 max-w-lg text-center font-display text-3xl">
        {node.question}
      </h2>
      <p className="mb-8 text-sm text-text-muted">
        Select an option to narrow down results
      </p>

      <div className="grid w-full max-w-xl grid-cols-2 gap-2.5">
        {node.options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => onSelect(opt)}
            className="rounded-xl border-2 border-border-light bg-bg-card p-4 text-left transition-all hover:border-accent-blue hover:shadow-sm"
          >
            <h4 className="text-sm font-semibold">{opt.label}</h4>
            {opt.description && (
              <p className="mt-0.5 text-xs text-text-muted">
                {opt.description}
              </p>
            )}
          </button>
        ))}
      </div>

      {stepIndex > 0 && (
        <button
          onClick={onBack}
          className="mt-6 rounded-lg border border-border bg-bg-card px-5 py-2 text-sm text-text-secondary"
        >
          ← Previous
        </button>
      )}
    </div>
  );
}
