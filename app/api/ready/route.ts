// Runtime: Node.js (default)
// Justification: Uses process/env/IO
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ready: true });
}
