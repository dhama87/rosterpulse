import { MedicalCode } from "@/types";

export function BillingContext({ code }: { code: MedicalCode }) {
  const { billing } = code;

  return (
    <aside className="w-80 shrink-0 border-l border-border-light bg-bg-card p-7">
      {/* Fee Schedule */}
      {billing.feeSchedule && (
        <div className="mb-4 rounded-xl bg-bg p-4">
          <h4 className="mb-2.5 font-mono text-[0.6rem] font-semibold uppercase tracking-widest text-text-muted">
            Medicare Fee Schedule ({billing.feeSchedule.year})
          </h4>
          <div className="mb-2">
            <div className="font-mono text-xl font-semibold">
              ${billing.feeSchedule.nonFacilityRate.toFixed(2)}
            </div>
            <div className="text-[0.7rem] text-text-muted">
              National avg — non-facility
            </div>
          </div>
          {[
            ["Facility rate", `$${billing.feeSchedule.facilityRate.toFixed(2)}`],
            ["Work RVU", billing.feeSchedule.workRVU.toFixed(2)],
            ["Total RVU", billing.feeSchedule.totalRVU.toFixed(2)],
            ["Conv. Factor", `$${billing.feeSchedule.conversionFactor.toFixed(2)}`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between border-b border-border-light py-1.5 text-[0.78rem] last:border-0"
            >
              <span className="text-text-secondary">{label}</span>
              <span className="font-mono font-semibold">{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Place of Service */}
      {billing.placeOfService && billing.placeOfService.length > 0 && (
        <div className="mb-4 rounded-xl bg-bg p-4">
          <h4 className="mb-2.5 font-mono text-[0.6rem] font-semibold uppercase tracking-widest text-text-muted">
            Place of Service
          </h4>
          {billing.placeOfService.map((pos) => (
            <div key={pos.code} className="flex items-center gap-2 py-1 text-[0.76rem]">
              <span className="rounded bg-accent-teal-soft px-1.5 py-0.5 font-mono text-[0.7rem] font-semibold text-accent-teal">
                {pos.code}
              </span>
              <span className="text-text-secondary">{pos.description}</span>
            </div>
          ))}
        </div>
      )}

      {/* Common Denials */}
      {billing.commonDenials && billing.commonDenials.length > 0 && (
        <div className="mb-4 rounded-xl bg-bg p-4">
          <h4 className="mb-2.5 font-mono text-[0.6rem] font-semibold uppercase tracking-widest text-text-muted">
            Common Denial Reasons
          </h4>
          {billing.commonDenials.map((d) => (
            <div key={d.code} className="mb-1.5 text-[0.76rem]">
              <span className="font-mono font-semibold text-accent-rose text-[0.72rem]">
                {d.code}
              </span>
              <span className="ml-1 text-text-secondary">{d.description}</span>
            </div>
          ))}
        </div>
      )}

      {/* Related Codes */}
      {code.details.relatedCodes && code.details.relatedCodes.length > 0 && (
        <div className="rounded-xl bg-bg p-4">
          <h4 className="mb-2.5 font-mono text-[0.6rem] font-semibold uppercase tracking-widest text-text-muted">
            Related Codes
          </h4>
          {code.details.relatedCodes.map((rc) => (
            <a
              key={rc}
              href={`/code/${encodeURIComponent(rc)}`}
              className="block py-1 font-mono text-sm font-semibold text-accent-blue hover:underline"
            >
              {rc}
            </a>
          ))}
        </div>
      )}
    </aside>
  );
}
