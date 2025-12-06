import { NextResponse } from "next/server";
import appPkg from "../../../package.json" assert { type: "json" };
import nextPkg from "next/package.json" assert { type: "json" };
import type { PackageJson } from "../types";

type VersionResponse = {
  name: string;
  version: string;
  next: string;
  node: string;
  timestamp: string;
};

export async function GET(): Promise<NextResponse<VersionResponse | { error: string; details: string }>> {
  try {
    const payload = {
      name: (appPkg as PackageJson).name,
      version: (appPkg as PackageJson).version,
      next: (nextPkg as PackageJson).version,
      node: process.version,
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json<VersionResponse>(payload);
  } catch (err) {
    return NextResponse.json(
      { error: "version lookup failed", details: String(err) },
      { status: 500 }
    );
  }
}
