import { MedicalCode, SearchFilters } from "@/types";

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/\s+/).filter(Boolean);
}

function scoreMatch(code: MedicalCode, queryTokens: string[]): number {
  if (queryTokens.length === 0) return 1;

  let score = 0;
  const codeLower = code.code.toLowerCase();
  const descLower = code.description.toLowerCase();
  const keywordsLower = code.keywords.map((k) => k.toLowerCase());
  const categoryLower = code.category.toLowerCase();

  for (const token of queryTokens) {
    if (codeLower === token || codeLower.replace(".", "") === token) {
      score += 100;
      continue;
    }
    if (codeLower.startsWith(token)) {
      score += 50;
      continue;
    }
    if (keywordsLower.some((k) => k === token)) {
      score += 30;
      continue;
    }
    if (keywordsLower.some((k) => k.startsWith(token))) {
      score += 20;
      continue;
    }
    if (descLower.includes(token)) {
      score += 15;
      continue;
    }
    if (categoryLower.includes(token)) {
      score += 5;
      continue;
    }
  }

  return score;
}

export function searchCodes(
  codes: MedicalCode[],
  query: string,
  filters?: SearchFilters
): MedicalCode[] {
  let filtered = codes;

  if (filters?.system) {
    filtered = filtered.filter((c) => c.system === filters.system);
  }
  if (filters?.category) {
    filtered = filtered.filter((c) => c.category === filters.category);
  }
  if (filters?.specialty) {
    filtered = filtered.filter((c) => c.specialty === filters.specialty);
  }

  const queryTokens = tokenize(query);

  if (queryTokens.length === 0) {
    return filtered;
  }

  const scored = filtered
    .map((code) => ({ code, score: scoreMatch(code, queryTokens) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((entry) => entry.code);
}
