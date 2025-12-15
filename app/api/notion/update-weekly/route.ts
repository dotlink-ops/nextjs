// Runtime: Node.js (default)
// Justification: Uses process/env/IO
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // 1. Fetch weekly schedule from Nexus
    const scheduleRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/schedule/weekly`);
    const schedule = await scheduleRes.json();

    // 2. Build Notion blocks from schedule
    const blocks = Object.entries(schedule.schedule).flatMap(([day, tasks]: [string, any]) =>
      [
        {
          object: "block",
          type: "heading_2",
          heading_2: { rich_text: [{ type: "text", text: { content: day } }] }
        },
        ...(tasks as any[]).map((task: any) => ({
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [
              { 
                type: "text", 
                text: { 
                  content: `${task.full_name} — Load: ${task.predicted_workload}, Risk: ${task.predicted_risk}, Demand: ${task.predicted_demand}` 
                }
              }
            ]
          }
        }))
      ]
    );

    // 3. Write into Notion
    const response = await fetch("https://api.notion.com/v1/blocks/" + process.env.NOTION_WEEKLY_PAGE_ID + "/children", {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        children: [
          {
            object: "block",
            type: "heading_1",
            heading_1: {
              rich_text: [
                {
                  type: "text",
                  text: { content: `Weekly Command Panel — Generated ${schedule.generated_at}` }
                }
              ]
            }
          },
          ...blocks
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Notion API error: ${JSON.stringify(errorData)}`);
    }

    return NextResponse.json({ ok: true });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
