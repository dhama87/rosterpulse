import { checkCCIEdits } from "@/services/cciChecker";
import { CCIEdit } from "@/types";

const testEdits: CCIEdit[] = [
  { column1Code: "99214", column2Code: "99213", modifierIndicator: "0", effectiveDate: "1996-01-01" },
  { column1Code: "20610", column2Code: "99213", modifierIndicator: "1", effectiveDate: "2020-01-01" },
];

describe("checkCCIEdits", () => {
  it("finds a CCI edit pair", () => {
    const result = checkCCIEdits(testEdits, "99214", "99213");
    expect(result).not.toBeNull();
    expect(result!.modifierIndicator).toBe("0");
  });

  it("finds edit regardless of code order", () => {
    const result = checkCCIEdits(testEdits, "99213", "99214");
    expect(result).not.toBeNull();
  });

  it("returns null when no edit exists", () => {
    const result = checkCCIEdits(testEdits, "99213", "71046");
    expect(result).toBeNull();
  });

  it("identifies modifier-allowed edits", () => {
    const result = checkCCIEdits(testEdits, "20610", "99213");
    expect(result).not.toBeNull();
    expect(result!.modifierIndicator).toBe("1");
  });
});
