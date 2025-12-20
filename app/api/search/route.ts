// Runtime: Node.js (default)
// Justification: Uses process/env/IO
import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { createServiceClient } from "@/utils/supabase";

export async function POST(req: Request) {
  try {
    const { query, client_id, limit = 5 } = await req.json();
    
    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    // 1) Embed the query
    const embed = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });

    const queryEmbedding = embed.data[0].embedding;

    // 2) Initialize Supabase
    const supabase = createServiceClient();

    // 3) Vector similarity search
    const match = await supabase.rpc("match_knowledge_chunks", {
      query_embedding: queryEmbedding,
      match_count: limit,
      filter_client: client_id || null,
    });

    if (match.error) {
      return NextResponse.json(
        { error: "Vector search failed", details: match.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      query,
      results: match.data,
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: "Semantic search failed", details: err.message },
      { status: 500 }
    );
  }
}
