// Runtime: Node.js (default)
// Justification: Uses process/env/IO
import { NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase";

export async function GET() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("global_topic_stats")
    .select("*");

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch topic stats", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ topics: data });
}
