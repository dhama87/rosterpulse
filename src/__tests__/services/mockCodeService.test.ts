import { createMockCodeService } from "@/services/mockCodeService";

describe("MockCodeService", () => {
  const service = createMockCodeService();

  it("searches codes by keyword", () => {
    const results = service.search("chest pain");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].description.toLowerCase()).toContain("chest");
  });

  it("gets a code by its ID", () => {
    const code = service.getByCode("R07.9");
    expect(code).not.toBeNull();
    expect(code!.description).toContain("Chest pain");
  });

  it("returns null for unknown code", () => {
    const code = service.getByCode("ZZZZ");
    expect(code).toBeNull();
  });

  it("returns categories", () => {
    const cats = service.getCategories("ICD-10");
    expect(cats.length).toBeGreaterThan(0);
  });

  it("returns guided flow start node", () => {
    const node = service.getGuidedFlowStart();
    expect(node.id).toBe("start");
    expect(node.options.length).toBeGreaterThan(0);
  });

  it("calculates E/M level", () => {
    const result = service.calculateEMLevel({
      mode: "mdm",
      problemCount: "limited",
      dataComplexity: "limited",
      riskLevel: "low",
      patientType: "established",
    });
    expect(result.recommendedCode).toBe("99213");
  });

  it("checks CCI edits", () => {
    const edit = service.checkCCIEdits("99214", "99213");
    expect(edit).not.toBeNull();
  });

  it("searches denial codes", () => {
    const results = service.searchDenialCodes("modifier");
    expect(results.length).toBeGreaterThan(0);
  });

  it("gets code updates", () => {
    const updates = service.getCodeUpdates();
    expect(updates.length).toBeGreaterThan(0);
  });

  it("gets all modifiers", () => {
    const mods = service.getAllModifiers();
    expect(mods.length).toBeGreaterThan(0);
  });

  it("gets POS codes", () => {
    const pos = service.getAllPOSCodes();
    expect(pos.length).toBeGreaterThan(0);
  });

  it("gets fee schedule for a code", () => {
    const fee = service.getFeeSchedule("99213");
    expect(fee === null || typeof fee.nonFacilityRate === "number").toBe(true);
  });
});
