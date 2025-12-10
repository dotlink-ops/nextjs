import { NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase";

export async function GET(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch client", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
