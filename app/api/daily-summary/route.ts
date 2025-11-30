// app/api/daily-summary/route.ts
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { DailySummaryResponse, DailySummaryData } from "../types";

export const dynamic = "force-dynamic"; // Always fetch fresh data
export const revalidate = 60; // Cache for 60 seconds

export async function GET(): Promise<NextResponse<DailySummaryResponse>> {
  try {
    // Try public/data first (for GitHub Actions deployed version)
    // Fall back to output/ for local development
    const publicPath = path.join(process.cwd(), "public", "data", "daily_summary.json");
    const outputPath = path.join(process.cwd(), "output", "daily_summary.json");

    let filePath = publicPath;
    let dataSource = "production";

    // Check if public/data version exists
    try {
      await fs.access(publicPath);
    } catch {
      // Fall back to output/ for local development
      filePath = outputPath;
      dataSource = "local";
    }

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json<DailySummaryResponse>(
        {
          status: "not_found",
          error: "Daily summary not found",
          message: "Run the automation script to generate data: python3 scripts/daily_v2.py",
        },
        { status: 404 }
      );
    }

    // Read and parse file
    const fileContent = await fs.readFile(filePath, "utf8");
    const data: DailySummaryData = JSON.parse(fileContent);

    // Validate data structure
    if (!data.date || !data.summary_bullets || !data.action_items) {
      return NextResponse.json<DailySummaryResponse>(
        {
          status: "invalid_data",
          error: "Invalid data format",
          message: "Daily summary file is corrupted or incomplete",
        },
        { status: 500 }
      );
    }

    // Add response metadata
    const response: DailySummaryResponse = {
      ...data,
      status: "ok",
      _metadata: {
        fetched_at: new Date().toISOString(),
        api_version: "1.0",
        data_source: dataSource,
      }
    };

    return NextResponse.json<DailySummaryResponse>(response, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "X-Content-Type-Options": "nosniff",
      }
    });

  } catch (err) {
    console.error("Error reading daily_summary.json:", err);
    return NextResponse.json<DailySummaryResponse>(
      {
        status: "error",
        error: "Failed to load daily summary",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
