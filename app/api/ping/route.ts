import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const echo = url.searchParams.get("t");
  return NextResponse.json({ ok: true, serverTimestamp: new Date().toISOString(), echo });
}
