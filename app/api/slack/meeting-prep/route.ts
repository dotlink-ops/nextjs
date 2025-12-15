// Runtime: Node.js (default)
// Justification: Uses process/env/IO
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // 1. Fetch today's meetings
    const meetingsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/calendar/today`);
    const meetings = await meetingsRes.json();

    const scheduleRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/schedule/weekly`);
    const schedule = await scheduleRes.json();

    const forecastRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/intel/forecast`);
    const forecast = await forecastRes.json();

    const items = meetings.events || [];

    // Build message blocks
    const lines = [];
    lines.push(`*📅 Today's Meeting Prep Packets*`);

    for (const ev of items) {
      const title = ev.summary;
      const start = ev.start?.dateTime;

      // Attempt to match event to a client
      const client = schedule.ranking.find((c: any) =>
        title.toLowerCase().includes((c.full_name || "").toLowerCase())
      );

      // Build prep packet
      lines.push(`\n*${title}*`);
      lines.push(`🕒 ${start}`);

      if (client) {
        lines.push(`Client match: *${client.full_name}*`);
        lines.push(`Workload: ${client.predicted_workload}`);
        lines.push(`Risk: ${client.predicted_risk}`);
        lines.push(`Demand: ${client.predicted_demand}`);
      }

      lines.push(`Agenda suggestions:`);
      lines.push(`• Review last 7 days activity`);
      lines.push(`• Validate project scope`);
      lines.push(`• Next-phase actions`);
      lines.push(`• Follow-up commitments`);
    }

    // Send Slack DM
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
    console.error("Meeting Prep:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
