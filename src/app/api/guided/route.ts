import { NextRequest, NextResponse } from "next/server";
import { createMockCodeService } from "@/services/mockCodeService";

const service = createMockCodeService();

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const nodeId = searchParams.get("nodeId");

  if (!nodeId) {
    return NextResponse.json(service.getGuidedFlowStart());
  }

  const node = service.getGuidedFlowNext(nodeId);
  if (!node) {
    return NextResponse.json({ error: "Node not found" }, { status: 404 });
  }
  return NextResponse.json(node);
}
