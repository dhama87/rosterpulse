import { NextRequest, NextResponse } from "next/server";
import { createMockCodeService } from "@/services/mockCodeService";

const service = createMockCodeService();

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? undefined;

  const results = service.searchDenialCodes(query, type);
  return NextResponse.json(results);
}
