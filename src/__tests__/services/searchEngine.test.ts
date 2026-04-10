import { searchCodes } from "@/services/searchEngine";
import { MedicalCode } from "@/types";

const testCodes: MedicalCode[] = [
  {
    code: "R07.9",
    system: "ICD-10",
    description: "Chest pain, unspecified",
    category: "Symptoms — circulatory",
    specialty: "Cardiology",
    status: "active",
    keywords: ["chest", "pain", "thoracic"],
    details: {},
    billing: {},
    source: { system: "CMS", url: "https://cms.gov", lastUpdated: "2025-10-01" },
  },
  {
    code: "M54.5",
    system: "ICD-10",
    description: "Low back pain",
    category: "Musculoskeletal",
    specialty: "Orthopedics",
    status: "active",
    keywords: ["back", "lumbar", "pain", "spine"],
    details: {},
    billing: {},
    source: { system: "CMS", url: "https://cms.gov", lastUpdated: "2025-10-01" },
  },
  {
    code: "A4253",
    system: "HCPCS",
    description: "Blood glucose test strips, per 50",
    category: "Medical Supplies",
    specialty: "Endocrinology",
    status: "active",
    keywords: ["glucose", "strips", "diabetes"],
    details: {},
    billing: {},
    source: { system: "CMS", url: "https://cms.gov", lastUpdated: "2026-01-01" },
  },
];

describe("searchCodes", () => {
  it("finds codes by keyword match", () => {
    const results = searchCodes(testCodes, "chest pain");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].code).toBe("R07.9");
  });

  it("finds codes by code number", () => {
    const results = searchCodes(testCodes, "M54.5");
    expect(results.length).toBe(1);
    expect(results[0].code).toBe("M54.5");
  });

  it("returns empty array for no matches", () => {
    const results = searchCodes(testCodes, "zzzznotfound");
    expect(results).toEqual([]);
  });

  it("filters by code system", () => {
    const results = searchCodes(testCodes, "pain", { system: "ICD-10" });
    expect(results.every((r) => r.system === "ICD-10")).toBe(true);
  });

  it("filters by specialty", () => {
    const results = searchCodes(testCodes, "", { specialty: "Cardiology" });
    expect(results.every((r) => r.specialty === "Cardiology")).toBe(true);
  });

  it("is case-insensitive", () => {
    const results = searchCodes(testCodes, "CHEST PAIN");
    expect(results.length).toBeGreaterThan(0);
  });

  it("matches partial words (fuzzy)", () => {
    const results = searchCodes(testCodes, "gluco");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].code).toBe("A4253");
  });
});
