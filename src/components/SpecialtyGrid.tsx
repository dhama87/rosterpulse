import Link from "next/link";

const specialties = [
  { name: "Cardiology", icon: "♥", description: "Heart, chest pain, arrhythmias", color: "rose" },
  { name: "Neurology", icon: "⚡", description: "Headaches, seizures, stroke", color: "blue" },
  { name: "Orthopedics", icon: "🦴", description: "Fractures, sprains, joints", color: "emerald" },
  { name: "Gastroenterology", icon: "◉", description: "Abdominal pain, GERD, IBS", color: "amber" },
  { name: "Pulmonology", icon: "◈", description: "Asthma, COPD, pneumonia", color: "violet" },
  { name: "Endocrinology", icon: "⬡", description: "Diabetes, thyroid, hormones", color: "teal" },
  { name: "Dermatology", icon: "✦", description: "Skin, rashes, wounds", color: "orange" },
  { name: "Ophthalmology", icon: "◎", description: "Vision, glaucoma, cataracts", color: "slate" },
  { name: "Oncology", icon: "♦", description: "Cancer, staging, chemo", color: "rose" },
  { name: "Psychiatry", icon: "◇", description: "Depression, anxiety, PTSD", color: "blue" },
  { name: "Urology", icon: "△", description: "Kidney, UTI, prostate", color: "emerald" },
  { name: "ENT", icon: "○", description: "Ear, sinus, tonsils, hearing", color: "amber" },
] as const;

export function SpecialtyGrid() {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
      {specialties.map((s) => (
        <Link
          key={s.name}
          href={`/results?specialty=${encodeURIComponent(s.name)}`}
          className="flex items-start gap-3 rounded-xl border border-border-light p-3.5 transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-sm"
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] text-base bg-accent-${s.color}-soft text-accent-${s.color}`}
          >
            {s.icon}
          </div>
          <div>
            <h4 className="text-sm font-semibold">{s.name}</h4>
            <p className="text-[0.7rem] leading-snug text-text-muted">
              {s.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
