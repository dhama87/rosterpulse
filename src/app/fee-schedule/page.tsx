"use client";

import { useState } from "react";
import { FeeData } from "@/types";
import { createMockCodeService } from "@/services/mockCodeService";

export default function FeeSchedulePage() {
  const [code, setCode] = useState("");
  const [fee, setFee] = useState<FeeData | null | "not-found">(null);

  function handleLookup() {
    if (!code.trim()) return;
    // Client-side lookup from the service
    // In production this would be an API call
    const service = createMockCodeService();
    const result = service.getFeeSchedule(code.trim());
    setFee(result ?? "not-found");
  }

  return (
    <div className="bg-bg px-7 py-8">
      <h1 className="font-display text-3xl">Fee Schedule Lookup</h1>
      <p className="mt-1 mb-8 text-sm text-text-muted">
        Medicare Physician Fee Schedule (MPFS) — RVUs, conversion factor, and
        rates. Source: CMS.
      </p>

      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter procedure code (e.g., 99213)"
            className="flex-1 rounded-lg border border-border bg-bg-card px-3 py-2.5 font-mono text-sm outline-none focus:border-accent-blue"
          />
          <button
            onClick={handleLookup}
            className="rounded-lg bg-text-primary px-5 py-2.5 text-sm font-semibold text-white"
          >
            Look Up
          </button>
        </div>

        {fee === "not-found" && (
          <div className="rounded-lg bg-accent-amber-soft p-4 text-sm text-amber-900">
            No fee schedule data found for code {code}. This code may not be in
            the mock dataset.
          </div>
        )}

        {fee && fee !== "not-found" && (
          <div className="rounded-xl border border-border-light bg-bg-card p-6">
            <div className="mb-4">
              <span className="font-mono text-2xl font-semibold text-accent-blue">
                {code}
              </span>
              <span className="ml-2 text-sm text-text-muted">
                Medicare Fee Schedule {fee.year}
              </span>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-bg p-4">
                <div className="font-mono text-xl font-semibold">
                  ${fee.nonFacilityRate.toFixed(2)}
                </div>
                <div className="text-xs text-text-muted">Non-Facility Rate</div>
              </div>
              <div className="rounded-lg bg-bg p-4">
                <div className="font-mono text-xl font-semibold">
                  ${fee.facilityRate.toFixed(2)}
                </div>
                <div className="text-xs text-text-muted">Facility Rate</div>
              </div>
            </div>

            <h3 className="mb-2 font-mono text-[0.63rem] font-semibold uppercase tracking-widest text-text-muted">
              RVU Breakdown
            </h3>
            {[
              ["Work RVU", fee.workRVU],
              ["Practice Expense RVU", fee.practiceExpenseRVU],
              ["Malpractice RVU", fee.malpracticeRVU],
              ["Total RVU", fee.totalRVU],
              ["Conversion Factor", `$${fee.conversionFactor.toFixed(2)}`],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="flex justify-between border-b border-border-light py-2 text-sm last:border-0"
              >
                <span className="text-text-secondary">{label}</span>
                <span className="font-mono font-semibold">
                  {typeof value === "number" ? value.toFixed(2) : value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
