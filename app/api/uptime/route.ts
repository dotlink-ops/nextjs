import { NextResponse } from "next/server";

export async function GET() {
  const uptimeSeconds = Math.floor(process.uptime());
  const startedAt = new Date(Date.now() - uptimeSeconds * 1000).toISOString();
  return NextResponse.json({ uptimeSeconds, startedAt, node: process.version });
}
