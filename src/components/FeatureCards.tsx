import Link from "next/link";

const features = [
  { href: "/", icon: "◉", title: "ICD-10 Diagnosis Codes", desc: "70,000+ diagnosis codes with hierarchy and specificity guidance.", tag: "Core", tagColor: "blue" },
  { href: "/", icon: "⬡", title: "HCPCS Level II", desc: "Supplies, DME, drugs, ambulance, and non-CPT services.", tag: "Core", tagColor: "emerald" },
  { href: "/modifiers", icon: "✦", title: "Modifiers", desc: "HCPCS modifiers with usage rules and decision tree.", tag: "Billing", tagColor: "violet" },
  { href: "/cci-edits", icon: "⚠", title: "CCI Edits / Bundling", desc: "NCCI column 1/2 pairs. Prevent claim denials.", tag: "Compliance", tagColor: "amber" },
  { href: "/fee-schedule", icon: "$", title: "Fee Schedules", desc: "Medicare MPFS, RVUs, conversion factors.", tag: "Financial", tagColor: "orange" },
  { href: "/em-calculator", icon: "✓", title: "E/M Calculator", desc: "MDM and time-based E/M level calculator.", tag: "Tool", tagColor: "teal" },
  { href: "/denials", icon: "✕", title: "CARC/RARC Denial Codes", desc: "Understand denials and fix resubmissions.", tag: "Denials", tagColor: "rose" },
  { href: "/updates", icon: "↻", title: "Code Update Tracker", desc: "Annual ICD-10 and quarterly HCPCS changes.", tag: "Updates", tagColor: "emerald" },
  { href: "/guided", icon: "🧭", title: "Guided Code Finder", desc: "Step-by-step wizard to find the right code.", tag: "Tool", tagColor: "blue" },
] as const;

export function FeatureCards() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((f) => (
        <Link
          key={f.title}
          href={f.href}
          className="rounded-[14px] border border-border-light bg-bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-sm"
        >
          <div
            className={`mb-3.5 flex h-10 w-10 items-center justify-center rounded-[10px] text-lg bg-accent-${f.tagColor}-soft text-accent-${f.tagColor}`}
          >
            {f.icon}
          </div>
          <h3 className="text-[0.86rem] font-semibold">{f.title}</h3>
          <p className="mt-1 text-[0.76rem] leading-relaxed text-text-muted">
            {f.desc}
          </p>
          <span
            className={`mt-2.5 inline-block rounded px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide bg-accent-${f.tagColor}-soft text-accent-${f.tagColor}`}
          >
            {f.tag}
          </span>
        </Link>
      ))}
    </div>
  );
}
