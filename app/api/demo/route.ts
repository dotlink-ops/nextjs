import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { DemoResponse } from "../types";

export const dynamic = "force-dynamic";
export const revalidate = 300; // Cache for 5 minutes (sample data changes less frequently)

export async function GET(): Promise<NextResponse<DemoResponse>> {
  try {
    const base = path.join(process.cwd(), "SAMPLE_OUTPUTS");
    const summaryPath = path.join(base, "daily_runner_summary.txt");
    const logPath = path.join(base, "issue_pipeline_log.txt");

    // Check if directory exists
    try {
      await fs.access(base);
    } catch {
      return NextResponse.json<DemoResponse>(
        {
          status: "not_found",
          error: "Sample outputs not found",
          message: "SAMPLE_OUTPUTS directory is missing",
          summary: "",
          log: "",
        },
        { status: 404 }
      );
    }

    const [summary, log] = await Promise.all([
      fs.readFile(summaryPath, "utf8").catch(() => "Sample summary not available"),
      fs.readFile(logPath, "utf8").catch(() => "Sample log not available"),
    ]);

    return NextResponse.json<DemoResponse>(
      {
        status: "ok",
        summary,
        log,
        _metadata: {
          fetched_at: new Date().toISOString(),
          type: "demo",
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err) {
    console.error("Error reading sample outputs:", err);
    return NextResponse.json<DemoResponse>(
      {
        status: "error",
        error: "Unable to read sample outputs",
        message: err instanceof Error ? err.message : String(err),
        summary: "",
        log: "",
      },
      { status: 500 }
    );
  }
}
