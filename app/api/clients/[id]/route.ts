// Runtime: Node.js (default)
// Justification: Uses process/env/IO
import { NextResponse, type NextRequest } from "next/server";
import type { StatusResponse } from "@/app/api/types";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<StatusResponse>> {
  // params are available if needed; not required for this handler
  await context.params;

  return NextResponse.json<StatusResponse>({
    ok: true,
    ready: true,
    name: "nexus-core",
    version: "1.0.0",
    next: "clients/[id]/summary",
    node: process.version,
    uptimeSeconds: Math.floor(process.uptime()),
    startedAt: new Date(Date.now() - process.uptime() * 1000).toISOString(),
    serverTimestamp: new Date().toISOString()
  });
}