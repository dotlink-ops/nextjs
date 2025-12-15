// Runtime: Node.js (default)
// Justification: Uses process/env/IO
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const today = new Date().toLocaleString("en-US", { weekday: "long" });

    // 1. Fetch weekly schedule
    const weeklyRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/schedule/weekly`);
    const weekly = await weeklyRes.json();

    const todaysFocus = weekly.schedule[today] ?? [];

    // 2. Fetch full forecast
    const forecastRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/intel/forecast`);
    const forecast = await forecastRes.json();

    // 3. Get top 3 clients by ranking
    const top3 = weekly.ranking.slice(0, 3);

    // 4. Fetch timeline (last 24h)
    const yesterdayISO = new Date(Date.now() - 24*60*60*1000).toISOString();

    const timelineRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/timeline/recent`, {
      method: "POST",
      body: JSON.stringify({ since: yesterdayISO }),
      headers: { "Content-Type": "application/json" }
    });

    const timeline = await timelineRes.json();

    // 5. Build Slack message
    const lines = [];
    lines.push(`*🌅 Good morning, Kamar — here's your Nexus Daily Briefing for ${today}*`);
    lines.push("\n*Top Focus Clients Today:*");

    for (const c of top3) {
      lines.push(`• *${c.full_name}* — Load: ${c.predicted_workload}, Risk: ${c.predicted_risk}, Demand: ${c.predicted_demand}`);
    }

    lines.push(`\n*Today's Main Focus Blocks (${today})*:`);

    if (todaysFocus.length === 0) {
      lines.push(`• No assigned focus blocks today.`);
    } else {
      for (const task of todaysFocus) {
        lines.push(`• *${task.full_name}* — Load: ${task.predicted_workload}, Risk: ${task.predicted_risk}`);
      }
    }

    // Risks
    lines.push(`\n*Pending Risks:*`);

    const risks = forecast.risk_forecast
      ?.filter((r: any) => r.predicted_risk === "high" || r.predicted_risk === "critical")
      ?.slice(0, 3);

    if (!risks?.length) {
      lines.push("• None elevated in the last 24 hours.");
    } else {
      for (const r of risks) {
        lines.push(`• *${r.client_id}* — Risk: ${r.predicted_risk}`);
      }
    }

    // Recent activity
    lines.push(`\n*Recent Activity (Last 24h):*`);
    if (!timeline?.items?.length) {
      lines.push("• No new activity.");
    } else {
      timeline.items.slice(0, 5).forEach((i: any) => {
        lines.push(`• ${i.source}: ${i.snippet}`);
      });
    }

    lines.push(`\n🔗 *Today's Timeline:*`);
    lines.push(`https://www.notion.so/${process.env.NOTION_WEEKLY_PAGE_ID}`);

    // 6. Send Slack DM
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
    console.error("Daily Briefing Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
