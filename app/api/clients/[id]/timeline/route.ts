import { NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("knowledge_items")
    .select("id, raw_text, source, created_at")
    .eq("client_id", params.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch timeline", details: error.message },
      { status: 500 }
    );
  }

  // Format snippet for display
  const items = data.map((item: any) => ({
    ...item,
    snippet: item.raw_text?.slice(0, 140) + "...",
  }));

  return NextResponse.json({ items });
}
