import { NextRequest, NextResponse } from "next/server";
import { createMockCodeService } from "@/services/mockCodeService";
import { EMCalculatorInput } from "@/types";

const service = createMockCodeService();

export async function POST(request: NextRequest) {
  const input: EMCalculatorInput = await request.json();
  const result = service.calculateEMLevel(input);
  return NextResponse.json(result);
}
