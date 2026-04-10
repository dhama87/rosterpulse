"use client";

import { useState } from "react";
import { EMCalculatorInput, EMCalculatorResult } from "@/types";

export function EMCalculatorForm() {
  const [mode, setMode] = useState<"mdm" | "time">("mdm");
  const [patientType, setPatientType] = useState<"new" | "established">(
    "established"
  );
  const [problemCount, setProblemCount] =
    useState<EMCalculatorInput["problemCount"]>("limited");
  const [dataComplexity, setDataComplexity] =
    useState<EMCalculatorInput["dataComplexity"]>("limited");
  const [riskLevel, setRiskLevel] =
    useState<EMCalculatorInput["riskLevel"]>("low");
  const [totalMinutes, setTotalMinutes] = useState(25);
  const [result, setResult] = useState<EMCalculatorResult | null>(null);

  async function calculate() {
    const input: EMCalculatorInput = {
      mode,
      patientType,
      ...(mode === "mdm"
        ? { problemCount, dataComplexity, riskLevel }
        : { totalMinutes }),
    };

    const res = await fetch("/api/em-calculator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    setResult(data);
  }

  const selectClass =
    "w-full rounded-lg border border-border bg-bg-card px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-blue";

  return (
    <div className="mx-auto max-w-2xl">
      {/* Mode Toggle */}
      <div className="mb-6 flex gap-2">
        {(["mdm", "time"] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setResult(null);
            }}
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
              mode === m
                ? "bg-text-primary text-white"
                : "border border-border bg-bg-card text-text-secondary"
            }`}
          >
            {m === "mdm" ? "MDM-Based" : "Time-Based"}
          </button>
        ))}
      </div>

      {/* Patient Type */}
      <div className="mb-4">
        <label className="mb-1.5 block font-mono text-[0.63rem] font-semibold uppercase tracking-widest text-text-muted">
          Patient Type
        </label>
        <select
          value={patientType}
          onChange={(e) => setPatientType(e.target.value as "new" | "established")}
          className={selectClass}
        >
          <option value="established">Established Patient</option>
          <option value="new">New Patient</option>
        </select>
      </div>

      {mode === "mdm" ? (
        <>
          <div className="mb-4">
            <label className="mb-1.5 block font-mono text-[0.63rem] font-semibold uppercase tracking-widest text-text-muted">
              Number & Complexity of Problems
            </label>
            <select
              value={problemCount}
              onChange={(e) =>
                setProblemCount(
                  e.target.value as EMCalculatorInput["problemCount"]
                )
              }
              className={selectClass}
            >
              <option value="minimal">
                Minimal — 1 self-limited or minor problem
              </option>
              <option value="limited">
                Limited — 2+ self-limited; OR 1 acute uncomplicated; OR 1
                stable chronic
              </option>
              <option value="multiple">
                Multiple — 1+ chronic with mild exacerbation; OR 2+ stable
                chronic; OR 1 undiagnosed new problem
              </option>
              <option value="extensive">
                Extensive — 1+ chronic with severe exacerbation; OR threat to
                life/bodily function
              </option>
            </select>
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block font-mono text-[0.63rem] font-semibold uppercase tracking-widest text-text-muted">
              Amount & Complexity of Data
            </label>
            <select
              value={dataComplexity}
              onChange={(e) =>
                setDataComplexity(
                  e.target.value as EMCalculatorInput["dataComplexity"]
                )
              }
              className={selectClass}
            >
              <option value="minimal">
                Minimal — Minimal or no data reviewed
              </option>
              <option value="limited">
                Limited — Review prior records OR order each unique test
              </option>
              <option value="moderate">
                Moderate — Independent interpretation; OR discussion with
                external physician; OR 3+ data sources
              </option>
              <option value="extensive">
                Extensive — Independent interpretation of test by another
                physician; OR discussion + 3+ sources
              </option>
            </select>
          </div>

          <div className="mb-6">
            <label className="mb-1.5 block font-mono text-[0.63rem] font-semibold uppercase tracking-widest text-text-muted">
              Risk of Complications
            </label>
            <select
              value={riskLevel}
              onChange={(e) =>
                setRiskLevel(
                  e.target.value as EMCalculatorInput["riskLevel"]
                )
              }
              className={selectClass}
            >
              <option value="minimal">
                Minimal — Minimal risk from additional testing/treatment
              </option>
              <option value="low">
                Low — OTC drug management; minor surgery without risk factors
              </option>
              <option value="moderate">
                Moderate — Prescription drug management; minor surgery with risk
                factors; elective major surgery
              </option>
              <option value="high">
                High — Drug therapy requiring intensive monitoring; emergency
                surgery; hospitalization
              </option>
            </select>
          </div>
        </>
      ) : (
        <div className="mb-6">
          <label className="mb-1.5 block font-mono text-[0.63rem] font-semibold uppercase tracking-widest text-text-muted">
            Total Time (minutes)
          </label>
          <input
            type="number"
            value={totalMinutes}
            onChange={(e) => setTotalMinutes(parseInt(e.target.value) || 0)}
            min={0}
            className={selectClass}
          />
        </div>
      )}

      <button
        onClick={calculate}
        className="w-full rounded-xl bg-text-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-text-primary/90"
      >
        Calculate E/M Level
      </button>

      {/* Result */}
      {result && (
        <div className="mt-6 rounded-xl border border-accent-blue/20 bg-accent-blue-soft p-6">
          <div className="mb-1 flex items-center gap-3">
            <span className="font-mono text-2xl font-bold text-accent-blue">
              {result.recommendedCode}
            </span>
            <span className="rounded-md bg-accent-blue/10 px-2.5 py-1 text-xs font-semibold text-accent-blue">
              Level {result.level}
            </span>
          </div>
          <p className="mb-1 text-sm font-medium">{result.mdmLevel} MDM</p>
          <p className="mb-4 text-sm text-text-secondary">
            {result.explanation}
          </p>
          {result.timeRange && (
            <p className="mb-4 text-sm text-text-secondary">
              Time range: {result.timeRange}
            </p>
          )}
          <h4 className="mb-2 font-mono text-[0.63rem] font-semibold uppercase tracking-widest text-text-muted">
            Documentation Tips
          </h4>
          <ul className="list-inside list-disc text-sm text-text-secondary">
            {result.documentationTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
