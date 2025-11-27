// app/api/daily-summary/route.ts
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic"; // Always fetch fresh data
export const revalidate = 60; // Cache for 60 seconds

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

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "daily_summary.json");
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { 
          error: "Daily summary not found",
          message: "Run the automation script to generate data: ./run-daily.sh",
          status: "not_found"
        },
        { status: 404 }
      );
    }
    
    // Read and parse file
    const fileContent = await fs.readFile(filePath, "utf8");
    const data: DailySummary = JSON.parse(fileContent);
    
    // Validate data structure
    if (!data.date || !data.summary_bullets || !data.action_items) {
      return NextResponse.json(
        { 
          error: "Invalid data format",
          message: "Daily summary file is corrupted or incomplete",
          status: "invalid_data"
        },
        { status: 500 }
      );
    }
    
    // Add response metadata
    const response = {
      ...data,
      _metadata: {
        fetched_at: new Date().toISOString(),
        api_version: "1.0",
      }
    };
    
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "X-Content-Type-Options": "nosniff",
      }
    });
    
  } catch (err) {
    console.error("Error reading daily_summary.json:", err);
    return NextResponse.json(
      { 
        error: "Failed to load daily summary",
        message: err instanceof Error ? err.message : "Unknown error",
        status: "error"
      },
      { status: 500 }
    );
  }
}
