// Runtime: Node.js (default)
// Justification: Uses process/env/IO
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const yesterdayISO = new Date(Date.now() - 24*60*60*1000).toISOString();

    // 1. Fetch timeline events
    const timelineRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/timeline/recent`, {
      method: "POST",
      body: JSON.stringify({ since: yesterdayISO }),
      headers: { "Content-Type": "application/json" }
    });
    const timeline = await timelineRes.json();

    // 2. Fetch forecast updates
    const forecastRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/intel/forecast`);
    const forecast = await forecastRes.json();

    // 3. Fetch weekly schedule
    const weeklyRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/schedule/weekly`);
    const weekly = await weeklyRes.json();

    // Build Slack report
    const lines = [];
    lines.push("*🌙 Nexus Evening Debrief — Your Day in Review*");

    lines.push("\n*📌 Activity Overview (Last 24h):*");
    if (!timeline.items?.length) lines.push("• No activity recorded.");
    else timeline.items.slice(0, 6).forEach((i: any) => lines.push(`• ${i.source}: ${i.snippet}`));

    lines.push("\n*🔍 Forecast Signals:*");
    forecast.risk_forecast
      ?.filter((r: any) => r.predicted_risk === "high" || r.predicted_risk === "critical")
      .slice(0, 3)
      .forEach((r: any) => lines.push(`• Risk: ${r.client_id} — ${r.predicted_risk}`));

    lines.push("\n*📅 Recommended Focus for Tomorrow:*");
    const tomorrow = new Date(Date.now() + 24*60*60*1000).toLocaleString("en-US", { weekday: "long" });
    const focus = weekly.schedule[tomorrow] || [];
    if (focus.length === 0) lines.push("• No scheduled blocks.");
    else focus.forEach((f: any) => lines.push(`• ${f.full_name} — ${f.predicted_workload}`));

    // Slack DM
    await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        channel: process.env.SLACK_USER_ID,
        text: lines.join("\n")
      })
    });

    return NextResponse.json({ ok: true });

  } catch (err: any) {
    console.error("Evening Debrief:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
