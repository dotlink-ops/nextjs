// Runtime: Node.js (default)
// Justification: Uses process/env/IO
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Fetch forecast
    const forecastRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/intel/forecast`);
    const forecast = await forecastRes.json();

    // 2. Scoring function
    function scoreClient(client: any) {
      const wv = client.predicted_workload === "critical" ? 1 :
                 client.predicted_workload === "high" ? 0.75 :
                 client.predicted_workload === "medium" ? 0.5 : 0.1;

      const rf = client.predicted_risk === "critical" ? 1 :
                 client.predicted_risk === "high" ? 0.75 :
                 client.predicted_risk === "medium" ? 0.5 : 0.1;

      const df = client.predicted_demand === "urgent" ? 1 :
                 client.predicted_demand === "high" ? 0.75 :
                 client.predicted_demand === "medium" ? 0.5 : 0.1;

      return (
        (client.priority_score ?? 5) * 0.4 +
        wv * 100 * 0.25 +
        df * 100 * 0.15 +
        rf * 100 * 0.15 +
        (client.volatility_index ?? 0) * 5
      );
    }

    // Merge all forecast signals per client
    const merged = forecast.workload_forecast.map((w: any) => {
      const r = forecast.risk_forecast.find((x: any) => x.client_id === w.client_id);
      const d = forecast.demand_forecast.find((x: any) => x.client_id === w.client_id);

      return {
        client_id: w.client_id,
        full_name: w.full_name,
        predicted_workload: w.predicted_workload,
        predicted_risk: r?.predicted_risk,
        predicted_demand: d?.predicted_demand,
        reason: w.reason ?? "",
        risk_factors: r?.risk_factors ?? [],
        driver: d?.driver ?? []
      };
    });

    // Assign scores
    const ranked = merged
      .map((client: any) => ({
        ...client,
        score: scoreClient(client)
      }))
      .sort((a: any, b: any) => b.score - a.score);

    // 3. Timeblock mapping
    function allocate() {
      return {
        Monday: ranked.slice(0, 2),
        Tuesday: ranked.slice(2, 4),
        Wednesday: ranked.slice(4, 6),
        Thursday: ranked.slice(6, 8),
        Friday: ranked.slice(8, 10),
        Saturday: ranked.slice(10, 12),
        Sunday: []
      };
    }

    const schedule = allocate();

    return NextResponse.json({
      generated_at: new Date().toISOString(),
      schedule,
      ranking: ranked
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
