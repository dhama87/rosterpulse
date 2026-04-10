import { getNode } from "@/services/guidedFlow";
import { GuidedNode } from "@/types";

const testTree: Record<string, GuidedNode> = {
  start: {
    id: "start",
    question: "What type of code?",
    options: [
      { label: "Diagnosis", nextNodeId: "dx" },
      { label: "Supply", resultCodes: ["A4253"] },
    ],
  },
  dx: {
    id: "dx",
    question: "Which body system?",
    options: [{ label: "Chest", resultCodes: ["R07.9"] }],
  },
};

describe("getNode", () => {
  it("returns the start node", () => {
    const node = getNode(testTree, "start");
    expect(node).not.toBeNull();
    expect(node!.question).toBe("What type of code?");
  });

  it("returns a nested node", () => {
    const node = getNode(testTree, "dx");
    expect(node).not.toBeNull();
  });

  it("returns null for unknown node", () => {
    const node = getNode(testTree, "nonexistent");
    expect(node).toBeNull();
  });
});
