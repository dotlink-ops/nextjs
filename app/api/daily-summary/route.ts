import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    // Adjust this if your file isn't in /data
    const filePath = path.join(process.cwd(), "data", "daily_summary.json");
    const file = await fs.readFile(filePath, "utf8");
    const json = JSON.parse(file);

    return NextResponse.json(json);
  } catch (err) {
    console.error("Error reading daily_summary.json:", err);
    return NextResponse.json(
      { error: "Failed to load daily summary" },
      { status: 500 },
    );
  }
}