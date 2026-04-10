"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { MedicalCode, CodeSystem } from "@/types";
import { SearchBar } from "@/components/SearchBar";
import { CodeCard } from "@/components/CodeCard";
import { FilterSidebar } from "@/components/FilterSidebar";

function ResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const systemParam = searchParams.get("system") as CodeSystem | null;
  const specialtyParam = searchParams.get("specialty");

  const [results, setResults] = useState<MedicalCode[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<CodeSystem | undefined>(
    systemParam ?? undefined
  );
  const [selectedSpecialty, setSelectedSpecialty] = useState<
    string | undefined
  >(specialtyParam ?? undefined);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedSystem) params.set("system", selectedSystem);
    if (selectedSpecialty) params.set("specialty", selectedSpecialty);

    fetch(`/api/search?${params.toString()}`)
      .then((r) => r.json())
      .then(setResults);
  }, [query, selectedSystem, selectedSpecialty]);

  const systems = [
    {
      system: "ICD-10" as CodeSystem,
      count: results.filter((r) => r.system === "ICD-10").length,
    },
    {
      system: "HCPCS" as CodeSystem,
      count: results.filter((r) => r.system === "HCPCS").length,
    },
  ];

  const specialtyMap = new Map<string, number>();
  for (const r of results) {
    if (r.specialty) {
      specialtyMap.set(r.specialty, (specialtyMap.get(r.specialty) ?? 0) + 1);
    }
  }
  const specialties = Array.from(specialtyMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="flex min-h-[calc(100vh-200px)]">
      <FilterSidebar
        systems={systems}
        specialties={specialties}
        selectedSystem={selectedSystem}
        selectedSpecialty={selectedSpecialty}
        onSystemChange={setSelectedSystem}
        onSpecialtyChange={setSelectedSpecialty}
      />
      <div className="flex-1 bg-bg p-7">
        <div className="mb-5">
          <SearchBar defaultValue={query} compact />
        </div>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-text-muted">
            <strong className="text-text-primary">{results.length}</strong>{" "}
            results{query ? ` for "${query}"` : ""}
          </p>
        </div>
        <div className="space-y-2.5">
          {results.map((code) => (
            <CodeCard key={code.code} code={code} />
          ))}
          {results.length === 0 && (
            <p className="py-12 text-center text-text-muted">
              No results found. Try a different search term.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-text-muted">
          Loading...
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
