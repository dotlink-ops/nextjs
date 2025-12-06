import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

interface DailySummary {
  date: string;
  summary_bullets: string[];
  action_items: string[];
  // add other optional fields if present in your data
  [key: string]: unknown;
}

const DAILY_SUMMARY_FILENAME = "daily_summary.json";

class DailySummaryNotFoundError extends Error {}
class InvalidDailySummaryError extends Error {}

function buildFilePath(...segments: string[]) {
  return path.join(process.cwd(), ...segments, DAILY_SUMMARY_FILENAME);
}

async function selectSummaryFile() {
  const publicPath = buildFilePath("public", "data");
  const outputPath = buildFilePath("output");

  try {
    await fs.access(publicPath);
    return { filePath: publicPath, dataSource: "production" as const };
  } catch {
    return { filePath: outputPath, dataSource: "local" as const };
  }
}

async function readDailySummary(filePath: string) {
  try {
    await fs.access(filePath);
  } catch {
    throw new DailySummaryNotFoundError("Daily summary file is missing");
  }

  const fileContent = await fs.readFile(filePath, "utf8");

  let data: unknown;
  try {
    data = JSON.parse(fileContent);
  } catch (err) {
    throw new InvalidDailySummaryError(
      "Daily summary JSON is invalid: " + (err instanceof Error ? err.message : String(err))
    );
  }

  const record = data as Record<string, unknown>;
  if (
    typeof data !== "object" ||
    data === null ||
    typeof record.date !== "string" ||
    !Array.isArray(record.summary_bullets) ||
    !Array.isArray(record.action_items)
  ) {
    throw new InvalidDailySummaryError(
      "Daily summary file is corrupted or missing required fields (date: string, summary_bullets: array, action_items: array)."
    );
  }

  return data as DailySummary;
}

export async function GET() {
  try {
    const { filePath, dataSource } = await selectSummaryFile();
    const data = await readDailySummary(filePath);

    const response = {
      ...data,
      _metadata: {
        source: dataSource,
        file_path: filePath,
        generated_at: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "max-age=0, s-maxage=60, stale-while-revalidate=3600",
        "X-Content-Type-Options": "nosniff",
      },
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
          message: err instanceof Error ? err.message : String(err),
          status: "invalid_data",
        },
        { status: 500 }
      );
    }

    console.error("Error reading daily_summary.json:", err);
    return NextResponse.json(
      {
        error: "Failed to load daily summary",
        message: err instanceof Error ? err.message : "Unknown error",
        status: "error",
      },
      { status: 500 }
    );
  }
}
