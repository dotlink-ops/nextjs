export interface PackageJson {
  name: string;
  version: string;
}

export interface DemoMetadata {
  fetched_at: string;
  type: "demo";
}

export type DemoResponse =
  | {
      status: "ok";
      summary: string;
      log: string;
      _metadata: DemoMetadata;
    }
  | {
      status: "not_found" | "error";
      error: string;
      message?: string;
      summary: string;
      log: string;
    };

export interface DailySummaryData {
  date: string;
  created_at: string;
  repo: string;
  summary_bullets: string[];
  action_items: string[];
  assessment?: string;
  issues_created?: number;
  issues?: Array<{
    number: number;
    title: string;
    url: string;
    labels: string[];
  }>;
  raw_text: string;
  metadata?: {
    runner_version: string;
    demo_mode: boolean;
    notes_count: number;
  };
}

export type DailySummaryResponse =
  | (DailySummaryData & {
      status: "ok";
      _metadata: {
        fetched_at: string;
        api_version: "1.0";
        data_source: "production" | "local";
      };
    })
  | {
      status: "not_found" | "invalid_data" | "error";
      error: string;
      message: string;
    };

export interface StatusResponse {
  ok: boolean;
  ready: boolean;
  name: string;
  version: string;
  next: string;
  node: string;
  uptimeSeconds: number;
  startedAt: string;
  serverTimestamp: string;
}

export interface PingResponse {
  ok: boolean;
  serverTimestamp: string;
  echo: string | null;
}
