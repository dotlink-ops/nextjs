// app/api/sales-pipeline/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import * as path from "path";

export const dynamic = "force-dynamic"; // Always fetch fresh data
export const revalidate = 300; // Cache for 5 minutes

interface SalesLead {
  id: string;
  company: string;
  contact_name: string;
  email: string;
  phone: string | null;
  stage: string;
  value: number;
  probability: number;
  expected_close_date: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface PipelineMetrics {
  total_leads: number;
  total_value: number;
  weighted_value: number;
  leads_by_stage: Record<string, number>;
  value_by_stage: Record<string, number>;
  avg_deal_size: number;
  conversion_rate: number;
}

interface SalesPipelineData {
  date: string;
  created_at: string;
  source: string;
  leads: SalesLead[];
  metrics: PipelineMetrics;
  metadata: {
    runner_version: string;
    demo_mode: boolean;
    total_leads: number;
  };
}

interface SalesPipelineResponse extends SalesPipelineData {
  status: string;
  error?: string;
  message?: string;
  _metadata?: {
    fetched_at: string;
    api_version: string;
    data_source: string;
  };
}

export async function GET(): Promise<NextResponse<SalesPipelineResponse>> {
  try {
    // Try public/data first (for GitHub Actions deployed version)
    // Fall back to output/ for local development
    const publicPath = path.join(process.cwd(), "public", "data", "sales_pipeline.json");
    const outputPath = path.join(process.cwd(), "output", "sales_pipeline.json");

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
      return NextResponse.json<SalesPipelineResponse>(
        {
          status: "not_found",
          error: "Sales pipeline data not found",
          message: "Run the automation script to generate data: python3 scripts/sales_pipeline_pull.py --demo",
          date: "",
          created_at: "",
          source: "",
          leads: [],
          metrics: {
            total_leads: 0,
            total_value: 0,
            weighted_value: 0,
            leads_by_stage: {},
            value_by_stage: {},
            avg_deal_size: 0,
            conversion_rate: 0,
          },
          metadata: {
            runner_version: "1.0.0",
            demo_mode: false,
            total_leads: 0,
          },
        },
        { status: 404 }
      );
    }

    // Read and parse file
    const fileContent = await fs.readFile(filePath, "utf8");
    const data: SalesPipelineData = JSON.parse(fileContent);

    // Validate data structure
    if (!data.date || !data.leads || !data.metrics) {
      return NextResponse.json<SalesPipelineResponse>(
        {
          status: "invalid_data",
          error: "Invalid data format",
          message: "Sales pipeline file is corrupted or incomplete",
          date: "",
          created_at: "",
          source: "",
          leads: [],
          metrics: {
            total_leads: 0,
            total_value: 0,
            weighted_value: 0,
            leads_by_stage: {},
            value_by_stage: {},
            avg_deal_size: 0,
            conversion_rate: 0,
          },
          metadata: {
            runner_version: "1.0.0",
            demo_mode: false,
            total_leads: 0,
          },
        },
        { status: 500 }
      );
    }

    // Add response metadata
    const response: SalesPipelineResponse = {
      ...data,
      status: "ok",
      _metadata: {
        fetched_at: new Date().toISOString(),
        api_version: "1.0",
        data_source: dataSource,
      }
    };

    return NextResponse.json<SalesPipelineResponse>(response, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "X-Content-Type-Options": "nosniff",
      }
    });

  } catch (err) {
    console.error("Error reading sales_pipeline.json:", err);
    return NextResponse.json<SalesPipelineResponse>(
      {
        status: "error",
        error: "Failed to load sales pipeline data",
        message: err instanceof Error ? err.message : "Unknown error",
        date: "",
        created_at: "",
        source: "",
        leads: [],
        metrics: {
          total_leads: 0,
          total_value: 0,
          weighted_value: 0,
          leads_by_stage: {},
          value_by_stage: {},
          avg_deal_size: 0,
          conversion_rate: 0,
        },
        metadata: {
          runner_version: "1.0.0",
          demo_mode: false,
          total_leads: 0,
        },
      },
      { status: 500 }
    );
  }
}
