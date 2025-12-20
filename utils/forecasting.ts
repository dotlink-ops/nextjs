/**
 * Forecasting Utilities
 * Helper functions for client priority scoring and workload forecasting
 */

export interface ClientForecast {
  client_id: string;
  full_name: string;
  predicted_workload: "critical" | "high" | "medium" | "low";
  predicted_risk: "critical" | "high" | "medium" | "low";
  predicted_demand: "urgent" | "high" | "medium" | "low";
  priority_score?: number;
  volatility_index?: number;
}

/**
 * Calculate client priority score (0-100)
 * Formula: (priority_score × 0.4) + (workload_velocity × 0.25) + (demand × 0.15) + (risk × 0.15) + (volatility × 0.05)
 */
export function calculatePriorityScore(client: ClientForecast): number {
  // Workload velocity weight (0-25)
  const workloadWeight = 
    client.predicted_workload === "critical" ? 25 :
    client.predicted_workload === "high" ? 18 :
    client.predicted_workload === "medium" ? 10 : 5;

  // Risk weight (0-15)
  const riskWeight =
    client.predicted_risk === "critical" ? 15 :
    client.predicted_risk === "high" ? 12 :
    client.predicted_risk === "medium" ? 8 : 3;

  // Demand weight (0-15)
  const demandWeight =
    client.predicted_demand === "urgent" ? 15 :
    client.predicted_demand === "high" ? 12 :
    client.predicted_demand === "medium" ? 8 : 3;

  // Priority score component (0-40)
  const priorityComponent = (client.priority_score ?? 5) * 4;

  // Volatility component (0-5)
  const volatilityComponent = (client.volatility_index ?? 0) * 1;

  return priorityComponent + workloadWeight + demandWeight + riskWeight + volatilityComponent;
}

/**
 * Get scheduling band based on priority score
 */
export function getSchedulingBand(score: number): string {
  if (score >= 75) return "early week morning";
  if (score >= 55) return "mid-week blocks";
  if (score >= 35) return "late week";
  if (score >= 20) return "flex friday";
  return "background";
}

/**
 * Map priority score to day of week
 */
export function getDayForPriority(score: number): string {
  if (score >= 75) return "Monday";
  if (score >= 60) return "Tuesday";
  if (score >= 45) return "Wednesday";
  if (score >= 30) return "Thursday";
  if (score >= 20) return "Friday";
  return "Saturday";
}

/**
 * Calculate workload velocity category
 * Formula: items_last_7d / (items_last_30d + 1)
 */
export function calculateWorkloadVelocity(
  items_last_7d: number,
  items_last_30d: number
): "critical" | "high" | "medium" | "low" {
  const velocity = items_last_7d / (items_last_30d + 1);
  
  if (velocity > 0.75) return "critical";
  if (velocity > 0.35) return "high";
  if (velocity > 0.15) return "medium";
  return "low";
}

/**
 * Calculate volatility index based on summary changes
 */
export function calculateVolatilityIndex(
  summary_changes_14d: number
): "critical" | "high" | "medium" | "low" {
  if (summary_changes_14d >= 4) return "critical";
  if (summary_changes_14d >= 2) return "high";
  if (summary_changes_14d >= 1) return "medium";
  return "low";
}

/**
 * Calculate risk score based on multiple factors
 */
export function calculateRiskScore(params: {
  sentiment: "positive" | "neutral" | "negative";
  items_last_7d: number;
  summary_changes_14d: number;
  last_activity_days: number;
  priority_score: number;
}): "critical" | "high" | "medium" | "low" {
  let riskPoints = 0;

  // Negative sentiment
  if (params.sentiment === "negative") riskPoints += 2;

  // Low activity but high volatility
  if (params.items_last_7d < 2 && params.summary_changes_14d >= 2) riskPoints += 2;

  // Long inactivity
  if (params.last_activity_days > 14) riskPoints += 2;

  // High priority score
  if (params.priority_score >= 8) riskPoints += 1;

  if (riskPoints >= 4) return "critical";
  if (riskPoints === 3) return "high";
  if (riskPoints === 2) return "medium";
  return "low";
}

/**
 * Estimate hours needed for client based on workload
 */
export function estimateHoursNeeded(workload: string): number {
  switch (workload) {
    case "critical": return 3.5;
    case "high": return 2.5;
    case "medium": return 1.5;
    case "low": return 0.5;
    default: return 1.0;
  }
}

/**
 * Check if client should be allocated to a specific day
 */
export function shouldAllocateToDay(
  client: ClientForecast,
  day: string,
  currentCapacity: number,
  maxCapacity: number
): boolean {
  const score = calculatePriorityScore(client);
  const targetDay = getDayForPriority(score);
  const hoursNeeded = estimateHoursNeeded(client.predicted_workload);

  return targetDay === day && (currentCapacity + hoursNeeded) <= maxCapacity;
}
