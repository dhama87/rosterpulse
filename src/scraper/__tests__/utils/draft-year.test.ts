import { getDraftYear } from "../../utils/draft-year";

describe("getDraftYear", () => {
  it("returns current calendar year", () => {
    const result = getDraftYear(new Date("2026-04-22T12:00:00Z"));
    expect(result).toBe(2026);
  });

  it("returns current year in January (pre-Super Bowl)", () => {
    const result = getDraftYear(new Date("2027-01-15T12:00:00Z"));
    expect(result).toBe(2027);
  });

  it("returns current year in December", () => {
    const result = getDraftYear(new Date("2026-12-31T12:00:00Z"));
    expect(result).toBe(2026);
  });

  it("uses current date when no argument", () => {
    const result = getDraftYear();
    expect(result).toBe(new Date().getFullYear());
  });
});
