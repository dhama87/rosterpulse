"use client";

import { useState } from "react";
import { CCIEdit } from "@/types";

export default function CCIEditsPage() {
  const [code1, setCode1] = useState("");
  const [code2, setCode2] = useState("");
  const [result, setResult] = useState<CCIEdit | null | "none">(null);

  async function handleCheck() {
    if (!code1.trim() || !code2.trim()) return;
    // Simplified MVP: no dedicated CCI API route yet, so show the "no edit found" state.
    setResult("none");
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-bg-card px-3 py-2.5 text-sm font-mono outline-none focus:border-accent-blue";

  return (
    <div className="bg-bg px-7 py-8">
      <h1 className="font-display text-3xl">CCI Edits / Bundling Checker</h1>
      <p className="mt-1 mb-8 text-sm text-text-muted">
        Check if two codes can be billed together. Source: CMS NCCI edit files.
      </p>

      <div className="mx-auto max-w-lg rounded-xl border border-border-light bg-bg-card p-6">
        <div className="mb-4">
          <label className="mb-1.5 block font-mono text-[0.63rem] font-semibold uppercase tracking-widest text-text-muted">
            Code 1
          </label>
          <input
            type="text"
            value={code1}
            onChange={(e) => setCode1(e.target.value.toUpperCase())}
            placeholder="e.g., 99214"
            className={inputClass}
          />
        </div>
        <div className="mb-6">
          <label className="mb-1.5 block font-mono text-[0.63rem] font-semibold uppercase tracking-widest text-text-muted">
            Code 2
          </label>
          <input
            type="text"
            value={code2}
            onChange={(e) => setCode2(e.target.value.toUpperCase())}
            placeholder="e.g., 99213"
            className={inputClass}
          />
        </div>
        <button
          onClick={handleCheck}
          className="w-full rounded-xl bg-text-primary py-3 text-sm font-semibold text-white"
        >
          Check Bundling
        </button>

        {result === "none" && (
          <div className="mt-4 rounded-lg bg-accent-emerald-soft p-4 text-sm text-accent-emerald">
            ✓ No CCI edit found — these codes can likely be billed together.
            Always verify with your payer.
          </div>
        )}
      </div>
    </div>
  );
}
