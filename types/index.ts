/**
 * Core TypeScript interfaces for Nexus/nexus-core
 */

export interface Client {
  id: string;
  name: string;
  created_at: string;
  updated_at?: string;
  priority_score?: number;
  metadata?: Record<string, any>;
}

export interface ClientSummary {
  client_id: string;
  summary_text: string;
  sentiment?: "positive" | "negative" | "neutral";
  key_topics?: string[];
  last_updated: string;
  total_items?: number;
  created_at?: string;
}

export interface TimelineItem {
  id: string;
  client_id: string;
  raw_text: string;
  source: string;
  created_at: string;
  metadata?: Record<string, any>;
  snippet?: string;
}

export interface ForecastEntry {
  client_id: string;
  client_name: string;
  workload_velocity: "critical" | "high" | "medium" | "low";
  velocity_score?: number;
  risk_level?: "critical" | "high" | "medium" | "low";
  risk_factors?: string[];
  demand_level?: "urgent" | "high" | "medium" | "low";
  priority_score?: number;
  scheduling_band?: string;
  breakdown?: {
    operator_priority: number;
    workload_velocity: number;
    demand_forecast: number;
    risk_score: number;
    volatility: number;
  };
}

export interface MeetingEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  description?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  location?: string;
  conferenceData?: {
    conferenceId?: string;
    conferenceSolution?: {
      name?: string;
    };
    entryPoints?: Array<{
      entryPointType?: string;
      uri?: string;
    }>;
  };
}

export interface PortfolioInsights {
  workload_forecast: ForecastEntry[];
  risk_forecast: ForecastEntry[];
  demand_forecast: ForecastEntry[];
  bottleneck_alerts?: Array<{
    client_id: string;
    client_name: string;
    predicted_timeline: string;
    reason: string;
  }>;
  priority_ranking?: ForecastEntry[];
  portfolio_summary?: {
    next_2_weeks_overview: string;
    macro_signals: string[];
    expected_pressure_points: string[];
    recommended_resource_allocation: string;
    priority_focus_clients: string[];
  };
  weekly_time_blocks?: Record<string, {
    focus: string;
    allocated_clients: string[];
    estimated_hours: number;
    tasks?: string[];
  }>;
}

export interface WeeklySchedule {
  week_start: string;
  week_end: string;
  focus_blocks: Array<{
    day: string;
    time_slot: string;
    client_id: string;
    client_name: string;
    priority_score: number;
    tasks: string[];
  }>;
  capacity_summary: {
    total_hours_allocated: number;
    deep_work_hours: number;
    admin_hours: number;
  };
}

export interface KnowledgeChunk {
  id: string;
  item_id: string;
  chunk_index: number;
  content: string;
  embedding?: number[];
  token_count?: number;
  created_at: string;
}

export interface SearchResult {
  id: string;
  content: string;
  similarity?: number;
  item_id: string;
  client_id?: string;
  source?: string;
  created_at: string;
}

export interface IntelOverview {
  client_id: string;
  client_name: string;
  items_last_7d: number;
  items_last_30d: number;
  summary_changes_14d: number;
  sentiment: string;
  priority_score: number;
  last_activity: string;
}
