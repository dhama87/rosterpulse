import { EMCalculatorInput, EMCalculatorResult } from "@/types";

type MDMLevel = "Straightforward" | "Low" | "Moderate" | "High";

const MDM_LEVEL_ORDER: MDMLevel[] = [
  "Straightforward",
  "Low",
  "Moderate",
  "High",
];

function problemToMDM(count: EMCalculatorInput["problemCount"]): MDMLevel {
  switch (count) {
    case "minimal": return "Straightforward";
    case "limited": return "Low";
    case "multiple": return "Moderate";
    case "extensive": return "High";
    default: return "Straightforward";
  }
}

function dataToMDM(complexity: EMCalculatorInput["dataComplexity"]): MDMLevel {
  switch (complexity) {
    case "minimal": return "Straightforward";
    case "limited": return "Low";
    case "moderate": return "Moderate";
    case "extensive": return "High";
    default: return "Straightforward";
  }
}

function riskToMDM(level: EMCalculatorInput["riskLevel"]): MDMLevel {
  switch (level) {
    case "minimal": return "Straightforward";
    case "low": return "Low";
    case "moderate": return "Moderate";
    case "high": return "High";
    default: return "Straightforward";
  }
}

function mdmLevelToIndex(level: MDMLevel): number {
  return MDM_LEVEL_ORDER.indexOf(level);
}

function determineMDM(input: EMCalculatorInput): MDMLevel {
  const levels = [
    problemToMDM(input.problemCount),
    dataToMDM(input.dataComplexity),
    riskToMDM(input.riskLevel),
  ];
  // 2 of 3 rule: second-highest determines level
  const indices = levels.map(mdmLevelToIndex).sort((a, b) => b - a);
  return MDM_LEVEL_ORDER[indices[1]];
}

const ESTABLISHED_CODES: Record<MDMLevel, { code: string; level: number }> = {
  Straightforward: { code: "99212", level: 2 },
  Low: { code: "99213", level: 3 },
  Moderate: { code: "99214", level: 4 },
  High: { code: "99215", level: 5 },
};

const NEW_CODES: Record<MDMLevel, { code: string; level: number }> = {
  Straightforward: { code: "99202", level: 2 },
  Low: { code: "99203", level: 3 },
  Moderate: { code: "99204", level: 4 },
  High: { code: "99205", level: 5 },
};

const ESTABLISHED_TIME = [
  { min: 10, max: 19, code: "99212", level: 2 },
  { min: 20, max: 29, code: "99213", level: 3 },
  { min: 30, max: 39, code: "99214", level: 4 },
  { min: 40, max: 54, code: "99215", level: 5 },
];

const NEW_TIME = [
  { min: 15, max: 29, code: "99202", level: 2 },
  { min: 30, max: 44, code: "99203", level: 3 },
  { min: 45, max: 59, code: "99204", level: 4 },
  { min: 60, max: 74, code: "99205", level: 5 },
];

const DOC_TIPS: Record<MDMLevel, string[]> = {
  Straightforward: ["Document the self-limited problem", "Minimal data review needed"],
  Low: [
    "Document 2 of 3 MDM elements at low level",
    "Note problems addressed (not just present)",
    "Document any data reviewed",
  ],
  Moderate: [
    "Document 2 of 3 MDM elements at moderate level",
    "If chronic illness, document exacerbation/progression",
    "Document data reviewed and your interpretation",
  ],
  High: [
    "Document 2 of 3 MDM elements at high level",
    "Document threat to life/bodily function",
    "Document risk assessment and treatment rationale",
  ],
};

export function calculateEMLevel(input: EMCalculatorInput): EMCalculatorResult {
  if (input.mode === "time") {
    return calculateByTime(input);
  }
  return calculateByMDM(input);
}

function calculateByMDM(input: EMCalculatorInput): EMCalculatorResult {
  const mdmLevel = determineMDM(input);
  const isNew = input.patientType === "new";
  const codeMap = isNew ? NEW_CODES : ESTABLISHED_CODES;
  const match = codeMap[mdmLevel];

  return {
    recommendedCode: match.code,
    level: match.level,
    explanation: `Based on 2-of-3 MDM rule: ${mdmLevel} complexity for ${isNew ? "new" : "established"} patient.`,
    mdmLevel,
    documentationTips: DOC_TIPS[mdmLevel],
  };
}

function calculateByTime(input: EMCalculatorInput): EMCalculatorResult {
  const minutes = input.totalMinutes ?? 0;
  const isNew = input.patientType === "new";
  const timeRanges = isNew ? NEW_TIME : ESTABLISHED_TIME;

  let match = timeRanges[0];
  for (const range of timeRanges) {
    if (minutes >= range.min && minutes <= range.max) {
      match = range;
      break;
    }
    if (minutes > range.max) {
      match = range;
    }
  }

  const mdmLevel = MDM_LEVEL_ORDER[match.level - 2] ?? "Straightforward";

  return {
    recommendedCode: match.code,
    level: match.level,
    explanation: `Based on total time of ${minutes} minutes for ${isNew ? "new" : "established"} patient.`,
    mdmLevel,
    timeRange: `${match.min}-${match.max} minutes`,
    documentationTips: [
      `Document total time of ${minutes} minutes`,
      "List activities: counseling, care coordination, exam, documentation",
      ...DOC_TIPS[mdmLevel],
    ],
  };
}
