// Runtime: Node.js (default)
// Justification: Uses process/env/IO
import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { createServiceClient } from "@/utils/supabase";
import { buildPortfolioForecastPrompt } from "@/utils/prompts";

export async function GET() {
  try {
    const supabase = createServiceClient();

    // 1. Pull forecasting dataset
    const { data, error } = await supabase
      .from("global_forecasting_dataset")
      .select("*");

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch forecasting dataset", details: error.message },
        { status: 500 }
      );
    }

    const dataset = JSON.stringify(data, null, 2);

    // 2. Build enhanced forecasting prompt
    const prompt = buildPortfolioForecastPrompt({ clientIntel: dataset });

    // 3. OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    });

    // 4. Forecast via GPT
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }]
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return NextResponse.json(result);

  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to generate forecast", details: err.message },
      { status: 500 }
    );
  }
}
