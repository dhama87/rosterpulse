import { GuidedNode } from "@/types";

export function getNode(
  tree: Record<string, GuidedNode>,
  nodeId: string
): GuidedNode | null {
  return tree[nodeId] ?? null;
}
