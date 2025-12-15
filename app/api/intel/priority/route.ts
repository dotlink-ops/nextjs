// Runtime: Node.js (default)
// Justification: Uses process/env/IO
import { NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase";

export async function GET() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("priority_heatmap")
    .select("*");

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch priority heatmap", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ priority: data });
}
