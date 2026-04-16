import { makeDedupKey, isDuplicate, shouldUpgradeConfidence } from "../dedup";

describe("makeDedupKey", () => {
  it("produces consistent hash for same input", () => {
    const key1 = makeDedupKey("ESPN", "Player X signs with Team Y");
    const key2 = makeDedupKey("ESPN", "Player X signs with Team Y");
    expect(key1).toBe(key2);
  });

  it("is case-insensitive (ESPN/espn + same headline = same key)", () => {
    const keyUpper = makeDedupKey("ESPN", "Player X signs with Team Y");
    const keyLower = makeDedupKey("espn", "player x signs with team y");
    expect(keyUpper).toBe(keyLower);
  });

  it("produces different keys for different content", () => {
    const key1 = makeDedupKey("ESPN", "Player X signs with Team Y");
    const key2 = makeDedupKey("ESPN", "Player Z released by Team W");
    expect(key1).not.toBe(key2);
  });

  it("returns a 16-character hex string", () => {
    const key = makeDedupKey("ESPN", "Some headline about a player");
    expect(key).toMatch(/^[a-f0-9]{16}$/);
  });
});

describe("isDuplicate", () => {
  it("returns true for matching dedupKey", () => {
    const key = "abcdef1234567890";
    const existing = new Set([key]);
    expect(isDuplicate(key, existing)).toBe(true);
  });

  it("returns false for new dedupKey", () => {
    const existing = new Set(["abcdef1234567890"]);
    expect(isDuplicate("0987654321fedcba", existing)).toBe(false);
  });
});

describe("shouldUpgradeConfidence", () => {
  it('returns true when existing is "reported" and new is "official"', () => {
    expect(shouldUpgradeConfidence("reported", "official")).toBe(true);
  });

  it('returns false when existing is already "official"', () => {
    expect(shouldUpgradeConfidence("official", "official")).toBe(false);
  });

  it('returns false when new is "reported"', () => {
    expect(shouldUpgradeConfidence("reported", "reported")).toBe(false);
  });
});
