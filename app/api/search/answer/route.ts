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

    // ---- 1. Embed query ----
    const embed = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });

    const queryEmbedding = embed.data[0].embedding;

    // ---- 2. Vector search ----
    const supabase = createServiceClient();

    const matches = await supabase.rpc("match_knowledge_chunks", {
      query_embedding: queryEmbedding,
      match_count: limit,
      filter_client: client_id || null,
    });

    if (matches.error) {
      return NextResponse.json(
        { error: "Vector search failed", details: matches.error.message },
        { status: 500 }
      );
    }

    const chunks = matches.data || [];

    // ---- 3. Build context ----
    const context = chunks
      .map((row: any, i: number) => `Chunk ${i + 1}:\n${row.content}`)
      .join("\n\n");

    // ---- 4. Generate answer ----
    const prompt = `
You are the Nexus Intelligence Engine.

Use ONLY the context below to answer the user's question.
If something is not in the context, say you don't have enough information.

### USER QUESTION
${query}

### CONTEXT
${context}

### TASK
Provide:
1. A direct answer (5–8 sentences)
2. Key facts that support your answer (bullets)
3. Confidence score (0–100)
`;

    const answerResp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    const answer = answerResp.choices[0].message.content;

    return NextResponse.json({
      query,
      answer,
      chunks_used: chunks,
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
