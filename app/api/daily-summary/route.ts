// app/api/daily-summary/route.ts
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { DailySummaryResponse, DailySummaryData } from "../types";

export const dynamic = "force-dynamic"; // Always fetch fresh data
export const revalidate = 60; // Cache for 60 seconds

codex/refactor-code-for-clarity-and-structure
interface DailySummary {
  date: string;
  created_at: string;
  repo: string;
  summary_bullets: string[];
  action_items: string[];
  assessment: string;
  issues_created: number;
  issues: Array<{
    number: number;
    title: string;
    url: string;
    labels: string[];
  }>;
  raw_text: string;
  metadata: {
    runner_version: string;
    demo_mode: boolean;
    notes_count: number;
  };
}

const DAILY_SUMMARY_FILENAME = "daily_summary.json";

class DailySummaryNotFoundError extends Error {}
class InvalidDailySummaryError extends Error {}

function buildFilePath(directory: string) {
  return path.join(process.cwd(), directory, DAILY_SUMMARY_FILENAME);
}

async function selectSummaryFile() {
  const publicPath = buildFilePath(path.join("public", "data"));
  const outputPath = buildFilePath("output");

=======
export async function GET(): Promise<NextResponse<DailySummaryResponse>> {
          main
  try {
    await fs.access(publicPath);
    return { filePath: publicPath, dataSource: "production" as const };
  } catch {
    return { filePath: outputPath, dataSource: "local" as const };
  }
}

codex/refactor-code-for-clarity-and-structure
async function readDailySummary(filePath: string) {
  try {
    await fs.access(filePath);
  } catch {
    throw new DailySummaryNotFoundError("Daily summary file is missing");
  }

  const fileContent = await fs.readFile(filePath, "utf8");
  const data: DailySummary = JSON.parse(fileContent);

  if (!data.date || !data.summary_bullets || !data.action_items) {
    throw new InvalidDailySummaryError("Daily summary file is corrupted or incomplete");
  }

  return data;
}

/**
 * Handles the daily summary API endpoint by loading the latest summary data
 * and returning it with metadata that describes the response.
 */
export async function GET(): Promise<NextResponse<DailySummaryResponse>> {
  try {
    const { filePath, dataSource } = await selectSummaryFile();
    const data = await readDailySummary(filePath);

    const response = {

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
    const response: DailySummaryResponse = 
          main
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
    if (err instanceof DailySummaryNotFoundError) {
      return NextResponse.json(
        {
          error: "Daily summary not found",
          message: "Run the automation script to generate data: python3 scripts/daily_v2.py",
          status: "not_found",
        },
        { status: 404 }
      );
    }

    if (err instanceof InvalidDailySummaryError) {
      return NextResponse.json(
        {
          error: "Invalid data format",
          message: err.message,
          status: "invalid_data",
        },
        { status: 500 }
      );
    }

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
