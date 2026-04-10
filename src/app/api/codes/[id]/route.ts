import { NextRequest, NextResponse } from "next/server";
import { createMockCodeService } from "@/services/mockCodeService";

const service = createMockCodeService();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const code = service.getByCode(id);
  if (!code) {
    return NextResponse.json({ error: "Code not found" }, { status: 404 });
  }
  return NextResponse.json(code);
}
