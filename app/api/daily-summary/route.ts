import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const DAILY_SUMMARY_PATH = path.join(process.cwd(), "data", "daily_summary.json");

export async function GET() {
  try {
    const fileContents = await readFile(DAILY_SUMMARY_PATH, "utf-8");
    const summary = JSON.parse(fileContents);

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Failed to load daily summary", error);
    return NextResponse.json(
      { error: "Failed to load daily summary" },
      { status: 500 }
    );
  }
}
