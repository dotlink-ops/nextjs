import { NextResponse } from "next/server";
import appPkg from "../../../package.json" assert { type: "json" };
import nextPkg from "next/package.json" assert { type: "json" };

export async function GET() {
  try {
    const payload = {
      name: (appPkg as any).name,
      version: (appPkg as any).version,
      next: (nextPkg as any).version,
      node: process.version,
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json({ error: "version lookup failed", details: String(err) }, { status: 500 });
  }
}
