"use client";

import { useState, useEffect } from "react";
import { GuidedNode } from "@/types";
import { GuidedStep } from "@/components/GuidedStep";
import Link from "next/link";

export default function GuidedFlowPage() {
  const [history, setHistory] = useState<GuidedNode[]>([]);
  const [currentNode, setCurrentNode] = useState<GuidedNode | null>(null);
  const [resultCodes, setResultCodes] = useState<string[] | null>(null);

  useEffect(() => {
    fetch("/api/guided")
      .then((r) => r.json())
      .then((node) => {
        setCurrentNode(node);
        setHistory([node]);
      });
  }, []);

  function handleSelect(option: GuidedNode["options"][0]) {
    if (option.resultCodes) {
      setResultCodes(option.resultCodes);
      return;
    }
    if (option.nextNodeId) {
      fetch(`/api/guided?nodeId=${option.nextNodeId}`)
        .then((r) => r.json())
        .then((node) => {
          setCurrentNode(node);
          setHistory((prev) => [...prev, node]);
        });
    }
  }

  function handleBack() {
    if (history.length <= 1) return;
    setResultCodes(null);
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    setCurrentNode(newHistory[newHistory.length - 1]);
  }

  if (resultCodes) {
    return (
      <div className="flex min-h-[460px] flex-col items-center bg-bg px-10 py-12">
        <h2 className="mb-2 font-display text-3xl">Suggested Codes</h2>
        <p className="mb-8 text-sm text-text-muted">
          Based on your selections, these codes may apply:
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {resultCodes.map((code) => (
            <Link
              key={code}
              href={`/code/${encodeURIComponent(code)}`}
              className="rounded-xl border border-border-light bg-bg-card px-6 py-4 text-center transition-all hover:border-accent-blue hover:shadow-md"
            >
              <div className="font-mono text-lg font-semibold text-accent-blue">
                {code}
              </div>
              <div className="mt-1 text-xs text-text-muted">View details →</div>
            </Link>
          ))}
        </div>
        <button
          onClick={handleBack}
          className="mt-8 rounded-lg border border-border bg-bg-card px-5 py-2 text-sm text-text-secondary"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  if (!currentNode) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-text-muted">
        Loading...
      </div>
    );
  }

  return (
    <GuidedStep
      node={currentNode}
      stepIndex={history.length - 1}
      totalSteps={5}
      onSelect={handleSelect}
      onBack={handleBack}
    />
  );
}
