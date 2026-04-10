// === Code Systems ===

export type CodeSystem = "ICD-10" | "HCPCS" | "CPT";

export interface SeventhCharOption {
  character: string;
  description: string;
}

export interface LateralityOption {
  digit: string;
  description: string;
}

export interface ModifierReference {
  code: string;
  description: string;
  usageGuidance: string;
  system: "HCPCS" | "CPT";
}

export interface CCIEdit {
  column1Code: string;
  column2Code: string;
  modifierIndicator: "0" | "1" | "9";
  effectiveDate: string;
  deletionDate?: string;
}

export interface FeeData {
  year: number;
  nonFacilityRate: number;
  facilityRate: number;
  workRVU: number;
  practiceExpenseRVU: number;
  malpracticeRVU: number;
  totalRVU: number;
  conversionFactor: number;
}

export interface POSCode {
  code: string;
  description: string;
}

export interface DenialReference {
  code: string;
  type: "CARC" | "RARC" | "Group";
  description: string;
  resolution: string;
  frequency: "high" | "medium" | "low";
}

export interface PayerRule {
  payer: string;
  timelyFiling: string;
  priorAuth: string;
  frequencyLimit?: string;
  telehealth?: string;
  notes?: string;
}

export interface NecessityInfo {
  covered: boolean;
  lcdId?: string;
  ncdId?: string;
  notes: string;
}

// === Medical Code ===

export interface MedicalCode {
  code: string;
  system: CodeSystem;
  description: string;
  category: string;
  specialty: string;
  status: "active" | "discontinued";
  keywords: string[];
  details: {
    includes?: string[];
    excludes1?: string[];
    excludes2?: string[];
    relatedCodes?: string[];
    codeFirst?: string;
    useAdditionalCode?: string;
    codeAlso?: string;
    seventhCharacters?: SeventhCharOption[];
    laterality?: LateralityOption[];
    ageRestriction?: { min?: number; max?: number };
    sexRestriction?: "M" | "F";
  };
  billing: {
    modifiers?: ModifierReference[];
    cciEdits?: CCIEdit[];
    feeSchedule?: FeeData;
    placeOfService?: POSCode[];
    commonDenials?: DenialReference[];
    medicalNecessity?: NecessityInfo;
    documentationReqs?: string[];
    payerRules?: PayerRule[];
  };
  source: {
    system: string;
    url: string;
    lastUpdated: string;
  };
}

// === Search ===

export interface SearchFilters {
  system?: CodeSystem;
  category?: string;
  specialty?: string;
}

export interface Category {
  id: string;
  name: string;
  system: CodeSystem;
  codeCount: number;
}

// === E/M Calculator ===

export interface EMCalculatorInput {
  mode: "mdm" | "time";
  problemCount?: "minimal" | "limited" | "multiple" | "extensive";
  dataComplexity?: "minimal" | "limited" | "moderate" | "extensive";
  riskLevel?: "minimal" | "low" | "moderate" | "high";
  totalMinutes?: number;
  patientType?: "new" | "established";
}

export interface EMCalculatorResult {
  recommendedCode: string;
  level: number;
  explanation: string;
  mdmLevel: string;
  timeRange?: string;
  documentationTips: string[];
}

// === Guided Flow ===

export interface GuidedNode {
  id: string;
  question: string;
  options: {
    label: string;
    description?: string;
    nextNodeId?: string;
    resultCodes?: string[];
  }[];
}

// === Code Updates ===

export interface CodeUpdate {
  code: string;
  system: CodeSystem;
  changeType: "new" | "revised" | "deleted";
  description: string;
  previousCode?: string;
  replacementCode?: string;
  effectiveDate: string;
  notes?: string;
}

// === Favorites ===

export interface SavedCodeSet {
  id: string;
  name: string;
  codes: string[];
  createdAt: string;
}

// === Service Interface ===

export interface CodeService {
  search(query: string, filters?: SearchFilters): MedicalCode[];
  getByCode(code: string): MedicalCode | null;
  getCategories(system: CodeSystem): Category[];
  getGuidedFlowStart(): GuidedNode;
  getGuidedFlowNext(nodeId: string): GuidedNode;
  calculateEMLevel(input: EMCalculatorInput): EMCalculatorResult;
  checkCCIEdits(code1: string, code2: string): CCIEdit | null;
  searchDenialCodes(query: string, type?: string): DenialReference[];
  getCodeUpdates(system?: CodeSystem): CodeUpdate[];
  getAllModifiers(): ModifierReference[];
  getAllPOSCodes(): POSCode[];
  getFeeSchedule(code: string): FeeData | null;
}
