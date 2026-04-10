import { createMockCodeService } from "@/services/mockCodeService";
import { ModifierDecisionTree } from "@/components/ModifierDecisionTree";

const service = createMockCodeService();

export default function ModifiersPage() {
  const modifiers = service.getAllModifiers();

  return (
    <div className="bg-bg px-7 py-8">
      <h1 className="font-display text-3xl">Modifier Reference</h1>
      <p className="mt-1 mb-8 text-sm text-text-muted">
        HCPCS modifiers with usage rules and interactive decision tree
      </p>

      {/* Decision Tree */}
      <div className="mb-10 rounded-xl border border-border-light bg-bg-card p-6">
        <h2 className="mb-4 font-mono text-[0.68rem] font-semibold uppercase tracking-widest text-text-muted">
          Which Modifier Should I Use?
        </h2>
        <ModifierDecisionTree />
      </div>

      {/* Modifier List */}
      <h2 className="mb-4 font-mono text-[0.68rem] font-semibold uppercase tracking-widest text-text-muted">
        All Modifiers
      </h2>
      <div className="space-y-2">
        {modifiers.map((mod) => (
          <div
            key={mod.code}
            className="rounded-xl border border-border-light bg-bg-card p-5"
          >
            <div className="mb-1 flex items-center gap-3">
              <span className="font-mono text-lg font-semibold text-accent-violet">
                -{mod.code}
              </span>
              <span className="rounded bg-accent-violet-soft px-2 py-0.5 text-[0.6rem] font-bold uppercase text-accent-violet">
                {mod.system}
              </span>
            </div>
            <p className="text-sm text-text-primary">{mod.description}</p>
            <p className="mt-1 text-xs text-text-muted">{mod.usageGuidance}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
