import { calculateEMLevel } from "@/services/emCalculator";

describe("calculateEMLevel", () => {
  describe("MDM-based", () => {
    it("returns 99213 for established patient with low MDM", () => {
      const result = calculateEMLevel({
        mode: "mdm",
        problemCount: "limited",
        dataComplexity: "limited",
        riskLevel: "low",
        patientType: "established",
      });
      expect(result.recommendedCode).toBe("99213");
      expect(result.level).toBe(3);
      expect(result.mdmLevel).toBe("Low");
    });

    it("returns 99214 for established patient with moderate MDM", () => {
      const result = calculateEMLevel({
        mode: "mdm",
        problemCount: "multiple",
        dataComplexity: "moderate",
        riskLevel: "moderate",
        patientType: "established",
      });
      expect(result.recommendedCode).toBe("99214");
      expect(result.level).toBe(4);
    });

    it("returns 99215 for established patient with high MDM", () => {
      const result = calculateEMLevel({
        mode: "mdm",
        problemCount: "extensive",
        dataComplexity: "extensive",
        riskLevel: "high",
        patientType: "established",
      });
      expect(result.recommendedCode).toBe("99215");
      expect(result.level).toBe(5);
    });

    it("returns 99205 for new patient with high MDM", () => {
      const result = calculateEMLevel({
        mode: "mdm",
        problemCount: "extensive",
        dataComplexity: "extensive",
        riskLevel: "high",
        patientType: "new",
      });
      expect(result.recommendedCode).toBe("99205");
      expect(result.level).toBe(5);
    });

    it("uses 2 of 3 elements rule — highest 2 determine level", () => {
      const result = calculateEMLevel({
        mode: "mdm",
        problemCount: "multiple",
        dataComplexity: "minimal",
        riskLevel: "moderate",
        patientType: "established",
      });
      expect(result.recommendedCode).toBe("99214");
    });
  });

  describe("time-based", () => {
    it("returns 99213 for 25 minutes established patient", () => {
      const result = calculateEMLevel({
        mode: "time",
        totalMinutes: 25,
        patientType: "established",
      });
      expect(result.recommendedCode).toBe("99213");
    });

    it("returns 99215 for 45 minutes established patient", () => {
      const result = calculateEMLevel({
        mode: "time",
        totalMinutes: 45,
        patientType: "established",
      });
      expect(result.recommendedCode).toBe("99215");
    });

    it("returns 99204 for 50 minutes new patient", () => {
      const result = calculateEMLevel({
        mode: "time",
        totalMinutes: 50,
        patientType: "new",
      });
      expect(result.recommendedCode).toBe("99204");
    });
  });

  it("includes documentation tips", () => {
    const result = calculateEMLevel({
      mode: "mdm",
      problemCount: "limited",
      dataComplexity: "limited",
      riskLevel: "low",
      patientType: "established",
    });
    expect(result.documentationTips.length).toBeGreaterThan(0);
  });
});
