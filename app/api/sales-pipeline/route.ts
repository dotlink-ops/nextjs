import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

/**
 * GET /api/sales-pipeline
 * 
 * Returns the latest sales pipeline data from automated pulls.
 * Data is refreshed by the sales pipeline automation script.
 */
export async function GET() {
  try {
    // Read sales pipeline data from output directory
    const filePath = join(process.cwd(), "output", "sales_pipeline.json");
    const fileContent = await readFile(filePath, "utf-8");
    const pipelineData = JSON.parse(fileContent);

    // Add metadata
    const response = {
      ...pipelineData,
      _metadata: {
        fetched_at: new Date().toISOString(),
        api_version: "1.0",
      },
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    // If file doesn't exist or can't be read, return demo data
    console.error("Error reading sales pipeline data:", error);

    const demoData = {
      timestamp: new Date().toISOString(),
      source: "demo",
      total_pipeline_value: 250000,
      deals_count: 3,
      deals: [
        {
          id: "DEAL-001",
          name: "Enterprise Platform Migration - Acme Corp",
          value: 85000,
          stage: "Proposal Sent",
          probability: 60,
          close_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          contact: "Sarah Johnson",
          company: "Acme Corp",
        },
        {
          id: "DEAL-002",
          name: "API Integration Services - TechStart Inc",
          value: 45000,
          stage: "Negotiation",
          probability: 75,
          close_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          contact: "Mike Chen",
          company: "TechStart Inc",
        },
        {
          id: "DEAL-003",
          name: "Automation Consulting - Global Solutions",
          value: 120000,
          stage: "Discovery",
          probability: 30,
          close_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          contact: "Emma Davis",
          company: "Global Solutions",
        },
      ],
      metrics: {
        active_deals: 3,
        closed_won: 0,
        avg_deal_size: 83333,
        weighted_pipeline: 84750,
        stages: {
          Discovery: 1,
          "Proposal Sent": 1,
          Negotiation: 1,
        },
      },
      top_opportunities: [
        { name: "Automation Consulting", value: 120000 },
        { name: "Enterprise Platform Migration", value: 85000 },
        { name: "API Integration Services", value: 45000 },
      ],
      _metadata: {
        fetched_at: new Date().toISOString(),
        api_version: "1.0",
        note: "Demo data - run scripts/pull_sales_pipeline.py to generate real data",
      },
    };

    return NextResponse.json(demoData, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  }
}
