import { NextResponse } from "next/server";
import { execSync } from "child_process";

export async function GET() {
  let commit = "unknown";
  try {
    commit = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    // Ignore git errors (e.g., not a git repo or git not available)
  }

  return NextResponse.json({
    ok: true,
    commit,
    time: new Date().toISOString(),
  });
}
