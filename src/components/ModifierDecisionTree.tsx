"use client";

import { useState } from "react";

interface TreeNode {
  question: string;
  options: { label: string; next?: TreeNode; result?: string }[];
}

const decisionTree: TreeNode = {
  question: "What situation are you coding?",
  options: [
    {
      label: "Separate E/M on same day as a procedure",
      next: {
        question:
          "Was the E/M significant and separately identifiable from the procedure?",
        options: [
          {
            label: "Yes — separate complaint or condition",
            result: "Use modifier -25 on the E/M code",
          },
          {
            label: "No — part of the procedure's pre/post work",
            result: "Do NOT bill a separate E/M",
          },
        ],
      },
    },
    {
      label: "Two procedures that might be bundled",
      next: {
        question:
          "Are the procedures at different anatomic sites or separate sessions?",
        options: [
          {
            label: "Different anatomic sites",
            result: "Use modifier -59 or -XS (separate structure)",
          },
          {
            label: "Different encounters/sessions",
            result: "Use modifier -59 or -XE (separate encounter)",
          },
          {
            label: "Same site, same session",
            result:
              "Check CCI edits. If bundled with indicator 0, cannot unbundle.",
          },
        ],
      },
    },
    {
      label: "Repeat procedure by same physician",
      result: "Use modifier -76 (repeat procedure by same physician)",
    },
    {
      label: "Repeat procedure by different physician",
      result: "Use modifier -77 (repeat procedure by different physician)",
    },
    {
      label: "Bilateral procedure",
      result: "Use modifier -50 (bilateral procedure) OR -RT/-LT for each side",
    },
    {
      label: "Professional component only (no equipment)",
      result: "Use modifier -26 (professional component)",
    },
    {
      label: "Technical component only (equipment, no interpretation)",
      result: "Use modifier -TC (technical component)",
    },
  ],
};

export function ModifierDecisionTree() {
  const [path, setPath] = useState<TreeNode[]>([decisionTree]);
  const [result, setResult] = useState<string | null>(null);

  function handleSelect(option: TreeNode["options"][0]) {
    if (option.result) {
      setResult(option.result);
    } else if (option.next) {
      setPath((prev) => [...prev, option.next!]);
    }
  }

  function handleBack() {
    setResult(null);
    setPath((prev) => prev.slice(0, -1));
  }

  function handleReset() {
    setResult(null);
    setPath([decisionTree]);
  }

  const current = path[path.length - 1];

  if (result) {
    return (
      <div className="rounded-xl border border-accent-blue/20 bg-accent-blue-soft p-6 text-center">
        <h3 className="mb-2 font-display text-xl">Recommendation</h3>
        <p className="mb-4 text-sm text-blue-900">{result}</p>
        <div className="flex justify-center gap-2">
          <button
            onClick={handleBack}
            className="rounded-lg border border-border bg-bg-card px-4 py-2 text-sm text-text-secondary"
          >
            ← Back
          </button>
          <button
            onClick={handleReset}
            className="rounded-lg bg-text-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-2 text-center font-display text-xl">
        {current.question}
      </h3>
      <div className="mx-auto max-w-lg space-y-2">
        {current.options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => handleSelect(opt)}
            className="block w-full rounded-xl border-2 border-border-light bg-bg-card p-4 text-left text-sm transition-all hover:border-accent-blue"
          >
            {opt.label}
          </button>
        ))}
      </div>
      {path.length > 1 && (
        <div className="mt-4 text-center">
          <button
            onClick={handleBack}
            className="rounded-lg border border-border bg-bg-card px-4 py-2 text-sm text-text-secondary"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
