import { createMockCodeService } from "@/services/mockCodeService";
import { CopyButton } from "@/components/CopyButton";
import { BillingContext } from "@/components/BillingContext";
import { SeventhCharPicker } from "@/components/SeventhCharPicker";
import { LateralityPicker } from "@/components/LateralityPicker";
import { notFound } from "next/navigation";
import Link from "next/link";

const service = createMockCodeService();

const systemBadge: Record<string, string> = {
  "ICD-10": "bg-accent-blue-soft text-accent-blue",
  HCPCS: "bg-accent-emerald-soft text-accent-emerald",
};

export default async function CodeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const code = service.getByCode(decodeURIComponent(id));
  if (!code) notFound();

  const badge = systemBadge[code.system] ?? "bg-accent-slate-soft text-accent-slate";
  const { details, billing } = code;
  const isDiscontinued = code.status === "discontinued";

  return (
    <div className={`flex min-h-[calc(100vh-200px)] ${isDiscontinued ? "border-t-4 border-accent-rose" : ""}`}>
      {/* Main Content */}
      <div className="flex-1 bg-bg p-8">
        <Link
          href="/results"
          className="mb-6 inline-block rounded-lg border border-border bg-bg-card px-4 py-2 text-sm text-text-secondary hover:border-text-secondary"
        >
          ← Back to Results
        </Link>

        {/* Discontinued warning banner */}
        {isDiscontinued && (
          <div className="mb-6 rounded-xl border-2 border-accent-rose bg-accent-rose-soft p-5">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-md bg-accent-rose px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wide text-white">
                ⚠ Discontinued
              </span>
              <strong className="text-sm text-accent-rose">
                This code is no longer billable.
              </strong>
            </div>
            {billing.medicalNecessity?.notes && (
              <p className="mt-2 text-sm text-text-secondary">
                {billing.medicalNecessity.notes}
              </p>
            )}
            {details.relatedCodes && details.relatedCodes.length > 0 && (
              <div className="mt-3 text-sm">
                <span className="font-semibold text-text-secondary">Use instead: </span>
                {details.relatedCodes.map((rc, i) => (
                  <span key={rc}>
                    {i > 0 && ", "}
                    <Link
                      href={`/code/${encodeURIComponent(rc)}`}
                      className="font-mono font-semibold text-accent-blue hover:underline"
                    >
                      {rc}
                    </Link>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Header */}
        <div className="mb-1 flex items-center gap-3">
          <span
            className={`font-mono text-2xl font-semibold ${
              isDiscontinued
                ? "text-accent-rose line-through"
                : "text-accent-blue"
            }`}
          >
            {code.code}
          </span>
          <span
            className={`rounded-md px-3 py-1 text-[0.68rem] font-bold uppercase tracking-wide ${badge}`}
          >
            {code.system}
          </span>
          {isDiscontinued && (
            <span className="rounded-md bg-accent-rose-soft px-2.5 py-1 text-[0.7rem] font-semibold text-accent-rose">
              Discontinued
            </span>
          )}
          {!isDiscontinued && billing.medicalNecessity?.covered && (
            <span className="rounded-md bg-accent-emerald-soft px-2.5 py-1 text-[0.7rem] font-semibold text-accent-emerald">
              ✓ Medically Necessary
            </span>
          )}
          <CopyButton text={code.code} />
        </div>
        <h1
          className={`font-display text-2xl ${
            isDiscontinued ? "text-text-muted line-through" : ""
          }`}
        >
          {code.description}
        </h1>
        <p className="mb-6 text-sm text-text-muted">
          {code.category} › {code.specialty}
        </p>

        {/* Age/Sex Restrictions */}
        {(details.ageRestriction || details.sexRestriction) && (
          <div className="mb-6 rounded-xl border border-accent-amber/20 bg-accent-amber-soft p-4 text-sm text-amber-900">
            <strong>Age/Sex Edit:</strong>{" "}
            {details.sexRestriction && `${details.sexRestriction === "M" ? "Male" : "Female"} only. `}
            {details.ageRestriction &&
              `Ages ${details.ageRestriction.min ?? 0}–${details.ageRestriction.max ?? "99+"}.`}
          </div>
        )}

        {/* Sequencing Rules */}
        {(details.codeFirst || details.useAdditionalCode || details.codeAlso) && (
          <div className="mb-6">
            <h3 className="mb-2 font-mono text-[0.63rem] font-semibold uppercase tracking-widest text-text-muted">
              Code Sequencing
            </h3>
            {details.codeFirst && (
              <div className="mb-1.5 rounded-lg bg-accent-blue-soft p-3 text-sm text-blue-900">
                <strong>Code First:</strong> {details.codeFirst}
              </div>
            )}
            {details.useAdditionalCode && (
              <div className="mb-1.5 rounded-lg bg-accent-blue-soft p-3 text-sm text-blue-900">
                <strong>Use Additional Code:</strong>{" "}
                {details.useAdditionalCode}
              </div>
            )}
            {details.codeAlso && (
              <div className="mb-1.5 rounded-lg bg-accent-blue-soft p-3 text-sm text-blue-900">
                <strong>Code Also:</strong> {details.codeAlso}
              </div>
            )}
          </div>
        )}

        {/* 7th Character & Laterality */}
        {details.seventhCharacters && details.seventhCharacters.length > 0 && (
          <div className="mb-6">
            <SeventhCharPicker
              baseCode={code.code}
              options={details.seventhCharacters}
            />
          </div>
        )}
        {details.laterality && details.laterality.length > 0 && (
          <div className="mb-6">
            <LateralityPicker options={details.laterality} />
          </div>
        )}

        {/* Includes / Excludes */}
        {details.includes && details.includes.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 font-mono text-[0.63rem] font-semibold uppercase tracking-widest text-text-muted">
              Includes
            </h3>
            <ul className="list-inside list-disc text-sm text-text-secondary">
              {details.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {details.excludes1 && details.excludes1.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 font-mono text-[0.63rem] font-semibold uppercase tracking-widest text-text-muted">
              Excludes 1 (mutually exclusive)
            </h3>
            <ul className="list-inside list-disc text-sm text-text-secondary">
              {details.excludes1.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Modifiers */}
        {billing.modifiers && billing.modifiers.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 font-mono text-[0.63rem] font-semibold uppercase tracking-widest text-text-muted">
              Common Modifiers
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {billing.modifiers.map((mod) => (
                <div
                  key={mod.code}
                  className="inline-flex items-center gap-2 rounded-xl border border-border-light px-3.5 py-2 text-sm"
                >
                  <span className="font-mono font-semibold text-accent-violet">
                    -{mod.code}
                  </span>
                  <span className="text-text-secondary">{mod.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CCI Edits */}
        {billing.cciEdits && billing.cciEdits.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 font-mono text-[0.63rem] font-semibold uppercase tracking-widest text-text-muted">
              CCI Bundling Alerts
            </h3>
            <div className="rounded-xl border border-accent-amber/20 bg-accent-amber-soft p-4 text-sm text-amber-900">
              <strong>⚠ Bundling Alert:</strong> This code has CCI edit
              restrictions. Check the CCI Edits tool for details.
            </div>
          </div>
        )}

        {/* Documentation Requirements */}
        {billing.documentationReqs && billing.documentationReqs.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 font-mono text-[0.63rem] font-semibold uppercase tracking-widest text-text-muted">
              Documentation Requirements
            </h3>
            {billing.documentationReqs.map((req) => (
              <div
                key={req}
                className="mb-1.5 rounded-lg bg-accent-blue-soft p-3 text-sm text-blue-900"
              >
                {req}
              </div>
            ))}
          </div>
        )}

        {/* Payer Rules */}
        {billing.payerRules && billing.payerRules.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 font-mono text-[0.63rem] font-semibold uppercase tracking-widest text-text-muted">
              Payer-Specific Rules
            </h3>
            {billing.payerRules.map((rule) => (
              <div
                key={rule.payer}
                className="mb-2 rounded-xl border border-border-light p-4"
              >
                <div className="mb-1 text-sm font-semibold">{rule.payer}</div>
                <div className="text-[0.78rem] text-text-secondary">
                  <strong>Timely Filing:</strong> {rule.timelyFiling}
                </div>
                <div className="text-[0.78rem] text-text-secondary">
                  <strong>Prior Auth:</strong> {rule.priorAuth}
                </div>
                {rule.frequencyLimit && (
                  <div className="text-[0.78rem] text-text-secondary">
                    <strong>Frequency:</strong> {rule.frequencyLimit}
                  </div>
                )}
                {rule.telehealth && (
                  <div className="text-[0.78rem] text-text-secondary">
                    <strong>Telehealth:</strong> {rule.telehealth}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Source */}
        <div className="mt-8 text-xs text-text-muted">
          Source:{" "}
          <a
            href={code.source.url}
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {code.source.system}
          </a>{" "}
          · Last updated: {code.source.lastUpdated}
        </div>
      </div>

      {/* Sidebar */}
      <BillingContext code={code} />
    </div>
  );
}
