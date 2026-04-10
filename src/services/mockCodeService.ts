import {
  CodeService,
  MedicalCode,
  CodeSystem,
  Category,
  SearchFilters,
  GuidedNode,
  EMCalculatorInput,
  EMCalculatorResult,
  CCIEdit,
  DenialReference,
  CodeUpdate,
  ModifierReference,
  POSCode,
  FeeData,
} from "@/types";
import { searchCodes } from "./searchEngine";
import { calculateEMLevel } from "./emCalculator";
import { checkCCIEdits } from "./cciChecker";
import { getNode } from "./guidedFlow";

import icd10Data from "@/data/icd10.json";
import hcpcsData from "@/data/hcpcs.json";
import modifiersData from "@/data/modifiers.json";
import cciEditsData from "@/data/cciEdits.json";
import feeScheduleData from "@/data/feeSchedule.json";
import posData from "@/data/placeOfService.json";
import carcRarcData from "@/data/carcRarc.json";
import codeUpdatesData from "@/data/codeUpdates.json";
import guidedFlowData from "@/data/guidedFlowTree.json";

const allCodes: MedicalCode[] = [
  ...(icd10Data as unknown as MedicalCode[]),
  ...(hcpcsData as unknown as MedicalCode[]),
];

export function createMockCodeService(): CodeService {
  return {
    search(query: string, filters?: SearchFilters): MedicalCode[] {
      return searchCodes(allCodes, query, filters);
    },

    getByCode(code: string): MedicalCode | null {
      return allCodes.find((c) => c.code === code) ?? null;
    },

    getCategories(system: CodeSystem): Category[] {
      const systemCodes = allCodes.filter((c) => c.system === system);
      const categoryMap = new Map<string, number>();
      for (const code of systemCodes) {
        categoryMap.set(code.category, (categoryMap.get(code.category) ?? 0) + 1);
      }
      return Array.from(categoryMap.entries()).map(([name, count]) => ({
        id: name.toLowerCase().replace(/\s+/g, "-"),
        name,
        system,
        codeCount: count,
      }));
    },

    getGuidedFlowStart(): GuidedNode {
      const tree = guidedFlowData as Record<string, GuidedNode>;
      return getNode(tree, "start")!;
    },

    getGuidedFlowNext(nodeId: string): GuidedNode {
      const tree = guidedFlowData as Record<string, GuidedNode>;
      return getNode(tree, nodeId)!;
    },

    calculateEMLevel(input: EMCalculatorInput): EMCalculatorResult {
      return calculateEMLevel(input);
    },

    checkCCIEdits(code1: string, code2: string): CCIEdit | null {
      return checkCCIEdits(cciEditsData as CCIEdit[], code1, code2);
    },

    searchDenialCodes(query: string, type?: string): DenialReference[] {
      const denials = carcRarcData as DenialReference[];
      let filtered = denials;
      if (type) {
        filtered = filtered.filter((d) => d.type === type);
      }
      if (!query) return filtered;
      const q = query.toLowerCase();
      return filtered.filter(
        (d) =>
          d.code.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.resolution.toLowerCase().includes(q)
      );
    },

    getCodeUpdates(system?: CodeSystem): CodeUpdate[] {
      const updates = codeUpdatesData as CodeUpdate[];
      if (system) return updates.filter((u) => u.system === system);
      return updates;
    },

    getAllModifiers(): ModifierReference[] {
      return modifiersData as ModifierReference[];
    },

    getAllPOSCodes(): POSCode[] {
      return posData as POSCode[];
    },

    getFeeSchedule(code: string): FeeData | null {
      const fees = feeScheduleData as (FeeData & { code: string })[];
      const match = fees.find((f) => f.code === code);
      if (!match) return null;
      const { code: _, ...feeData } = match;
      return feeData;
    },
  };
}
