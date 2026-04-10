import { SearchBar } from "@/components/SearchBar";
import { FeatureCards } from "@/components/FeatureCards";
import { SpecialtyGrid } from "@/components/SpecialtyGrid";
import { RecentSearches } from "@/components/RecentSearches";
import { FavoritesManager } from "@/components/FavoritesManager";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-bg-card to-bg-warm px-8 pb-10 pt-16 text-center">
        <h1 className="font-display text-5xl leading-tight">
          Find the <em className="text-accent-blue">right</em> code,
          <br />
          every time.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base text-text-secondary">
          ICD-10 · HCPCS · Modifiers · Crosswalks · CCI Edits · Fee Schedules ·
          Denial Codes
        </p>

        <div className="mx-auto mt-8 max-w-xl">
          <SearchBar />
          <div className="mt-3.5 flex flex-wrap justify-center gap-2">
            <Link
              href="/results?system=ICD-10"
              className="rounded-full border border-border bg-bg-card px-4 py-2 text-sm text-text-secondary hover:border-text-secondary"
            >
              ICD-10
            </Link>
            <Link
              href="/results?system=HCPCS"
              className="rounded-full border border-border bg-bg-card px-4 py-2 text-sm text-text-secondary hover:border-text-secondary"
            >
              HCPCS
            </Link>
            <Link
              href="/modifiers"
              className="rounded-full border border-border bg-bg-card px-4 py-2 text-sm text-text-secondary hover:border-text-secondary"
            >
              Modifiers
            </Link>
            <Link
              href="/denials"
              className="rounded-full border border-border bg-bg-card px-4 py-2 text-sm text-text-secondary hover:border-text-secondary"
            >
              CARC/RARC
            </Link>
            <Link
              href="/guided"
              className="rounded-full bg-text-primary px-4 py-2 text-sm font-semibold text-white"
            >
              🧭 Guided Code Finder
            </Link>
          </div>
          <RecentSearches />
          <FavoritesManager />
        </div>
      </section>

      {/* Feature Cards */}
      <section className="bg-bg-card px-7 pb-6 pt-8">
        <h2 className="mb-4 font-mono text-[0.68rem] font-semibold uppercase tracking-widest text-text-muted">
          Coding & Billing Tools
        </h2>
        <FeatureCards />
      </section>

      {/* Specialties */}
      <section className="bg-bg-card px-7 pb-8 pt-5">
        <h2 className="mb-4 font-mono text-[0.68rem] font-semibold uppercase tracking-widest text-text-muted">
          Browse by Specialty
        </h2>
        <SpecialtyGrid />
      </section>

      {/* Stats */}
      <section className="flex justify-center gap-10 border-t border-border-light bg-bg-warm px-8 py-6">
        {[
          { num: "200+", label: "ICD-10 Codes" },
          { num: "100+", label: "HCPCS Codes" },
          { num: "12", label: "Specialties" },
          { num: "9", label: "Billing Tools" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className="font-display text-2xl">{s.num}</div>
            <div className="text-xs text-text-muted">{s.label}</div>
          </div>
        ))}
      </section>
    </>
  );
}
