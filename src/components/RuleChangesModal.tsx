"use client";

import { useEffect, useRef, useState } from "react";
import { ruleChanges } from "@/data/rule-changes";

export function RuleChangesModal() {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (ruleChanges.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-text-muted hover:text-text-secondary transition-colors"
      >
        2026 Rule Changes
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Drawer */}
          <div
            ref={drawerRef}
            className="relative w-full max-w-2xl rounded-t-xl border border-border bg-bg-card p-6 shadow-2xl"
            style={{ maxHeight: "70vh", overflowY: "auto" }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-primary">
                2026 NFL Rule Changes
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-text-muted hover:text-text-secondary text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              {ruleChanges.map((rule, i) => (
                <div key={i} className="border-b border-border pb-4 last:border-0">
                  <h3 className="text-sm font-semibold text-text-primary">
                    {rule.title}
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    {rule.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
