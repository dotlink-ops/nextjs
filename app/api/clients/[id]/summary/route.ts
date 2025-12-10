import { NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("client_summaries")
    .select("*")
    .eq("client_id", params.id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch client summary", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
