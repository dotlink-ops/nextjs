// Runtime: Node.js (default)
// Justification: Uses process/env/IO
import { NextResponse } from "next/server";
import { buildNextActionsPrompt } from "@/utils/prompts";

export async function POST(req: Request) {
  try {
    const { clients } = await req.json();

    if (!clients || clients.length === 0) {
      return NextResponse.json({ actions: [] });
    }

    // Fetch client summaries
    const summaryRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/intel/summaries`);
    const summary = await summaryRes.json();

    // Fetch recent timeline
    const yesterdayISO = new Date(Date.now() - 24*60*60*1000).toISOString();

    const recentRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/timeline/recent`, {
      method: "POST",
      body: JSON.stringify({ since: yesterdayISO }),
      headers: { "Content-Type": "application/json" }
    });
    const recent = await recentRes.json();

    const timelineItems = recent.items || [];

    // Generate next actions using LLM
    const promptData = {
      clients,
      summaries: summary.summaries || [],
      timeline: timelineItems
    };

    const systemPrompt = buildNextActionsPrompt(promptData);

    const payload = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(promptData) }
      ]
    };

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const aiData = await aiRes.json();

    const content = aiData.choices?.[0]?.message?.content || "{}";
    const actions = JSON.parse(content);

    return NextResponse.json(actions);

  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to generate next actions", details: err.message },
      { status: 500 }
    );
  }
}
