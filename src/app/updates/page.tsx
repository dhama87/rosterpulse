import Link from "next/link";
import { createMockCodeService } from "@/services/mockCodeService";

const service = createMockCodeService();

const badgeStyles = {
  new: "bg-accent-emerald-soft text-accent-emerald",
  revised: "bg-accent-blue-soft text-accent-blue",
  deleted: "bg-accent-rose-soft text-accent-rose",
};

export default function UpdatesPage() {
  const updates = service.getCodeUpdates();
  const newCount = updates.filter((u) => u.changeType === "new").length;
  const revisedCount = updates.filter((u) => u.changeType === "revised").length;
  const deletedCount = updates.filter((u) => u.changeType === "deleted").length;

  return (
    <div className="bg-bg px-7 py-8">
      <h1 className="font-display text-3xl">Code Update Tracker</h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        ICD-10 (Oct 1) · HCPCS (Quarterly)
      </p>

      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { count: newCount, label: "New codes", color: "emerald" },
          { count: revisedCount, label: "Revised", color: "blue" },
          { count: deletedCount, label: "Discontinued", color: "rose" },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-xl border p-5 bg-accent-${s.color}-soft border-accent-${s.color}/10`}
          >
            <div className={`font-display text-3xl text-accent-${s.color}`}>
              {s.count}
            </div>
            <div className={`text-sm font-medium text-accent-${s.color}`}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {updates.map((u) => {
          const isDeleted = u.changeType === "deleted";
          return (
            <div
              key={`${u.code}-${u.changeType}`}
              className={`flex items-center gap-4 rounded-xl border p-4 ${
                isDeleted
                  ? "border-accent-rose/30 bg-accent-rose-soft/40"
                  : "border-border-light bg-bg-card"
              }`}
            >
              <span
                className={`shrink-0 rounded-md px-2.5 py-1 text-[0.65rem] font-bold uppercase ${badgeStyles[u.changeType]}`}
              >
                {isDeleted ? "Discontinued" : u.changeType}
              </span>
              <div className="flex-1">
                <div>
                  <span
                    className={`font-mono font-semibold ${
                      isDeleted
                        ? "text-accent-rose line-through decoration-2"
                        : "text-accent-blue"
                    }`}
                  >
                    {u.code}
                  </span>
                  <span
                    className={`ml-2 text-sm ${
                      isDeleted
                        ? "text-text-muted line-through"
                        : "text-text-secondary"
                    }`}
                  >
                    — {u.description}
                  </span>
                  {isDeleted && (
                    <span className="ml-2 rounded bg-accent-rose px-1.5 py-0.5 text-[0.6rem] font-bold uppercase text-white">
                      Do Not Use
                    </span>
                  )}
                </div>
                {u.notes && (
                  <p className="mt-0.5 text-xs text-text-muted">{u.notes}</p>
                )}
                {u.replacementCode && (
                  <p className="mt-1 text-xs font-semibold">
                    <span className="text-text-muted">Replaced by: </span>
                    <Link
                      href={`/code/${encodeURIComponent(u.replacementCode)}`}
                      className="text-accent-blue underline decoration-dotted underline-offset-2 hover:decoration-solid"
                    >
                      → {u.replacementCode}
                    </Link>
                  </p>
                )}
              </div>
              <span className="shrink-0 font-mono text-xs text-text-muted">
                {u.effectiveDate}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
