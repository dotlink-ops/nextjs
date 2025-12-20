// Runtime: Node.js (default)
// Justification: Uses process/env/IO
import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { createServiceClient } from "@/utils/supabase";
import { buildPortfolioForecastPrompt } from "@/utils/prompts";

export async function GET() {
  try {
    const supabase = createServiceClient();

    // 1. Pull unified portfolio intelligence view
    const { data, error } = await supabase
      .from("global_client_intelligence")
      .select("*");

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch client intelligence", details: error.message },
        { status: 500 }
      );
    }

    const clientIntel = JSON.stringify(data, null, 2);

    // 2. Build AI Prompt
    const prompt = buildPortfolioForecastPrompt({ clientIntel });

    // 3. Call OpenAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    });

    const insights = JSON.parse(response.choices[0].message.content || "{}");

    return NextResponse.json(insights);

  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to generate portfolio forecast", details: err.message },
      { status: 500 }
    );
  }
}
