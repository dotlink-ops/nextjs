// Runtime: Node.js (default)
// Justification: Uses process/env/IO
import { NextResponse, type NextRequest } from "next/server";
import type { PingResponse } from "../types";

export async function GET(request: NextRequest): Promise<NextResponse<PingResponse>> {
  const echo = request.nextUrl.searchParams.get("t");
  return NextResponse.json<PingResponse>({
    ok: true,
    serverTimestamp: new Date().toISOString(),
    echo,
  });
}
