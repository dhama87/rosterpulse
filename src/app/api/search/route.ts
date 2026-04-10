import { NextRequest, NextResponse } from "next/server";
import { createMockCodeService } from "@/services/mockCodeService";
import { SearchFilters, CodeSystem } from "@/types";

const service = createMockCodeService();

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q") ?? "";
  const system = searchParams.get("system") as CodeSystem | null;
  const category = searchParams.get("category");
  const specialty = searchParams.get("specialty");

  const filters: SearchFilters = {};
  if (system) filters.system = system;
  if (category) filters.category = category;
  if (specialty) filters.specialty = specialty;

  const results = service.search(query, filters);
  return NextResponse.json(results);
}
