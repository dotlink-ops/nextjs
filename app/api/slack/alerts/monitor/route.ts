// Runtime: Node.js (default)
// Justification: Uses process/env/IO
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch forecast
    const forecastRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/intel/forecast`);
    const forecast = await forecastRes.json();

    const alerts: any[] = [];

    // Risk threshold: high / critical
    forecast.risk_forecast?.forEach((r: any) => {
      if (r.predicted_risk === "high" || r.predicted_risk === "critical") {
        alerts.push({
          type: "risk",
          client_id: r.client_id,
          level: r.predicted_risk,
          details: r.risk_factors
        });
      }
    });

    // Demand threshold: urgent
    forecast.demand_forecast?.forEach((d: any) => {
      if (d.predicted_demand === "urgent") {
        alerts.push({
          type: "demand",
          client_id: d.client_id,
          driver: d.driver
        });
      }
    });

    // Sentiment threshold
    forecast.portfolio_summary?.forEach((c: any) => {
      if (c.sentiment < 0.45) {
        alerts.push({
          type: "sentiment",
          client_id: c.client_id,
          sentiment: c.sentiment
        });
      }
    });

    // Volatility threshold: summary changes in last 24h
    forecast.portfolio_summary?.forEach((c: any) => {
      if (c.volatility_index > 3) {
        alerts.push({
          type: "volatility",
          client_id: c.client_id,
          changes: c.volatility_index
        });
      }
    });

    // Workload velocity
    forecast.workload_forecast?.forEach((w: any) => {
      if (w.predicted_workload === "high" || w.predicted_workload === "critical") {
        alerts.push({
          type: "workload",
          client_id: w.client_id,
          level: w.predicted_workload
        });
      }
    });

    if (alerts.length === 0) {
      return NextResponse.json({ ok: true, alerts: [] });
    }

    // Slack notify
    const textLines = ["*🚨 Nexus Alert Monitor — New Alerts Detected*"];

    alerts.forEach((al: any) => {
      textLines.push(`• [${al.type.toUpperCase()}] Client ${al.client_id} → ${JSON.stringify(al)}`);
    });

    await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        channel: process.env.SLACK_USER_ID,
        text: textLines.join("\n")
      })
    });

    return NextResponse.json({ ok: true, alerts });

  } catch (err: any) {
    console.error("Alert monitor error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
