import Link from "next/link";
import { MedicalCode } from "@/types";
import { CopyButton } from "./CopyButton";

const systemBadgeStyles: Record<string, string> = {
  "ICD-10": "bg-accent-blue-soft text-accent-blue",
  HCPCS: "bg-accent-emerald-soft text-accent-emerald",
  CPT: "bg-accent-teal-soft text-accent-teal",
};

export function CodeCard({ code }: { code: MedicalCode }) {
  const badgeStyle = systemBadgeStyles[code.system] ?? "bg-accent-slate-soft text-accent-slate";
  const isDiscontinued = code.status === "discontinued";

  return (
    <Link
      href={`/code/${encodeURIComponent(code.code)}`}
      className={`block rounded-xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${
        isDiscontinued
          ? "border-accent-rose/30 bg-accent-rose-soft/30 hover:border-accent-rose/50"
          : "border-border-light bg-bg-card hover:border-border"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`font-mono text-base font-semibold ${
              isDiscontinued ? "text-accent-rose line-through" : "text-accent-blue"
            }`}
          >
            {code.code}
          </span>
          <span className={`rounded-md px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ${badgeStyle}`}>
            {code.system}
          </span>
          {isDiscontinued && (
            <span className="rounded-md bg-accent-rose px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white">
              Discontinued
            </span>
          )}
        </div>
        <CopyButton text={code.code} />
      </div>
      <p className={`text-sm font-medium ${isDiscontinued ? "text-text-secondary" : "text-text-primary"}`}>
        {code.description}
      </p>
      <p className="mt-1 text-xs text-text-muted">
        {code.category}
        {code.specialty && (
          <>
            <span className="mx-1.5 inline-block h-1 w-1 rounded-full bg-border align-middle" />
            {code.specialty}
          </>
        )}
      </p>
    </Link>
  );
}
