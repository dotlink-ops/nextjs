/**
 * LLM Prompts Utility
 * Centralized prompt templates for AI-powered features
 */

export interface PortfolioIntelligencePromptData {
  clientIntel: string;
}

export interface NextActionsPromptData {
  clients: any[];
  summaries: any[];
  timeline: any[];
}

/**
 * Portfolio Intelligence / Forecasting Prompt
 * Used by /api/intel/portfolio and /api/intel/forecast
 */
export function buildPortfolioForecastPrompt(data: PortfolioIntelligencePromptData): string {
  return `
You are the Nexus Forecasting Engine v2.0.

You forecast workload, risk, demand, and bottlenecks for all clients based strictly on the dataset below.

### DATASET (JSON array of clients, each with signals)
${data.clientIntel}

### SIGNAL DEFINITIONS
- items_last_7d: Recency-weighted activity (higher means increasing workload)
- items_last_30d: Baseline monthly activity (used to compute velocity)
- summary_changes_14d: Intelligence volatility (higher = shifting requirements)
- sentiment: qualitative risk indicator
- priority_score: operator-defined priority (0–10)
- last_activity: timestamp of last client touchpoint

### DERIVED METRICS TO CALCULATE
For each client, calculate:

1. **Workload Velocity**
   Formula: items_last_7d / (items_last_30d + 1)
   Categories:
     - critical (>0.75)
     - high (0.35–0.75)
     - medium (0.15–0.35)
     - low (<0.15)

2. **Volatility Index**
   Based on summary_changes_14d:
     - critical: >= 4 changes
     - high: 2–3 changes
     - medium: 1 change
     - low: 0 changes

3. **Risk Score**
   Weighted by:
     - negative sentiment (+2)
     - low activity but high volatility (+2)
     - long inactivity (>14 days) (+2)
     - priority_score >= 8 (+1)
   Map total to:
     - critical (≥4)
     - high (3)
     - medium (2)
     - low (0–1)

4. **Demand Forecast**
   Based on:
     - workload velocity
     - volatility index
     - last_activity recency
   Categories:
     - urgent
     - high
     - medium
     - low

5. **Bottleneck Prediction**
   Identify:
     - high workload + high volatility
     - or high volatility + low activity (misalignment)
     - or priority_score >= 9 regardless of activity
   Predict timeline:
     - 1 week
     - 2 weeks
     - 30 days

6. **Client Priority Score (0-100)**
   Formula:
   Client Priority Score = (priority_score × 0.4) + (workload_velocity × 0.25) + (demand_forecast_weight × 0.15) + (risk_weight × 0.15) + (volatility_index × 0.05)
   
   Where:
     - priority_score: operator-defined priority (0-10), normalize to 0-40 range
     - workload_velocity: 0-25 range based on velocity category (critical=25, high=18, medium=10, low=5)
     - demand_forecast_weight: 0-15 range (urgent=15, high=12, medium=8, low=3)
     - risk_weight: 0-15 range (critical=15, high=12, medium=8, low=3)
     - volatility_index: 0-5 range (critical=5, high=4, medium=2, low=1)
   
   Scheduling Bands:
     - 75-100: Must be scheduled early week, morning slots
     - 55-74: Mid-week structured blocks
     - 35-54: Late week
     - 20-34: Flex Friday
     - 0-19: Background tasks only

### OPERATOR CAPACITY CONSTRAINTS
Daily deep work capacity: 3.5 hours
Daily admin/light work: 2 hours
Weekly review: Sunday PM
Flex hours: Saturday AM only
No heavy cognitive load on Friday PM

### TIME-BLOCK ALLOCATION LOGIC
Weekly Schedule Framework:

**Monday**
- High cognition tasks
- Strategic work
- Highest load clients (priority score 75-100)

**Tuesday**
- Execution focus
- System building
- Mid-load clients (priority score 55-74)

**Wednesday**
- Follow-ups
- Deal pushes
- Medium cognition tasks (priority score 55-74)

**Thursday**
- Pipeline acceleration
- Ops tasks
- Lower load work (priority score 35-54)

**Friday**
- Admin tasks
- Light work
- Documentation
- Review (priority score 20-34)

**Saturday (AM only)**
- Overflow from Tuesday/Wednesday
- Optional deep work for urgent items

**Sunday**
- Weekly review
- Forecast sync
- Command Panel regeneration

### OUTPUT FORMAT (JSON)
{
  "workload_forecast": [
    {
      "client_id": "...",
      "client_name": "...",
      "workload_velocity": "critical|high|medium|low",
      "velocity_score": 0.0
    }
  ],
  "risk_forecast": [
    {
      "client_id": "...",
      "client_name": "...",
      "risk_level": "critical|high|medium|low",
      "risk_factors": [...]
    }
  ],
  "demand_forecast": [
    {
      "client_id": "...",
      "client_name": "...",
      "demand_level": "urgent|high|medium|low"
    }
  ],
  "bottleneck_alerts": [
    {
      "client_id": "...",
      "client_name": "...",
      "predicted_timeline": "1 week|2 weeks|30 days",
      "reason": "..."
    }
  ],
  "priority_ranking": [
    {
      "client_id": "...",
      "client_name": "...",
      "priority_score": 0-100,
      "scheduling_band": "early week morning|mid-week blocks|late week|flex friday|background",
      "breakdown": {
        "operator_priority": 0-40,
        "workload_velocity": 0-25,
        "demand_forecast": 0-15,
        "risk_score": 0-15,
        "volatility": 0-5
      }
    }
  ],
  "portfolio_summary": {
    "next_2_weeks_overview": "...",
    "macro_signals": [...],
    "expected_pressure_points": [...],
    "recommended_resource_allocation": "...",
    "priority_focus_clients": [...]
  },
  "weekly_time_blocks": {
    "monday": {
      "focus": "High cognition, strategic work",
      "allocated_clients": [...],
      "estimated_hours": 3.5
    },
    "tuesday": {
      "focus": "Execution, system building",
      "allocated_clients": [...],
      "estimated_hours": 3.5
    },
    "wednesday": {
      "focus": "Follow-ups, deal pushes",
      "allocated_clients": [...],
      "estimated_hours": 3.5
    },
    "thursday": {
      "focus": "Pipeline acceleration, ops tasks",
      "allocated_clients": [...],
      "estimated_hours": 3.5
    },
    "friday": {
      "focus": "Admin, light work, documentation",
      "allocated_clients": [...],
      "estimated_hours": 2.0
    },
    "saturday_am": {
      "focus": "Overflow from Tue/Wed, optional deep work",
      "allocated_clients": [...],
      "estimated_hours": 0
    },
    "sunday": {
      "focus": "Weekly review, forecast sync",
      "tasks": ["Review week", "Regenerate forecasts", "Update command panel"]
    }
  }
}

### INSTRUCTIONS
- Do NOT invent numbers.
- Use only patterns present in the dataset.
- Factor in operator capacity constraints when making recommendations.
- Allocate clients to specific days based on their priority scores and the weekly schedule framework.
- Ensure daily allocations do not exceed capacity (3.5h deep work, 2h admin).
- Explanations must be concise, clear, and operator-oriented.
- All reasoning must be grounded in the dataset.
`;
}

/**
 * Next Actions Generation Prompt
 * Used by /api/actions/generate
 */
export function buildNextActionsPrompt(data: NextActionsPromptData): string {
  return `
You are Nexus, an elite executive operator. 
Generate specific, high-leverage next actions for each client based on:
- focus blocks
- client summaries
- risk & demand signals
- last 24h timeline

Output 3–5 actions per client in JSON format:
{
  "actions": [
    {
      "client_id": "...",
      "client_name": "...",
      "next_actions": [
        "Specific action 1",
        "Specific action 2",
        "Specific action 3"
      ]
    }
  ]
}
`;
}
