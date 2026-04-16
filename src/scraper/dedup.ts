import { createHash } from "crypto";

export function makeDedupKey(source: string, headline: string): string {
  const normalized = `${source.trim().toLowerCase()}:${headline.trim().toLowerCase()}`;
  return createHash("sha256").update(normalized).digest("hex").slice(0, 16);
}

export function isDuplicate(dedupKey: string, existingKeys: Set<string>): boolean {
  return existingKeys.has(dedupKey);
}

export function shouldUpgradeConfidence(
  existingConfidence: string,
  newConfidence: string
): boolean {
  return existingConfidence === "reported" && newConfidence === "official";
}
