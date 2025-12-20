// Runtime: Node.js (default)
// Justification: Uses process/env/IO
import { NextResponse, type NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { DailySummaryResponse, DailySummaryData } from "@/app/api/types";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<DailySummaryResponse>> {
  const { id } = await context.params;

  try {
    const publicPath = path.join(process.cwd(), "public", "data", "daily_summary.json");
    const outputPath = path.join(process.cwd(), "output", "daily_summary.json");

    let filePath = publicPath;
    let dataSource: "production" | "local" = "production";

    try {
      await fs.access(publicPath);
    } catch {
      filePath = outputPath;
      dataSource = "local";
    }

    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        {
          status: "not_found",
          error: "Daily summary not found",
          message: "Run the automation script to generate data: python3 scripts/daily_v2.py"
        },
        { status: 404 }
      );
    }

    const fileContent = await fs.readFile(filePath, "utf8");
    const data: DailySummaryData = JSON.parse(fileContent);

    return NextResponse.json({
      status: "ok",
      ...data,
      _metadata: {
        api_version: "1.0",
        data_source: dataSource,
        fetched_at: new Date().toISOString()
      }
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        error: "Failed to load daily summary",
        message: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}