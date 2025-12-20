import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Runtime: Node.js (required)
// Justification: Reads filesystem (run.json)
export const runtime = "nodejs";

type AutomationStatus = {
  run_id: string;
  status: "success" | "partial" | "failed";
  started_at: string;
  ended_at: string;
  duration_sec: number;
  demo_mode: boolean;
  steps: Array<{
    stage: string;
    step: string;
    status: string;
    error?: string;
  }>;
  artifacts: Record<string, string>;
};

export async function GET() {
  try {
    const projectRoot = process.cwd();
    const runFile = path.join(projectRoot, "output", "run.json");

    if (!fs.existsSync(runFile)) {
      return NextResponse.json(
        {
          status: "unknown",
          message: "No run.json found. Automation may not have executed yet.",
        },
        { status: 404 }
      );
    }

    const raw = fs.readFileSync(runFile, "utf-8");
    const data = JSON.parse(raw) as AutomationStatus;

    return NextResponse.json(
      {
        ok: true,
        automation: data,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to read automation status",
        detail: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
// Runtime: Node.js (default)
// Justification: Uses process/env/IO
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type GitHubWorkflowRun = {
  id: number;
  status: string;
  conclusion: string | null;
  created_at: string;
  updated_at: string;
  run_started_at: string;
};

type GitHubWorkflowRunsResponse = {
  workflow_runs: GitHubWorkflowRun[];
};

export async function GET() {
  try {
    const owner = 'dotlink-ops';
    const repo = 'nexus-core';
    const workflowId = 'daily-run.yml';
    
    // GitHub API endpoint for workflow runs - fetch last 7
    const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowId}/runs?per_page=7&status=completed`;
    
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'nexus-core-Automation-Status',
    };
    
    // Add GitHub token if available (for higher rate limits)
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    
    const response = await fetch(url, {
      headers,
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
    
    if (!response.ok) {
      console.error('GitHub API error:', response.status, response.statusText);
      return NextResponse.json(
        {
          lastRunTime: '5:00 AM PT (scheduled)',
          lastRunStatus: 'unknown',
          recentRuns: [],
          error: 'Failed to fetch workflow status',
        },
        { status: 500 }
      );
    }
    
    const data = await response.json() as GitHubWorkflowRunsResponse;
    
    if (!data.workflow_runs || data.workflow_runs.length === 0) {
      return NextResponse.json({
        lastRunTime: '5:00 AM PT (scheduled)',
        lastRunStatus: 'unknown',
        recentRuns: [],
        message: 'No workflow runs found',
      });
    }
    
    const latestRun = data.workflow_runs[0];
    
    // Determine status based on conclusion
    let lastRunStatus: 'success' | 'warning' | 'failed';
    if (latestRun.conclusion === 'success') {
      lastRunStatus = 'success';
    } else if (latestRun.conclusion === 'cancelled' || latestRun.conclusion === 'skipped') {
      lastRunStatus = 'warning';
    } else {
      lastRunStatus = 'failed';
    }
    
    // Format the timestamp
    const runDate = new Date(latestRun.run_started_at || latestRun.created_at);
    const now = new Date();
    const diffMs = now.getTime() - runDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    let lastRunTime: string;
    if (diffDays === 0) {
      // Today
      const timeStr = runDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/Los_Angeles',
        hour12: true,
      });
      lastRunTime = `Today · ${timeStr} PT`;
    } else if (diffDays === 1) {
      lastRunTime = 'Yesterday';
    } else {
      lastRunTime = `${diffDays} days ago`;
    }
    
    // Map recent runs to status indicators
    const recentRuns = data.workflow_runs.map(run => {
      if (run.conclusion === 'success') return 'success';
      if (run.conclusion === 'cancelled' || run.conclusion === 'skipped') return 'warning';
      return 'failed';
    });
    
    return NextResponse.json({
      lastRunTime,
      lastRunStatus,
      recentRuns,
      runId: latestRun.id,
      conclusion: latestRun.conclusion,
      updatedAt: latestRun.updated_at,
    });
    
  } catch (error) {
    console.error('Error fetching automation status:', error);
    return NextResponse.json(
      {
        lastRunTime: '5:00 AM PT (scheduled)',
        lastRunStatus: 'unknown',
        recentRuns: [],
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
